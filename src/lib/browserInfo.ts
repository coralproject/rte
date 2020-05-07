export interface BrowserInfo {
  macOS: boolean;
}

let browserInfo: BrowserInfo | null = null;

export function getBrowserInfo(): BrowserInfo {
  if (!browserInfo) {
    browserInfo = {
      macOS: /Mac OS X/.test(navigator.userAgent),
    };
  }
  return browserInfo;
}
