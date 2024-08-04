function updateTime() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const tabId = tab.id;
    chrome.storage.local.get([String(tabId)], (result) => {
      if (result[tabId] !== undefined) {
        const elapsedTime = result[tabId];
        const seconds = Math.floor(elapsedTime / 1000);
        const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        document.getElementById('time').textContent = `${hours}:${minutes}:${secs}`;
      } else {
        document.getElementById('time').textContent = '00:00:00';
      }
    });
  });
}

setInterval(updateTime, 1000);
