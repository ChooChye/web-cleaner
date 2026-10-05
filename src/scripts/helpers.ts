export const getElement = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Element #${id} not found`);
  }

  return element as T;
};

export const getCurrentTab = async (): Promise<chrome.tabs.Tab> => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  return tab;
};

export const errorHandler = (error: unknown) => {
  if (error instanceof Error) {
    return `Error: ${error.message}`;
  } else {
    return "An unknown error occurred";
  }
};
