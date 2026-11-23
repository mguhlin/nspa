package catalog

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/mguhlin/nspa/audit/go/internal/export"
)

func TestCatalogCompletenessAndScoringParity(t *testing.T) {
	cat, err := Load()
	if err != nil {
		t.Fatalf("Load catalog failed: %v", err)
	}
	if len(cat.Domains) != 10 {
		t.Fatalf("expected 10 domains, got %d", len(cat.Domains))
	}
	if len(cat.Controls) != 30 {
		t.Fatalf("expected 30 controls, got %d", len(cat.Controls))
	}

	demoPath := filepath.Join("..", "..", "..", "fixtures", "demo_organization.json")
	raw, err := os.ReadFile(demoPath)
	if err != nil {
		t.Fatalf("read demo fixture failed: %v", err)
	}
	var doc AuditDoc
	if err := json.Unmarshal(raw, &doc); err != nil {
		t.Fatalf("unmarshal demo fixture failed: %v", err)
	}

	// Fixed reference date matching fixture cycle so staleness is deterministic
	ref := time.Date(2026, 11, 23, 12, 0, 0, 0, time.UTC)
	m := ComputeMetrics(cat, doc, ref)

	if m.AssessedControls != 12 {
		t.Fatalf("expected 12 assessed controls, got %d", m.AssessedControls)
	}
	if m.ApplicableControls != 30 {
		t.Fatalf("expected 30 applicable controls, got %d", m.ApplicableControls)
	}
	if m.NotAssessedControls != 18 {
		t.Fatalf("expected 18 not assessed controls, got %d", m.NotAssessedControls)
	}
	if m.CoveragePercent != 40.0 {
		t.Fatalf("expected 40.0%% coverage, got %.1f%%", m.CoveragePercent)
	}
	// Scores in demo: six 2s (12) + four 1s (4) + two 0s (0) = 16 / 24 = 66.7%
	if m.ReadinessPercent == nil || *m.ReadinessPercent != 66.7 {
		t.Fatalf("expected 66.7%% provisional readiness, got %v", m.ReadinessPercent)
	}
	if !m.IsProvisional {
		t.Fatal("expected IsProvisional = true when coverage < 100%")
	}
	// Critical controls scoring 0/1: DATA-01 (1), IAM-02 (1), IAM-03 (0), VEND-01 (1), CONT-02 (0) => 5
	if m.CriticalGaps != 5 {
		t.Fatalf("expected 5 critical gaps, got %d", m.CriticalGaps)
	}
	if m.StaleEvidenceCount != 1 {
		t.Fatalf("expected 1 stale evidence item (EV-VEND-001), got %d", m.StaleEvidenceCount)
	}
	if m.OpenHighCriticalFindings != 5 {
		t.Fatalf("expected 5 open High/Critical findings, got %d", m.OpenHighCriticalFindings)
	}
}

func TestCSVFormulaNeutralization(t *testing.T) {
	cases := map[string]string{
		"=CMD|' /C calc'!A0": "'=CMD|' /C calc'!A0",
		"+1+2":               "'+1+2",
		"-2+3":               "'-2+3",
		"@SUM(A1:A2)":        "'@SUM(A1:A2)",
		"  =HYPERLINK()":     "'  =HYPERLINK()",
		"Normal text":        "Normal text",
	}
	for input, want := range cases {
		if got := export.SanitizeCSVCell(input); got != want {
			t.Fatalf("SanitizeCSVCell(%q) = %q, want %q", input, got, want)
		}
	}
}
