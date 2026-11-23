package export

import "strings"

// SanitizeCSVCell neutralizes spreadsheet formula injection (=, +, -, @, tab, CR)
// identically to web/src/storage/csv.ts.
func SanitizeCSVCell(raw string) string {
	trimmed := strings.TrimLeft(raw, " \t\r\n")
	needsPrefix := false
	if len(raw) > 0 {
		switch raw[0] {
		case '=', '+', '-', '@', '\t', '\r':
			needsPrefix = true
		}
	}
	if !needsPrefix && len(trimmed) > 0 {
		switch trimmed[0] {
		case '=', '+', '-', '@':
			needsPrefix = true
		}
	}
	safe := raw
	if needsPrefix {
		safe = "'" + raw
	}
	if strings.ContainsAny(safe, "\",\r\n") {
		return `"` + strings.ReplaceAll(safe, `"`, `""`) + `"`
	}
	return safe
}
