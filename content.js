// 无水印下载器 - 内容脚本

const siteConfigs = [
  {
    id: 'jimeng',
    matchesHostname: ['jimeng.jianying.com'],
    selectors: ['img.preview-img-sccBk_', 'img[data-testid="in_painting_picture"]'],
    // customWatermarkRemover: null // Example for future use
  },
  {
    id: 'doubao',
    matchesHostname: ['www.doubao.com'],
    selectors: ['img.image-DU6JLr'],
    // customWatermarkRemover: null // Example for future use
  }
];

let currentSiteConfig = null;

// 主函数
function main() {
  const currentHostname = window.location.hostname;
  
  for (const config of siteConfigs) {
    if (config.matchesHostname.some(hostname => currentHostname.includes(hostname))) {
      currentSiteConfig = config;
      processSite(config);
      break; // Stop after finding the first match
    }
  }
  
  // Add listener for dynamically loaded content, only if a site is matched
  if (currentSiteConfig) {
    observeDOMChanges();
  }
}

// Process images for a specific configured site
function processSite(config) {
  const images = document.querySelectorAll(config.selectors.join(', '));
  processImages(images, config.id); // Pass siteId to processImages
}

// 处理找到的图片
function processImages(images, siteId) { // siteId is needed for addDownloadButton
  images.forEach(img => {
    // 检查图片是否已经处理过
    if (img.getAttribute('data-processed') === 'true' || !img.src) return;
    
    // 检查图片是否加载完成
    if (!img.complete) {
      img.onload = function() {
        processImageSize(img, siteId);
      };
    } else {
      processImageSize(img, siteId);
    }
  });
}

// 根据图片尺寸处理
function processImageSize(img, siteId) { // siteId is needed for addDownloadButton
  // 检查图片宽度是否大于等于600px
  if (img.naturalWidth >= 600 || img.width >= 600 || img.offsetWidth >= 600) {
    // 标记图片已处理
    img.setAttribute('data-processed', 'true');
    
    // 创建下载按钮
    addDownloadButton(img, siteId);
  }
}

// 添加下载按钮
function addDownloadButton(img, siteId) { // siteId is needed for downloadImageWithoutWatermark
  // 创建按钮容器
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'shuiyin-download-container';
  
  // 创建下载按钮
  const downloadButton = document.createElement('button');
  downloadButton.className = 'shuiyin-download-button';
  downloadButton.textContent = '无水印下载';
  downloadButton.title = '下载无水印图片';
  
  // 添加点击事件
  downloadButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    downloadImageWithoutWatermark(img, siteId); // Pass siteId
  });
  
  // 将按钮添加到容器
  buttonContainer.appendChild(downloadButton);
  
  // 将容器添加到图片父元素
  const parent = img.parentElement;
  if (parent) {
    parent.style.position = parent.style.position || 'relative';
    parent.appendChild(buttonContainer);
  }
}

// 下载无水印图片
function downloadImageWithoutWatermark(img, siteId) { // siteId is available if needed by removeWatermarkParams
  // 获取原始图片URL
  let originalUrl = img.src;
  console.log('原始图片URL:', originalUrl);
  
  // 移除水印参数 - pass siteId if removeWatermarkParams is adapted to use it
  let cleanUrl = removeWatermarkParams(originalUrl, siteId);
  console.log('处理后的URL:', cleanUrl);
  
  // 使用XMLHttpRequest获取图片
  const xhr = new XMLHttpRequest();
  xhr.open('GET', cleanUrl, true);
  xhr.responseType = 'blob';
  
  // 添加必要的请求头
  xhr.setRequestHeader('Accept', 'image/webp,image/apng,image/*,*/*;q=0.8');
  
  xhr.onload = function() {
    if (xhr.status === 200) {
      // 创建下载链接
      const blob = xhr.response;
      
      // 创建图片对象
      const imgElementForCanvas = new Image(); // Renamed to avoid conflict with function parameter 'img'
      imgElementForCanvas.onload = function() {
        // 创建canvas
        const canvas = document.createElement('canvas');
        canvas.width = imgElementForCanvas.width;
        canvas.height = imgElementForCanvas.height;
        
        // 在canvas上绘制图片
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgElementForCanvas, 0, 0);
        
        // 将canvas转换为jpeg格式的blob
        canvas.toBlob(function(jpegBlob) {
          const url = window.URL.createObjectURL(jpegBlob);
          const filename = 'image_' + Date.now() + '.jpg';
          
          // 使用chrome.downloads API下载
          chrome.runtime.sendMessage({
            action: 'downloadImage',
            url: url,
            filename: filename
          }, response => {
            if (response && response.error) {
              console.error('下载失败:', response.error);
              alert('下载失败: ' + response.error);
            }
            // 清理URL对象
            window.URL.revokeObjectURL(url);
          });
        }, 'image/jpeg', 0.95); // 使用95%的质量
      };
      
      // 设置图片源
      imgElementForCanvas.src = window.URL.createObjectURL(blob);
    } else {
      console.error('获取图片失败:', xhr.status);
      alert('Download failed: Could not retrieve image (Status: ' + xhr.status + '). The image may be protected or the URL is incorrect.');
    }
  };
  
  xhr.onerror = function() {
    console.error('请求失败');
    alert('Download failed: Could not fetch image. Please check your network connection or try again later.');
  };
  
  xhr.send();
}

// 移除水印参数
// siteId is passed but not strictly used in this version for internal logic,
// but demonstrates how it would be available if specific rules per siteId were needed.
function removeWatermarkParams(url, siteId) {
  // If a custom remover is defined for the site, use it.
  // This requires currentSiteConfig to be accessible or siteId to be used to find the config.
  // For simplicity in this step, we assume currentSiteConfig is accessible if needed,
  // or that siteId could be used to look up a custom function in siteConfigs.
  // const config = siteConfigs.find(c => c.id === siteId);
  // if (config && config.customWatermarkRemover) {
  //   return config.customWatermarkRemover(url);
  // }

  try {
    // Generic handling based on URL patterns, which covers current sites.
    // This part remains similar to before, as it's host-based.
    // If siteId were used, these conditions could be:
    // if (siteId === 'jimeng' && url.includes('imagex-sign.byteimg.com')) { ... }
    // else if (siteId === 'doubao' && url.includes('dreamina-sign.byteimg.com')) { ... }
    // For now, the URL matching is sufficient.

    if (url.includes('imagex-sign.byteimg.com') || url.includes('dreamina-sign.byteimg.com')) {
      const urlObj = new URL(url);
      const searchParams = urlObj.searchParams;
      // console.log('原始URL参数 (siteId:', siteId, '):', Object.fromEntries(searchParams.entries())); // Example logging with siteId
      
      const newParams = new URLSearchParams();
      for (const [key, value] of searchParams.entries()) {
        if (!key.includes('watermark') && !key.includes('water')) {
          newParams.append(key, value);
        }
      }
      
      let newUrl = urlObj.origin + urlObj.pathname;
      if (newParams.toString()) {
        newUrl += '?' + newParams.toString();
      }
      // console.log('处理后的URL参数 (siteId:', siteId, '):', newParams.toString());
      return newUrl;
    }
    
    return url; // Return original URL if no specific pattern matches
  } catch (error) {
    console.error('Error processing URL for watermark removal:', url, error);
    return url; // 如果处理失败，返回原始URL
  }
}

// 监听DOM变化以处理动态加载的图片
function observeDOMChanges() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            let imagesToProcess = [];
            if (node.tagName === 'IMG') {
              imagesToProcess.push(node);
            } else {
              // Query using the current site's selectors for broader new elements
              // or stick to just finding 'img' tags if processImages is generic enough
              const imgs = node.querySelectorAll('img'); // General approach
              // If we wanted to be very specific to site selectors for dynamic content:
              // const imgs = node.querySelectorAll(currentSiteConfig.selectors.join(','));
              if (imgs.length > 0) {
                imagesToProcess.push(...imgs);
              }
            }
            
            if (imagesToProcess.length > 0 && currentSiteConfig) {
              // Pass currentSiteConfig.id for context if needed by processImages
              processImages(imagesToProcess, currentSiteConfig.id);
            }
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// 启动脚本
main();
