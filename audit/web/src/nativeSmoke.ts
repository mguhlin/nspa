// Runs only when the desktop executable is explicitly launched with --smoke-test.
import type { Store } from './audit/state';
import { desktopBridge } from './storage/desktop';
import { encryptAuditToSsat, decryptSsatToAudit } from './crypto/ssat';
import { generateReport, wrapStandaloneHtmlReport } from './reports/generator';
import { createSuggestedActions } from './audit/journey';
export async function runNativeSmoke(store: Store): Promise<void> {
  const bridge = desktopBridge()!;
  const checks: string[] = [];
  try {
    store.startDemoAudit();
    if (!document.querySelector('.journey-list')) throw new Error('Roadmap did not render');
    checks.push('Shared roadmap rendered in real native WebKit window');
    store.navigate('quick');
    if (document.querySelectorAll('.quick-nav-item').length !== 5) throw new Error('Starting questions missing');
    checks.push('Five-question workflow rendered');
    createSuggestedActions(store);
    const doc = store.get().doc!;
    const pass = 'fictional-native-test-only';
    const encrypted = await encryptAuditToSsat(doc, pass);
    await bridge.SaveAudit('native-fictional.ssat', encrypted);
    const opened = await bridge.OpenAudit();
    if (!opened) throw new Error('Native file open failed');
    const decoded = await decryptSsatToAudit(opened.encrypted_ssat, pass);
    if (JSON.stringify(decoded.document) !== JSON.stringify(doc)) throw new Error('Reopened audit differs');
    checks.push('Real WebKit encryption, Go disk save/read, browser decryption round trip');
    let rejected = false;
    try { await bridge.SaveAudit('plaintext.ssat', JSON.stringify(doc)); } catch { rejected = true; }
    if (!rejected) throw new Error('Plaintext save accepted');
    checks.push('Plaintext audit save rejected');
    const report = generateReport(doc, 'executive', 'redacted');
    await bridge.ExportFile('native-summary.html', wrapStandaloneHtmlReport(report, 'FICTIONAL'));
    checks.push('Redacted printable report exported through native file adapter');
    store.navigate('roadmap');
    await bridge.CompleteSmoke(true, JSON.stringify({ passed: true, checks }));
  } catch (err) {
    await bridge.CompleteSmoke(false, JSON.stringify({ passed: false, checks, error: String(err) }));
  }
}
