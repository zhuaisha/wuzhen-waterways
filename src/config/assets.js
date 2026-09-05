/**
 * 图片资源配置
 * 中国大陆访问优化：所有图片本地化，避免海外 CDN 依赖
 */

// 图片基础路径（所有图片都存储在 public/images/ 下）
export const IMAGE_BASE = '/images';

// Hero 背景图
export const HERO_IMAGES = {
  avif: `${IMAGE_BASE}/hero/hero.avif`,
  webp: `${IMAGE_BASE}/hero/hero.webp`,
  jpg: `${IMAGE_BASE}/hero/hero-fallback.jpg`,
};

// Gallery 图片
export const GALLERY_IMAGES = [
  {
    id: 1,
    avif: `${IMAGE_BASE}/gallery/wuzhen-waterway.avif`,
    webp: `${IMAGE_BASE}/gallery/wuzhen-waterway.webp`,
    jpg: `${IMAGE_BASE}/gallery/wuzhen-waterway.jpg`,
    title: 'Wuzhen Waterways',
    num: '01',
    descCn: '水道贯穿乌镇，两岸白墙黛瓦构成典型的江南水乡景观。',
    source: 'Evilbish · Wikimedia Commons · CC BY-SA 3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:WuzhenWaterway.jpg',
    alt: '乌镇水道与沿岸传统建筑',
    wide: true,
  },
  {
    id: 2,
    avif: `${IMAGE_BASE}/gallery/wuzhen-bridge.avif`,
    webp: `${IMAGE_BASE}/gallery/wuzhen-bridge.webp`,
    jpg: `${IMAGE_BASE}/gallery/wuzhen-bridge.jpg`,
    title: 'Ancient Bridge',
    num: '02',
    descCn: '古桥连接水道两岸，是乌镇传统空间与水乡生活的重要节点。',
    source: 'Gerbil · Wikimedia Commons · CC BY-SA 3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Wuzhen_Xizha_2009-13.jpg',
    alt: '乌镇西栅古桥夜景',
  },
  {
    id: 3,
    avif: `${IMAGE_BASE}/gallery/wuzhen-boat.avif`,
    webp: `${IMAGE_BASE}/gallery/wuzhen-boat.webp`,
    jpg: `${IMAGE_BASE}/gallery/wuzhen-boat.jpg`,
    title: 'Boat & Walking',
    num: '03',
    descCn: '乘船看水、沿河步行，是感受乌镇街巷与水乡生活的两种方式。',
    source: 'Wikimedia Commons · CC BY-SA',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Canal_in_Wuzhen.JPG',
    alt: '乌镇运河与传统游船',
  },
];

// 来源页面 URL（仅用于版权标注，不作为图片加载地址）
export const SOURCE_URLS = {
  hero: 'https://commons.wikimedia.org/wiki/File:Aerial_panorama_of_Wuzhen_%E4%B9%8C%E9%95%87_Water_Town._December_2023.jpg',
  waterway: 'https://commons.wikimedia.org/wiki/File:WuzhenWaterway.jpg',
  bridge: 'https://commons.wikimedia.org/wiki/File:Wuzhen_Xizha_2009-13.jpg',
  boat: 'https://commons.wikimedia.org/wiki/File:Canal_in_Wuzhen.JPG',
};

// 备用 CDN（未来可替换为国内 CDN）
export const IMAGE_CDN = ''; // 留空使用本地图片，可替换为 'https://cdn.example.com'

// 图片 URL 构建函数
export const imageUrl = (path) => {
  if (IMAGE_CDN) {
    return `${IMAGE_CDN}${path}`;
  }
  return path;
};
