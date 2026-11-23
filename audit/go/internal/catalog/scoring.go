package catalog

import (
	_ "embed"
	"encoding/json"
	"math"
	"strings"
	"time"
)

//go:embed controls.v1.json
var rawCatalogJSON []byte

type DomainDef struct {
	DomainID        string `json:"domain_id"`
	Name            string `json:"name"`
	DefaultPriority string `json:"default_priority"`
}

type ControlDef struct {
	ControlID string `json:"control_id"`
	DomainID  string `json:"domain_id"`
	Title     string `json:"title"`
	Priority  string `json:"priority"`
}

type Catalog struct {
	CatalogVersion string       `json:"catalog_version"`
	Domains        []DomainDef  `json:"domains"`
	Controls       []ControlDef `json:"controls"`
}

type Assessment struct {
	ControlID           string   `json:"control_id"`
	Status              string   `json:"status"`
	Score               *int     `json:"score"`
	PriorityOverride    *string  `json:"priority_override"`
	EvidenceIDs         []string `json:"evidence_ids"`
	ReviewMethod        string   `json:"review_method"`
	ReviewerRole        string   `json:"reviewer_role"`
	ReviewDate          string   `json:"review_date"`
	NotApplicableReason string   `json:"not_applicable_reason"`
	NotApplicableScope  string   `json:"not_applicable_scope"`
}

type Evidence struct {
	EvidenceID     string `json:"evidence_id"`
	ArtifactDate   string `json:"artifact_date"`
	EvidenceOrigin string `json:"evidence_origin"`
	Result         string `json:"result"`
	ReviewStatus   string `json:"review_status"`
	FreshnessDays  int    `json:"freshness_days"`
	NextReviewDate string `json:"next_review_date"`
}

type Finding struct {
	FindingID string `json:"finding_id"`
	Severity  string `json:"severity"`
	Status    string `json:"status"`
}

type AuditDoc struct {
	SchemaVersion  string                `json:"schema_version"`
	AuditID        string                `json:"audit_id"`
	CatalogVersion string                `json:"catalog_version"`
	Assessments    map[string]Assessment `json:"assessments"`
	Evidence       []Evidence            `json:"evidence"`
	Findings       []Finding             `json:"findings"`
}

type Metrics struct {
	TotalControls            int
	ApplicableControls       int
	AssessedControls         int
	NotAssessedControls      int
	NAControls               int
	Score0                   int
	Score1                   int
	Score2                   int
	ReadinessPercent         *float64
	CoveragePercent          float64
	IsProvisional            bool
	CriticalGaps             int
	StaleEvidenceCount       int
	OpenHighCriticalFindings int
}

func Load() (Catalog, error) {
	var c Catalog
	err := json.Unmarshal(rawCatalogJSON, &c)
	return c, err
}

func roundOne(n float64) float64 {
	return math.Round(n*10) / 10
}

func IsEvidenceStale(ev Evidence, ref time.Time) bool {
	if ev.ReviewStatus == "stale" {
		return true
	}
	if strings.TrimSpace(ev.NextReviewDate) != "" {
		if d, err := time.Parse("2006-01-02", strings.TrimSpace(ev.NextReviewDate)); err == nil {
			if d.Before(ref) {
				return true
			}
		}
	}
	if strings.TrimSpace(ev.ArtifactDate) != "" && ev.FreshnessDays > 0 {
		if d, err := time.Parse("2006-01-02", strings.TrimSpace(ev.ArtifactDate)); err == nil {
			ageDays := ref.Sub(d).Hours() / 24.0
			if ageDays > float64(ev.FreshnessDays) {
				return true
			}
		}
	}
	return false
}

func validateNA(a Assessment) bool {
	return strings.TrimSpace(a.NotApplicableReason) != "" &&
		strings.TrimSpace(a.NotApplicableScope) != "" &&
		strings.TrimSpace(a.ReviewerRole) != "" &&
		strings.TrimSpace(a.ReviewDate) != ""
}

func effectivePriority(c ControlDef, a Assessment) string {
	if c.Priority == "Critical" {
		return "Critical"
	}
	if a.PriorityOverride != nil && *a.PriorityOverride == "Critical" {
		return "Critical"
	}
	return c.Priority
}

// ComputeMetrics implements the exact Section 4.2 math matching web/src/audit/scoring.ts.
func ComputeMetrics(cat Catalog, doc AuditDoc, ref time.Time) Metrics {
	var m Metrics
	m.TotalControls = len(cat.Controls)

	for _, ev := range doc.Evidence {
		if IsEvidenceStale(ev, ref) {
			m.StaleEvidenceCount++
		}
	}

	for _, f := range doc.Findings {
		if f.Status != "Verified Closed" && f.Status != "Accepted by Authorized Owner" {
			if f.Severity == "Immediate / Critical" || f.Severity == "High" {
				m.OpenHighCriticalFindings++
			}
		}
	}

	scoreSum := 0
	for _, ctrl := range cat.Controls {
		a, ok := doc.Assessments[ctrl.ControlID]
		if !ok {
			continue
		}
		if a.Status == "not_applicable" && validateNA(a) {
			m.NAControls++
			continue
		}
		if a.Status == "assessed" && a.Score != nil && (*a.Score == 0 || *a.Score == 1 || *a.Score == 2) {
			s := *a.Score
			m.AssessedControls++
			scoreSum += s
			switch s {
			case 0:
				m.Score0++
			case 1:
				m.Score1++
			case 2:
				m.Score2++
			}
			if effectivePriority(ctrl, a) == "Critical" && (s == 0 || s == 1) {
				m.CriticalGaps++
			}
		}
	}

	m.ApplicableControls = m.TotalControls - m.NAControls
	m.NotAssessedControls = m.ApplicableControls - m.AssessedControls
	if m.AssessedControls > 0 {
		val := roundOne((float64(scoreSum) / float64(2*m.AssessedControls)) * 100.0)
		m.ReadinessPercent = &val
	}
	if m.ApplicableControls > 0 {
		m.CoveragePercent = roundOne((float64(m.AssessedControls) / float64(m.ApplicableControls)) * 100.0)
	}
	m.IsProvisional = m.AssessedControls < m.ApplicableControls
	return m
}
