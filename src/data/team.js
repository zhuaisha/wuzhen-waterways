// Team data for the OUR TEAM section.
//
// Names were supplied by the group in photo-taking order (01..06):
//   01 汪瀚宇  02 蒋盛熠  03 鲁昂  04 朱钟乐  05 沈毅程  06 沈煜程
// Roles and contributions are still editable placeholders — the group fills
// them in.
//
// GROUP_HEADCOUNT is the counter shown at the bottom-right of the group
// photo. The group counts as 7 (one more than the six portrait slots).
const BASE = import.meta.env.BASE_URL;
const img = (key) => ({
  avif: `${BASE}images/${key}-avif.avif`,
  webp: `${BASE}images/${key}-webp.webp`,
  jpg: `${BASE}images/${key}-jpg.jpg`,
});

// One large banner; the smaller size below is referenced from srcSet for phones.
export const GROUP_PHOTO = {
  wide: img('team-group-4096x2048'),
  srcSet: {
    avif: `${BASE}images/team-group-4096x2048-avif.avif 4096w, ${BASE}images/team-group-1120x560-avif.avif 1120w`,
    webp: `${BASE}images/team-group-4096x2048-webp.webp 4096w, ${BASE}images/team-group-1120x560-webp.webp 1120w`,
    jpg: `${BASE}images/team-group-4096x2048-jpg.jpg 4096w, ${BASE}images/team-group-1120x560-jpg.jpg 1120w`,
  },
  alt: '六位组员在校园走廊拍摄的合照',
};

export const GROUP_HEADCOUNT = 7;

// Portrait square (900px, for the detail panel) and avatar (200px, for the row).
export const MEMBERS = [
  {
    n: '01',
    label: 'MEMBER 01',
    name: '汪瀚宇',
    pinyin: 'WANG HANYU',
    role: 'Role — to be filled',
    contribution: 'Contribution — to be filled',
    alt: '汪瀚宇 个人照片',
    sq: img('team-m1-sq-900x900'),
    av: img('team-m1-av-200x200'),
  },
  {
    n: '02',
    label: 'MEMBER 02',
    name: '蒋盛熠',
    pinyin: 'JIANG SHENGYI',
    role: 'Role — to be filled',
    contribution: 'Contribution — to be filled',
    alt: '蒋盛熠 个人照片',
    sq: img('team-m2-sq-900x900'),
    av: img('team-m2-av-200x200'),
  },
  {
    n: '03',
    label: 'MEMBER 03',
    name: '鲁昂',
    pinyin: 'LU ANG',
    role: 'Role — to be filled',
    contribution: 'Contribution — to be filled',
    alt: '鲁昂 个人照片',
    sq: img('team-m3-sq-900x900'),
    av: img('team-m3-av-200x200'),
  },
  {
    n: '04',
    label: 'MEMBER 04',
    name: '朱钟乐',
    pinyin: 'ZHU ZHONGLE',
    role: 'Role — to be filled',
    contribution: 'Contribution — to be filled',
    alt: '朱钟乐 个人照片',
    sq: img('team-m4-sq-900x900'),
    av: img('team-m4-av-200x200'),
  },
  {
    n: '05',
    label: 'MEMBER 05',
    name: '沈毅程',
    pinyin: 'SHEN YICHENG',
    role: 'Role — to be filled',
    contribution: 'Contribution — to be filled',
    alt: '沈毅程 个人照片',
    sq: img('team-m5-sq-900x900'),
    av: img('team-m5-av-200x200'),
  },
  {
    n: '06',
    label: 'MEMBER 06',
    name: '沈煜程',
    pinyin: 'SHEN YUCHENG',
    role: 'Role — to be filled',
    contribution: 'Contribution — to be filled',
    alt: '沈煜程 个人照片',
    sq: img('team-m6-sq-900x900'),
    av: img('team-m6-av-200x200'),
  },
];
