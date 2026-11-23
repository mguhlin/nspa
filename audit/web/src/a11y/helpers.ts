import { desktopBridge } from '../storage/desktop';
export function esc(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function nextId(prefix: string, existing: string[]): string {
  let max = 0;
  const re = new RegExp(`^${prefix}-(\\d+)$`);
  for (const id of existing) {
    const m = re.exec(id);
    if (m) {
      const n = Number.parseInt(m[1], 10);
      if (n > max) max = n;
    }
  }
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}

export function formatLocalDate(iso: string | undefined | null): string {
  if (!iso) return 'Not recorded';
  const trimmed = iso.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return trimmed;
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

let liveRegionEl: HTMLElement | null = null;

export function registerLiveRegion(el: HTMLElement | null): void {
  liveRegionEl = el;
}

export function announce(message: string): void {
  if (!liveRegionEl) return;
  liveRegionEl.textContent = '';
  window.setTimeout(() => {
    if (liveRegionEl) liveRegionEl.textContent = message;
  }, 20);
}

export function focusMainHeading(): void {
  const heading = document.querySelector<HTMLElement>('#main h1, #main h2');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: false });
  }
}

export async function triggerDownload(filename: string, content: string | Uint8Array, mimeType: string): Promise<void> {
  const native = desktopBridge();
  if (native) {
    const text = typeof content === 'string' ? content : new TextDecoder().decode(content);
    const path = await native.ExportFile(filename, text);
    if (!path) throw new Error('Save cancelled. Your work is unchanged.');
    return;
  }
  const blobPart: BlobPart =
    typeof content === 'string'
      ? content
      : new Uint8Array(content.buffer.slice(content.byteOffset, content.byteOffset + content.byteLength) as ArrayBuffer);
  const blob = new Blob([blobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadForUser(store: { setStatus(message: string, tone: 'ok' | 'warn'): void }, filename: string, content: string | Uint8Array, mimeType: string): void {
  void triggerDownload(filename, content, mimeType).then(() => store.setStatus(`Saved ${filename}. Review reports before sharing.`, 'ok')).catch(err => store.setStatus(err instanceof Error ? err.message : 'File could not be saved. Try again.', 'warn'));
}
