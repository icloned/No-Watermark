# AI图片无水印下载器

这是一个浏览器插件，支持Chrome\Edge等浏览器。用于在特定AI图片生成网站上添加无水印下载按钮，让用户可以方便地下载无水印版本的AI生成图片。
![image](https://github.com/user-attachments/assets/6556443e-6e41-4222-a557-58a3bda532e6)


## 功能特点

- 自动识别支持网站上的AI生成图片
- 为宽度大于等于200px的图片添加无水印下载按钮
- 移除图片URL中的水印参数
- 支持动态加载的图片内容
- 使用最小化权限 (`activeTab`, `downloads`) 保证用户安全
- 改进了下载过程中的错误提示，提供更清晰的反馈

## 支持网站

目前支持以下网站：
- 即梦AI (`jimeng.jianying.com`)
- 豆包 (`www.doubao.com`)

## 安装方法

1. 下载此仓库的所有文件到本地文件夹
2. 打开Chrome浏览器，进入扩展程序页面 (chrome://extensions/)
3. 开启右上角的「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择包含插件文件的文件夹

## 使用方法

1. 安装插件后，访问支持的网站
2. 当鼠标悬停在AI生成的图片上时（或图片加载完成后），符合条件的图片左上角会出现「无水印下载」按钮
3. 点击按钮即可下载无水印版本的图片（默认为JPEG格式）

## 文件说明

- `manifest.json`: 插件配置文件，定义了插件的权限、背景脚本、内容脚本等。
- `background.js`: 背景服务工作线程，处理如下载图片等后台任务。
- `content.js`: 内容脚本，负责在目标网站上识别图片、添加下载按钮以及与背景脚本通信。
- `styles.css`: 为下载按钮提供基本样式。
- `icon48.png` 和 `icon128.png`: 插件在浏览器中显示的图标。

## Developer Notes

### 添加对新网站的支持

`content.js` 脚本经过重构，采用了一个名为 `siteConfigs` 的配置数组来简化添加对新AI图片网站的支持。要添加新网站，主要步骤如下：

1.  **修改 `content.js`**:
    *   在 `siteConfigs` 数组中添加一个新的配置对象。该对象应包含：
        *   `id`: 网站的唯一标识符 (例如, `'newsite'`)。
        *   `matchesHostname`: 一个包含主机名或部分主机名字符串的数组，用于识别目标网站 (例如, `['newsite.com', 'ai.newsite.io']`)。
        *   `selectors`: 一个CSS选择器字符串数组，用于定位AI生成的图片元素 (例如, `['img.generated-image', 'div.ai-pic > img']`)。
        *   `customWatermarkRemover` (可选): 一个自定义函数，用于处理特定于该网站的复杂水印移除逻辑。如果未提供，将使用通用的URL参数移除逻辑。

2.  **修改 `manifest.json`**:
    *   将新网站的主机权限添加到 `host_permissions` 数组中 (例如, `"*://*.newsite.com/*"`)。
    *   如果内容脚本需要匹配新的URL模式，请更新 `content_scripts` 部分的 `matches` 数组。

通过这种方式，可以相对容易地扩展插件功能以支持更多网站，而无需对核心逻辑进行大量修改。

## Changelog
- **v1.0.1 (Internal Update)**
  - Fixed an issue where explicitly setting the 'Referer' header for image download requests was causing a console error. This header is no longer set, allowing the browser to handle it automatically, which resolves the error and maintains functionality.

## 注意事项

- 本插件仅供学习和研究使用。
- 请尊重原网站的版权和使用条款。
- 下载的图片仅供个人使用，不得用于商业目的。
- 如果下载失败，插件会尝试提供具体的错误信息。请检查网络连接或稍后重试。
