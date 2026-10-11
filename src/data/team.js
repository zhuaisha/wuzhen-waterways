// Team data for the OUR TEAM section.
//
// Names were supplied by the group in photo-taking order (01..06):
//   01 蒋盛熠  02 汪瀚宇  03 鲁昂  04 朱钟乐  05 沈毅程  06 沈煜辰
// Roles and contributions describe each member's main responsibility
// in the Wuzhen waterways & bridges project.
//
// GROUP_HEADCOUNT is the counter shown at the bottom-right of the group
// photo. It matches the six portrait slots.
const BASE = import.meta.env.BASE_URL;
import { assetUrl, assetSrcSet } from '../lib/assets.js';
const img = (key) => ({
  avif: assetUrl(`${BASE}images/${key}-avif.avif`),
  webp: assetUrl(`${BASE}images/${key}-webp.webp`),
  jpg: assetUrl(`${BASE}images/${key}-jpg.jpg`),
});

// One large banner; the smaller size below is referenced from srcSet for phones.
export const GROUP_PHOTO = {
  wide: img('team-group-4096x2048'),
  srcSet: {
    avif: assetSrcSet(`${BASE}images/team-group-4096x2048-avif.avif 4096w, ${BASE}images/team-group-1120x560-avif.avif 1120w`),
    webp: assetSrcSet(`${BASE}images/team-group-4096x2048-webp.webp 4096w, ${BASE}images/team-group-1120x560-webp.webp 1120w`),
    jpg: assetSrcSet(`${BASE}images/team-group-4096x2048-jpg.jpg 4096w, ${BASE}images/team-group-1120x560-jpg.jpg 1120w`),
  },
  alt: '六位组员在校园走廊拍摄的合照',
};

export const GROUP_HEADCOUNT = 6;

// Portrait square (900px, for the detail panel) and avatar (200px, for the row).
export const MEMBERS = [
  {
    n: '01',
    label: 'MEMBER 01',
    name: '蒋盛熠',
    pinyin: 'JIANG SHENGYI',
    roleKey: 'lead',
    alt: '蒋盛熠 个人照片',
    sq: img('team-m2-sq-900x900'),
    av: img('team-m2-av-200x200'),
    audio: `${BASE}audio/team-01-jiang.m4a`,
  },
  {
    n: '02',
    label: 'MEMBER 02',
    name: '汪瀚宇',
    pinyin: 'WANG HANYU',
    roleKey: 'research',
    alt: '汪瀚宇 个人照片',
    sq: img('team-m1-sq-900x900'),
    av: img('team-m1-av-200x200'),
    audio: `${BASE}audio/team-02-wang.m4a`,
  },
  {
    n: '03',
    label: 'MEMBER 03',
    name: '鲁昂',
    pinyin: 'LU ANG',
    roleKey: 'design',
    alt: '鲁昂 个人照片',
    sq: img('team-m3-sq-900x900'),
    av: img('team-m3-av-200x200'),
    audio: `${BASE}audio/team-03-lu.m4a`,
  },
  {
    n: '04',
    label: 'MEMBER 04',
    name: '朱钟乐',
    pinyin: 'ZHU ZHONGLE',
    roleKey: 'photo',
    alt: '朱钟乐 个人照片',
    sq: img('team-m4-sq-900x900'),
    av: img('team-m4-av-200x200'),
    audio: `${BASE}audio/team-04-zhu.m4a`,
  },
  {
    n: '05',
    label: 'MEMBER 05',
    name: '沈毅程',
    pinyin: 'SHEN YICHENG',
    roleKey: 'copy',
    alt: '沈毅程 个人照片',
    sq: img('team-m5-sq-900x900'),
    av: img('team-m5-av-200x200'),
    audio: `${BASE}audio/team-05-shen-yi.m4a`,
  },
  {
    n: '06',
    label: 'MEMBER 06',
    name: '沈煜辰',
    pinyin: 'SHEN YUCHEN',
    roleKey: 'production',
    alt: '沈煜辰 个人照片',
    sq: img('team-m6-sq-900x900'),
    av: img('team-m6-av-200x200'),
    audio: `${BASE}audio/team-06-shen-yu.m4a`,
  },
];
