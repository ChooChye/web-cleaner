export class SiteCleaner {
  private readonly tab: chrome.tabs.Tab;

  constructor(tab: chrome.tabs.Tab) {
    this.tab = tab;
  }

  get url(): URL {
    if (!this.tab.url) {
      throw new Error("Tab URL is undefined");
    }

    return new URL(this.tab.url);
  }

  get origin(): string {
    return this.url.origin;
  }

  isSupported(): boolean {
    return ["http:", "https:"].includes(this.url.protocol);
  }

  private assertSupported() {
    if (!this.isSupported()) {
      throw new Error(`Unsupported protocol: ${this.url.protocol}`);
    }
  }

  async clearAllData() {
    this.assertSupported();

    await chrome.browsingData.remove(
      {
        origins: [this.origin],
      },
      {
        cache: true,
        cacheStorage: true,
        cookies: true,
        indexedDB: true,
        localStorage: true,
        serviceWorkers: true,
      },
    );
  }

  async clearCache() {
    this.assertSupported();

    await chrome.browsingData.remove(
      { origins: [this.origin] },
      {
        cache: true,
        cacheStorage: true,
      },
    );
  }

  async clearCookies() {
    this.assertSupported();

    await chrome.browsingData.removeCookies({
      origins: [this.origin],
      since: 0,
    });
  }
}
