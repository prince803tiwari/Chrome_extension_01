let timers = {};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "startTimer") {
    const tabId = sender.tab.id;
    if (!timers[tabId]) {
      timers[tabId] = { startTime: Date.now(), interval: null };
    }
    if (!timers[tabId].interval) {
      timers[tabId].interval = setInterval(() => {
        const elapsedTime = Date.now() - timers[tabId].startTime;
        chrome.tabs.sendMessage(tabId, { type: "updateTime", time: elapsedTime });
        chrome.storage.local.set({ [tabId]: elapsedTime });
      }, 1000);
    }
  } else if (message.type === "stopTimer") {
    const tabId = sender.tab.id;
    if (timers[tabId] && timers[tabId].interval) {
      clearInterval(timers[tabId].interval);
      timers[tabId].interval = null;
    }
  }
});
