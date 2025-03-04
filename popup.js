document.getElementById('update').addEventListener('click', () => {
  // 打开一个新的页面（update.html）
  chrome.tabs.create({ url: chrome.runtime.getURL('update.html') });
});

document.getElementById("fill").addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["defaults.js","fill.js"],
    });
  }
});


document.getElementById('exit').addEventListener('click', () => {
  // 关闭弹出页面
  window.close();
});