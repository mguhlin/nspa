export interface DesktopBridge {
  Info(): Promise<{ mode: 'go-local'; version: string; csrf_token: string; default_dir: string }>;
  SaveAudit(name: string, encrypted: string): Promise<string>;
  OpenAudit(): Promise<{ path: string; encrypted_ssat: string } | null>;
  ExportFile(name: string, content: string): Promise<string>;
  SetUnsaved(dirty: boolean): Promise<void>;
  Quit(): Promise<void>;
  SmokeEnabled(): Promise<boolean>;
  CompleteSmoke(passed: boolean, report: string): Promise<void>;
}
export function desktopBridge(): DesktopBridge | null {
  return (window as unknown as { go?: { main?: { Desktop?: DesktopBridge } } }).go?.main?.Desktop || null;
}
