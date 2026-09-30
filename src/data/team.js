// Team data for the OUR TEAM section.
//
// Names were supplied by the group in photo-taking order (01..06):
//   01 蒋盛熠  02 汪瀚宇  03 鲁昂  04 朱钟乐  05 沈毅程  06 沈煜程
// Roles and contributions describe each member's main responsibility
// in the Wuzhen waterways & bridges project.
//
// GROUP_HEADCOUNT is the counter shown at the bottom-right of the group
// photo. It matches the six portrait slots.
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

export const GROUP_HEADCOUNT = 6;

// Portrait square (900px, for the detail panel) and avatar (200px, for the row).
export const MEMBERS = [
  {
    n: '01',
    label: 'MEMBER 01',
    name: '蒋盛熠',
    pinyin: 'JIANG SHENGYI',
    role: 'Project lead',
    contribution:
      'Coordinated the four-week plan, kept the group on schedule, and led the final presentation and Q&A.',
    alt: '蒋盛熠 个人照片',
    sq: img('team-m2-sq-900x900'),
    av: img('team-m2-av-200x200'),
  },
  {
    n: '02',
    label: 'MEMBER 02',
    name: '汪瀚宇',
    pinyin: 'WANG HANYU',
    role: 'Research & mapping',
    contribution:
      'Traced the canal routes and surveyed the bridges, mapping how the waterways connect the old town.',
    alt: '汪瀚宇 个人照片',
    sq: img('team-m1-sq-900x900'),
    av: img('team-m1-av-200x200'),
  },
  {
    n: '03',
    label: 'MEMBER 03',
    name: '鲁昂',
    pinyin: 'LU ANG',
    role: 'Design & web',
    contribution:
      'Built the interactive site — layout, motion and the visual story — and managed the image assets and credits.',
    alt: '鲁昂 个人照片',
    sq: img('team-m3-sq-900x900'),
    av: img('team-m3-av-200x200'),
  },
  {
    n: '04',
    label: 'MEMBER 04',
    name: '朱钟乐',
    pinyin: 'ZHU ZHONGLE',
    role: 'Photography',
    contribution:
      'Shot the on-site photo tour of the canals and bridges, and sourced the images shown throughout the site.',
    alt: '朱钟乐 个人照片',
    sq: img('team-m4-sq-900x900'),
    av: img('team-m4-av-200x200'),
  },
  {
    n: '05',
    label: 'MEMBER 05',
    name: '沈毅程',
    pinyin: 'SHEN YICHENG',
    role: 'Copy & research',
    contribution:
      'Wrote the on-screen text, checked the bridge facts and history, and kept the story accurate.',
    alt: '沈毅程 个人照片',
    sq: img('team-m5-sq-900x900'),
    av: img('team-m5-av-200x200'),
  },
  {
    n: '06',
    label: 'MEMBER 06',
    name: '沈煜程',
    pinyin: 'SHEN YUCHENG',
    role: 'Production & final review',
    contribution:
      'Ran the weekly checklists, prepared the slides and materials, and did the final self-review and peer feedback.',
    alt: '沈煜程 个人照片',
    sq: img('team-m6-sq-900x900'),
    av: img('team-m6-av-200x200'),
  },
];
