// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadImage') {
    // 使用chrome.downloads API下载图片
    chrome.downloads.download({
      url: request.url,
      filename: request.filename,
      saveAs: true
    }, downloadId => {
      if (chrome.runtime.lastError) {
        console.error('下载错误:', chrome.runtime.lastError);
        sendResponse({ error: chrome.runtime.lastError.message });
      } else {
        console.log('下载成功，ID:', downloadId);
        sendResponse({ success: true, downloadId: downloadId });
      }
    });
    return true; // 保持消息通道开放
  }
}); 