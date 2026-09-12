# WUZHEN — Waterways & Bridges

## 本次修复

### 图片加载
- Hero / Gallery 改为项目本地图片优先，不再依赖 Unsplash / Wikimedia 的图片直链。
- 增加 AVIF / WebP / JPG 多级 fallback。
- Hero 使用 `fetchPriority="high"` + `loading="eager"`。
- Gallery 使用 `loading="lazy"` + `decoding="async"`，避免首屏一次性加载全部图片。
- Gallery 缩略图使用压缩 WebP，Lightbox 点击后再加载 JPG。
- 本地图片失败后，会尝试 `fastly.jsdelivr.net` 镜像；CDN 仍然只是兜底，不会阻塞首屏。
- 删除了仓库内无效的 `hero_wuzhen_day.jpg` 和未使用的超大航拍原图，减少部署体积。

### 其他修复
- 移除 Google Fonts 外链，避免中国大陆访问时字体请求拖慢页面。
- Navbar 图标改用 `import.meta.env.BASE_URL`，修复 GitHub Pages 子路径部署下的相对路径问题。
- 修复 Gallery Lightbox 使用 Hook 的问题：`useState` 改为正确的 `useEffect`。
- 恢复 Gallery 三张图片的 Wikimedia Commons 来源链接和许可信息。
- 增加图片加载后的淡入和 reduced-motion 兼容。

## 更进一步的中国大陆优化

如果部署后发现 GitHub Pages 本身访问速度仍然不理想，建议把 `public/images/` 上传到国内 CDN（例如腾讯云 COS / 阿里云 OSS + CDN），然后把 `Hero.jsx` 和 `Gallery.jsx` 中的 `CDN_ROOT` 改成自己的 CDN 域名。

例如：

```js
const CDN_ROOT = 'https://img.example.com/';
```

这样可以把图片从页面服务器中彻底独立出来。

## 部署

GitHub Pages 工作流会重新执行：

```bash
npm ci
npm run build
```

因此部署时不需要提交 `node_modules`。
