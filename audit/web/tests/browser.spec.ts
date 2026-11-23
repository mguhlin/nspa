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
    const heroBox = await page.locator('.hero-figure img').boundingBox();
    const startBtnBox = await page.getByRole('button', { name: /Start New Audit/i }).boundingBox();
    expect(heroBox && heroBox.y + heroBox.height <= 760).toBeTruthy();
    expect(startBtnBox && startBtnBox.y + startBtnBox.height <= 760).toBeTruthy();

    // Axe check on Welcome screen
    let axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(axe.violations, `Welcome axe violations: ${JSON.stringify(axe.violations, null, 2)}`).toEqual([]);

    // Verify EVERY top nav button is enabled immediately on load and Settings & About is not clipped
    const disabledNavCount = await page.locator('.nav-tab[disabled]').count();
    expect(disabledNavCount).toBe(0);
    await page.getByText('All tools', { exact: true }).click();
    const settingsBtnBox = await page.getByRole('button', { name: /Settings & About/i }).boundingBox();
    expect(settingsBtnBox && settingsBtnBox.x + settingsBtnBox.width <= 1280).toBeTruthy();

    // Clicking Dashboard immediately from cold load auto-starts an audit and opens Dashboard
    await page.getByRole('button', { name: /^Risk dashboard$/i }).click();
    await expect(page.getByRole('heading', { name: /Scholarship Security Audit Dashboard/i })).toBeVisible();
    await page.getByRole('button', { name: /^Welcome$/i }).click();

    // Load Fictional Practice Audit
    await page.getByRole('button', { name: /Try a fictional example/i }).click();
    await expect(page.getByRole('heading', { name: /Example Scholarship Foundation \(FICTIONAL\)/i })).toBeVisible();

    await page.getByText('All tools', { exact: true }).click();
    await page.getByRole('button', { name: /^Risk dashboard$/i }).click();
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
    await page.getByRole('button', { name: /Full review \(30 questions\)/i }).click();
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
    await page.getByRole('button', { name: /Keep details and view roadmap/i }).click();
    await page.getByText('All tools', { exact: true }).click();
    await page.getByRole('button', { name: /^Risk dashboard$/i }).click();

    const executed = await page.evaluate(() => (window as unknown as Record<string, unknown>).__xss);
    expect(executed).toBeUndefined();
    await expect(page.locator('#main h1')).toContainText('<img src=x');
  });
});

test('Beginner journey keeps unknowns visible, creates editable actions, saves and reopens offline', async ({ page, context }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Start New Audit' }).click();
  await page.locator('[name=display_name]').fill('Fictional Small Scholarship Team');
  await page.locator('[name=auditor_role]').fill('Program director');
  await page.getByRole('button', { name: 'Keep details and view roadmap' }).click();
  await expect(page.locator('.journey-list > li')).toHaveCount(6);
  await expect(page.locator('.tools-panel')).not.toBeVisible();
  await page.getByRole('button', { name: 'Continue the five starting questions' }).click();
  await expect(page.locator('.quick-question h2')).toHaveText('Protect your accounts');
  await page.locator('[name=quick_answer][value="0"]').check();
  await page.getByRole('button', { name: 'Keep answer and continue' }).click();
  await page.locator('[name=quick_answer][value="1"]').check();
  await page.getByRole('button', { name: 'Keep answer and continue' }).click();
  await page.locator('[name=quick_answer][value="unknown"]').check();
  await page.getByRole('button', { name: 'Keep answer and continue' }).click();
  await page.locator('[name=quick_answer][value="0"]').check();
  await page.getByRole('button', { name: 'Keep answer and continue' }).click();
  await page.locator('[name=quick_answer][value="1"]').check();
  await page.getByRole('button', { name: 'Keep answer and view roadmap' }).click();
  await expect(page.locator('.journey-list')).toContainText('4 of 5 assessed');
  await expect(page.locator('.journey-list')).toContainText('4 of 30 assessed');
  await expect(page.locator('.starter-list')).toContainText('Not sure / not assessed');
  let axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(axe.violations).toEqual([]);
  await page.getByRole('button', { name: 'Create suggested actions', exact: true }).click();
  await expect(page.locator('[data-edit-action]')).toHaveCount(4);
  const editor = page.locator('.action-editor').first();
  await editor.locator('summary').click();
  await editor.locator('[name=owner]').fill('Fictional operations lead');
  await editor.locator('[name=target]').fill('2027-01-15');
  await editor.getByRole('button', { name: 'Keep task changes' }).click();
  await expect(page.locator('.data-table')).toContainText('Fictional operations lead');
  await page.getByRole('button', { name: 'Create suggested actions', exact: true }).click();
  await expect(page.locator('[data-edit-action]')).toHaveCount(4);
  // All necessary assets are now loaded. Audit/file/report operations must work offline.
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Save audit', exact: true }).click();
  await page.locator('[name=pass1]').fill('fictional-offline-passphrase');
  await page.locator('[name=pass2]').fill('fictional-offline-passphrase');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#btn-confirm-save').click();
  const download = await downloadPromise;
  const path = await download.path();
  await expect(page.locator('#save-state-pill')).toContainText('Encrypted .ssat saved');
  await page.getByRole('button', { name: 'Lock', exact: true }).click();
  await page.getByRole('button', { name: 'Open saved audit' }).click();
  await page.locator('[name=ssat_file]').setInputFiles(path!);
  await page.locator('[name=open_pass]').fill('fictional-offline-passphrase');
  await page.getByRole('button', { name: 'Decrypt & Open' }).click();
  await expect(page.locator('#main h1')).toContainText('Fictional Small Scholarship Team');
  await expect(page.locator('.journey-list')).toContainText('1 of 4 actions have owners');
  await page.getByRole('button', { name: 'Reports', exact: true }).click();
  await expect(page.locator('#report-preview-root')).toContainText('Fictional operations lead');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'My roadmap', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2)).toBe(false);
  await page.getByRole('button', { name: 'Five starting questions', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2)).toBe(false);
  axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(axe.violations).toEqual([]);
});

test('Native dialog cancellation and disk errors keep the audit and never claim a saved file', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as Record<string, unknown>).go = { main: { Desktop: {
      Info: async () => ({ mode: 'go-local', version: '1.1.0', csrf_token: 'native-desktop', default_dir: '' }),
      SetUnsaved: async () => undefined, SmokeEnabled: async () => false,
      SaveAudit: async () => '', OpenAudit: async () => null,
      ExportFile: async () => { throw new Error('Synthetic disk is full'); }, Quit: async () => undefined
    } } };
  });
  await page.goto('./');
  await expect(page.locator('.brand-caption')).toContainText('Offline desktop edition');
  await page.getByRole('button', { name: 'Start New Audit' }).click();
  await page.locator('[name=display_name]').fill('Fictional Native Cancellation');
  await page.getByRole('button', { name: 'Keep details and view roadmap' }).click();
  await page.getByRole('button', { name: 'Save audit', exact: true }).click();
  await page.locator('[name=pass1]').fill('fictional-native-passphrase');
  await page.locator('[name=pass2]').fill('fictional-native-passphrase');
  await page.locator('#btn-confirm-save').click();
  await expect(page.locator('#dlg-save .dlg-error')).toContainText('Save cancelled');
  await expect(page.locator('#save-state-pill')).toContainText('Unsaved changes');
  await page.locator('[data-close-dlg=dlg-save]').first().click();
  await page.getByRole('button', { name: 'Reports', exact: true }).click();
  await page.getByRole('button', { name: 'Save printable report (HTML)' }).click();
  await expect(page.locator('.status-banner')).toContainText('Synthetic disk is full');
  await page.getByRole('button', { name: 'Welcome', exact: true }).click();
  await page.getByRole('button', { name: 'Open saved audit' }).click();
  await page.locator('[name=open_pass]').fill('fictional-native-passphrase');
  await page.getByRole('button', { name: 'Decrypt & Open' }).click();
  await expect(page.locator('#dlg-open .dlg-error')).toContainText('Open cancelled');
  await page.locator('[data-close-dlg=dlg-open]').first().click();
  await page.getByRole('button', { name: 'My roadmap', exact: true }).click();
  await expect(page.locator('#main h1')).toHaveText('Fictional Native Cancellation');
});

test('Desktop has one quit confirmation; keep working preserves edits and close anyway calls native exit', async ({ page }) => {
  await page.addInitScript(() => {
    const test = window as unknown as { go: unknown; runtime: unknown; quitConfirmations: number; emitClose: () => void };
    let closeHandler = () => {};
    test.quitConfirmations = 0;
    test.emitClose = () => closeHandler();
    test.runtime = { EventsOn: (_event: string, callback: () => void) => { closeHandler = callback; } };
    test.go = { main: { Desktop: {
      Info: async () => ({ mode: 'go-local', version: '1.1.5', csrf_token: 'native-desktop', default_dir: '' }),
      SetUnsaved: async () => undefined, SmokeEnabled: async () => false,
      Quit: async () => closeHandler(), ConfirmQuit: async () => { test.quitConfirmations++; }
    } } };
  });
  await page.goto('./');
  await page.getByRole('button', { name: 'Start New Audit' }).click();
  await page.locator('[name=display_name]').fill('Fictional unsaved edits');
  await page.getByRole('button', { name: 'Quit app', exact: true }).click();
  await expect(page.locator('#dlg-quit')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Keep working', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Keep working', exact: true }).click();
  await expect(page.locator('#dlg-quit')).not.toBeVisible();
  await expect(page.locator('[name=display_name]')).toHaveValue('Fictional unsaved edits');
  await page.evaluate(() => (window as unknown as { emitClose(): void }).emitClose());
  await expect(page.locator('#dlg-quit')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#dlg-quit')).not.toBeVisible();
  await page.getByRole('button', { name: 'Quit app', exact: true }).click();
  await page.getByRole('button', { name: 'Close anyway', exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as { quitConfirmations: number }).quitConfirmations)).toBe(1);
  expect(await page.evaluate(() => {
    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);
    return event.defaultPrevented;
  })).toBe(false);
});
