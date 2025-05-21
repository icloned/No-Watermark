// 无水印下载器 - 内容脚本

// 主函数
function main() {
  // 根据网站URL选择不同的处理方法
  const currentURL = window.location.href;
  
  if (currentURL.includes('jimeng.jianying.com')) {
    handleJimengSite();
  } else if (currentURL.includes('doubao.com')) {
    handleDoubaoSite();
  }
  
  // 添加监听器以处理动态加载的内容
  observeDOMChanges();
}

// 处理即梦网站的图片
function handleJimengSite() {
  const images = document.querySelectorAll('img.preview-img-sccBk_, img[data-testid="in_painting_picture"]');
  processImages(images);
}

// 处理豆包网站的图片
function handleDoubaoSite() {
  const images = document.querySelectorAll('img.image-DU6JLr');
  processImages(images);
}

// 处理找到的图片
function processImages(images) {
  images.forEach(img => {
    // 检查图片是否已经处理过
    if (img.getAttribute('data-processed') === 'true' || !img.src) return;
    
    // 检查图片是否加载完成
    if (!img.complete) {
      img.onload = function() {
        processImageSize(img);
      };
    } else {
      processImageSize(img);
    }
  });
}

// 根据图片尺寸处理
function processImageSize(img) {
  // 检查图片宽度是否大于等于600px
  if (img.naturalWidth >= 600 || img.width >= 600 || img.offsetWidth >= 600) {
    // 标记图片已处理
    img.setAttribute('data-processed', 'true');
    
    // 创建下载按钮
    addDownloadButton(img);
  }
}

// 添加下载按钮
function addDownloadButton(img) {
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
    downloadImageWithoutWatermark(img);
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
function downloadImageWithoutWatermark(img) {
  // 获取原始图片URL
  let originalUrl = img.src;
  console.log('原始图片URL:', originalUrl);
  
  // 移除水印参数
  let cleanUrl = removeWatermarkParams(originalUrl);
  console.log('处理后的URL:', cleanUrl);
  
  // 使用XMLHttpRequest获取图片
  const xhr = new XMLHttpRequest();
  xhr.open('GET', cleanUrl, true);
  xhr.responseType = 'blob';
  
  // 添加必要的请求头
  xhr.setRequestHeader('Accept', 'image/webp,image/apng,image/*,*/*;q=0.8');
  xhr.setRequestHeader('Referer', window.location.href);
  
  xhr.onload = function() {
    if (xhr.status === 200) {
      // 创建下载链接
      const blob = xhr.response;
      
      // 创建图片对象
      const img = new Image();
      img.onload = function() {
        // 创建canvas
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 在canvas上绘制图片
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
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
      img.src = window.URL.createObjectURL(blob);
    } else {
      console.error('获取图片失败:', xhr.status);
      alert('获取图片失败，请稍后重试');
    }
  };
  
  xhr.onerror = function() {
    console.error('请求失败');
    alert('请求失败，请检查网络连接');
  };
  
  xhr.send();
}

// 移除水印参数
function removeWatermarkParams(url) {
  try {
    // 处理即梦网站图片URL
    if (url.includes('imagex-sign.byteimg.com')) {
      const urlObj = new URL(url);
      const searchParams = urlObj.searchParams;
      console.log('原始URL参数:', Object.fromEntries(searchParams.entries()));
      
      // 保留所有原始参数，但移除水印相关参数
      const newParams = new URLSearchParams();
      for (const [key, value] of searchParams.entries()) {
        if (!key.includes('watermark') && !key.includes('water')) {
          newParams.append(key, value);
        }
      }
      
      url = urlObj.origin + urlObj.pathname;
      if (newParams.toString()) {
        url += '?' + newParams.toString();
      }
      console.log('处理后的URL参数:', newParams.toString());
    }
    
    // 处理豆包网站图片URL
    if (url.includes('dreamina-sign.byteimg.com')) {
      const urlObj = new URL(url);
      const searchParams = urlObj.searchParams;
      console.log('原始URL参数:', Object.fromEntries(searchParams.entries()));
      
      // 保留所有原始参数，但移除水印相关参数
      const newParams = new URLSearchParams();
      for (const [key, value] of searchParams.entries()) {
        if (!key.includes('watermark') && !key.includes('water')) {
          newParams.append(key, value);
        }
      }
      
      url = urlObj.origin + urlObj.pathname;
      if (newParams.toString()) {
        url += '?' + newParams.toString();
      }
      console.log('处理后的URL参数:', newParams.toString());
    }
    
    return url;
  } catch (error) {
    console.error('处理URL时出错:', error);
    return url; // 如果处理失败，返回原始URL
  }
}

// 监听DOM变化以处理动态加载的图片
function observeDOMChanges() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        // 检查新添加的节点是否包含图片
        mutation.addedNodes.forEach((node) => {
          // 如果节点是元素节点
          if (node.nodeType === Node.ELEMENT_NODE) {
            // 如果节点是图片
            if (node.tagName === 'IMG') {
              processImages([node]);
            } else {
              // 检查节点内的图片
              const images = node.querySelectorAll('img');
              if (images.length > 0) {
                processImages(images);
              }
            }
          }
        });
      }
    });
  });
  
  // 配置观察器
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// 启动脚本
main();