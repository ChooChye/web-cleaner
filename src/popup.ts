import { SiteCleaner } from "./services/SiteCleaner";
import { getElement, getCurrentTab, errorHandler } from "./scripts/helpers";

const siteElement = getElement<HTMLDivElement>("site");
const clearAllBtn = getElement<HTMLButtonElement>("clearAll");
const clearCacheBtn = getElement<HTMLButtonElement>("clearCache");
const clearCookiesBtn = getElement<HTMLButtonElement>("clearCookies");
const status = getElement<HTMLParagraphElement>("status");

async function Initialize() {
  if (!siteElement || !clearAllBtn || !clearCacheBtn || !clearCookiesBtn || !status) {
    console.error("One or more elements not found in the DOM.");
    return;
  }

  const tab = await getCurrentTab();
  const cleaner = new SiteCleaner(tab);

  const updateSiteInfo = () => {
    siteElement.textContent = cleaner.url.href || "Unknown URL";
  };

  const clearAllData = async () => {
    try {
      await cleaner.clearAllData();
    } catch (error) {
      console.error("Error clearing all data:", error);
      status.textContent = errorHandler(error);
    }
  };

  const clearCache = async () => {
    try {
      await cleaner.clearCache();
    } catch (error) {
      console.error("Error clearing cache:", error);
      status.textContent = errorHandler(error);
    }
  };

  const clearCookies = async () => {
    try {
      await cleaner.clearCookies();
    } catch (error) {
      console.error("Error clearing cookies:", error);
      status.textContent = errorHandler(error);
    }
  };

  clearAllBtn.addEventListener("click", clearAllData);
  clearCacheBtn.addEventListener("click", clearCache);
  clearCookiesBtn.addEventListener("click", clearCookies);
  updateSiteInfo();
}

Initialize();
