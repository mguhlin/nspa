import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('SSAT Browser E2E, Privacy, XSS & Accessibility Checks', () => {
  test('T-07 / T-12 / T-17: Full synthetic workflow, zero external network calls, and WCAG AA axe checks', async ({ page }) => {
    const externalRequests: string[] = [];
    page.on('request', (req) => {
      const url = new URL(req.url());
      if (url.hostname !== '127.0.0.1' && url.hostname !== 'localhost' && url.protocol !== 'data:' && url.protocol !== 'blob:') {
        externalRequests.push(req.url());
      }
    });

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('./');
    await expect(page.getByRole('heading', { name: /Scholarship Security Audit Toolkit/i })).toBeVisible();
    const heroLoaded = await page.locator('.hero-figure img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
    expect(heroLoaded).toBe(true);

    // Axe check on Welcome screen
    let axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(axe.violations, `Welcome axe violations: ${JSON.stringify(axe.violations, null, 2)}`).toEqual([]);

    // Load Fictional Practice Audit
    await page.getByRole('button', { name: /Try Fictional Practice Audit/i }).click();
    await expect(page.getByRole('heading', { name: /Example Scholarship Foundation \(FICTIONAL\)/i })).toBeVisible();

    // Verify Critical gaps appear ABOVE aggregate readiness score & Risk Matrix works interactively
    const critBox = await page.locator('.priority-alert-grid').boundingBox();
    const summaryBox = await page.locator('.summary-bar').boundingBox();
    expect(critBox && summaryBox && critBox.y < summaryBox.y).toBeTruthy();
    await page.locator('[data-matrix-cell="High:High"]').click();
    await expect(page.locator('#main')).toContainText(/Risk Matrix Selection: High Likelihood × High Impact/i);

    // Axe check on Dashboard
    axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(axe.violations, `Dashboard axe violations: ${JSON.stringify(axe.violations, null, 2)}`).toEqual([]);

    // Open Guided Audit & verify Proof Rule blocks Score 2 on unverified control DATA-03
    await page.getByRole('button', { name: /Guided Audit \(30\)/i }).click();
    await page.getByRole('button', { name: /DATA-03/i }).click();
    await page.locator('input[name="score_choice"][value="2"]').check();
    await page.getByRole('button', { name: /Save Control Assessment/i }).click();
    await expect(page.locator('#ctrl-form-error')).toBeVisible();
    await expect(page.locator('#ctrl-form-error')).toContainText(/Score 2 blocked by Proof Rule/i);

    // Axe check on 3-column Guided Audit screen
    axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(axe.violations, `Guided Audit axe violations: ${JSON.stringify(axe.violations, null, 2)}`).toEqual([]);

    // Open Reports & verify Executive Redacted default hides internal:// storage path
    await page.getByRole('button', { name: /^Reports$/i }).click();
    await expect(page.locator('#report-preview-root')).toContainText(/Self-assessment; not a compliance certification/i);
    await expect(page.locator('#report-preview-root')).not.toContainText('internal://sharepoint-sec');

    // Switch to Landscape Audit Rubric
    await page.getByRole('button', { name: /Landscape Audit Rubric/i }).click();
    await expect(page.locator('#report-preview-root')).toContainText(/Landscape Audit Rubric/i);

    // Axe check on Reports screen
    axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(axe.violations, `Reports axe violations: ${JSON.stringify(axe.violations, null, 2)}`).toEqual([]);

    // Check mobile viewport (390px) for horizontal overflow
    await page.setViewportSize({ width: 390, height: 844 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    expect(overflow).toBe(false);

    // Zero external network calls (T-07)
    expect(externalRequests).toEqual([]);
  });

  test('T-10: Live DOM XSS payload is safely escaped and never executes', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: /Start New Audit/i }).click();
    const xss = '<img src=x onerror="window.__xss=1"><script>window.__xss=2</script>';
    await page.locator('input[name="display_name"]').fill(xss);
    await page.getByRole('button', { name: /Save Profile & Scope/i }).click();
    await page.getByRole('button', { name: /^Dashboard$/i }).click();

    const executed = await page.evaluate(() => (window as unknown as Record<string, unknown>).__xss);
    expect(executed).toBeUndefined();
    await expect(page.locator('#main h1')).toContainText('<img src=x');
  });
});
