# PROTECT Rubric v2.0 Privacy Policy Assessor

A standalone GitHub Pages-ready website for manually assessing edtech privacy policies, terms of service, addenda, and security documents using the PROTECT Rubric v2.0.

## Features

- Manual review mode that runs entirely in the browser
- Optional AI Assist configuration page
- Supports secure proxy endpoint, OpenAI, Gemini, or local Ollama endpoint
- Report exports: Markdown, JSON, CSV, PDF, DOCX
- Results infographic exports: PNG, PDF
- No server required for manual mode
- No document text is sent anywhere unless AI Assist is enabled and run

## Pages

- `index.html` — landing page
- `review.html` — manual scoring workspace
- `settings.html` — optional AI Assist configuration
- `report.html` — report preview and exports
- `infographic.html` — visual score summary
- `help.html` — rubric guide and glossary

## GitHub Pages deployment

1. Create a new GitHub repository.
2. Upload all files in this folder.
3. Go to Settings → Pages.
4. Set Source to the main branch and root folder.
5. Open the published GitHub Pages URL.

## AI Assist notes

Manual review is the default. For organizational use, the recommended AI setup is a secure proxy endpoint that stores the API key server-side. Browser-based API keys are easier to expose and should be used only for testing or individual workflows.

The proxy should accept:

```json
{
  "prompt": "rubric prompt and pasted documents",
  "model": "optional model name",
  "temperature": 0.1
}
```

And return one of:

```json
{"text":"..."}
```

```json
{"result":"..."}
```

```json
{"content":"..."}
```

## Disclaimer

This tool provides a structured first impression, not legal advice. Human review is required, especially when using AI-assisted draft scoring.
