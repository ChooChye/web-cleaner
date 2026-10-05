import { SiteCleaner } from "./services/SiteCleaner";
import { getElement, getCurrentTab, errorHandler } from "./scripts/helpers";

const siteCard = getElement<HTMLElement>("siteCard");
const siteIcon = getElement<HTMLSpanElement>("siteIcon");
const siteElement = getElement<HTMLParagraphElement>("site");
const siteNote = getElement<HTMLParagraphElement>("siteNote");
const clearAllBtn = getElement<HTMLButtonElement>("clearAll");
const clearCacheBtn = getElement<HTMLButtonElement>("clearCache");
const clearCookiesBtn = getElement<HTMLButtonElement>("clearCookies");
const status = getElement<HTMLParagraphElement>("status");

const buttons = [clearAllBtn, clearCacheBtn, clearCookiesBtn];

const ICON_ATTRS = `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`;
const CHECK_ICON = `<svg ${ICON_ATTRS}><path d="M20 6 9 17l-5-5"/></svg>`;
const ALERT_ICON = `<svg ${ICON_ATTRS}><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`;

const setStatus = (message: string, tone: "ok" | "error") => {
  status.className = `status is-${tone}`;
  status.innerHTML = tone === "ok" ? CHECK_ICON : ALERT_ICON;
  status.append(message);
};

const setSiteIcon = (host: string, favIconUrl?: string) => {
  const showInitial = () => {
    siteIcon.textContent = host.charAt(0).toUpperCase();
  };

  if (!favIconUrl) {
    showInitial();
    return;
  }

  const img = document.createElement("img");
  img.src = favIconUrl;
  img.alt = "";
  img.addEventListener("error", showInitial);
  siteIcon.replaceChildren(img);
};

const showUnsupported = () => {
  siteCard.classList.add("is-unsupported");
  siteIcon.textContent = "?";
  siteElement.textContent = "No website on this tab";
  siteNote.textContent = "Works on http and https pages only.";
  siteNote.hidden = false;
};

const sweep = () => {
  siteCard.classList.remove("is-swept");
  void siteCard.offsetWidth; // restart the animation on repeat clicks
  siteCard.classList.add("is-swept");
};

async function Initialize() {
  const tab = await getCurrentTab();
  const cleaner = new SiteCleaner(tab);

  if (!tab.url || !cleaner.isSupported()) {
    showUnsupported();
    return;
  }

  const { host, href } = cleaner.url;
  siteElement.textContent = host;
  siteElement.title = href;
  setSiteIcon(host, tab.favIconUrl);

  const run = async (button: HTMLButtonElement, clear: () => Promise<void>, done: string) => {
    const label = button.querySelector(".btn-label");
    const originalLabel = label?.textContent ?? "";

    buttons.forEach((btn) => (btn.disabled = true));
    button.setAttribute("aria-busy", "true");
    if (label) label.textContent = "Clearing…";

    try {
      await clear();
      setStatus(`${done} for ${host}`, "ok");
      sweep();
    } catch (error) {
      console.error("Error clearing site data:", error);
      setStatus(errorHandler(error), "error");
    } finally {
      if (label) label.textContent = originalLabel;
      button.removeAttribute("aria-busy");
      buttons.forEach((btn) => (btn.disabled = false));
    }
  };

  clearAllBtn.addEventListener("click", () => run(clearAllBtn, () => cleaner.clearAllData(), "Cleared all site data"));
  clearCacheBtn.addEventListener("click", () => run(clearCacheBtn, () => cleaner.clearCache(), "Cleared cache"));
  clearCookiesBtn.addEventListener("click", () => run(clearCookiesBtn, () => cleaner.clearCookies(), "Cleared cookies"));

  buttons.forEach((btn) => (btn.disabled = false));
}

Initialize();
