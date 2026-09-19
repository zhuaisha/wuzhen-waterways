// Team data for the OUR TEAM section.
//
// Names, roles and contributions are deliberately NOT invented. The photos were
// provided without any roster, so every field is an editable placeholder:
//   - replace `label` with a real name
//   - fill `role` and `contribution` with what the member actually did
// Numbering follows the order the photos were handed over (01..06).
//
// Nothing here attempts to match a member to a person in the group photo:
// the six portraits are too similar to pair up reliably by sight, and a wrong
// mapping would be worse than no mapping.
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

// Portrait square (900px, for the detail panel) and avatar (200px, for the row).
export const MEMBERS = [
  {
    n: '01',
    label: 'MEMBER 01',
    role: 'Role — to be filled',
    contribution: 'Contribution — to be filled',
    alt: '组员 01 个人照片',
    sq: img('team-m1-sq-900x900'),
    av: img('team-m1-av-200x200'),
  },
  {
    n: '02',
    label: 'MEMBER 02',
    role: 'Role — to be filled',
    contribution: 'Contribution — to be filled',
    alt: '组员 02 个人照片',
    sq: img('team-m2-sq-900x900'),
    av: img('team-m2-av-200x200'),
  },
  {
    n: '03',
    label: 'MEMBER 03',
    role: 'Role — to be filled',
    contribution: 'Contribution — to be filled',
    alt: '组员 03 个人照片',
    sq: img('team-m3-sq-900x900'),
    av: img('team-m3-av-200x200'),
  },
  {
    n: '04',
    label: 'MEMBER 04',
    role: 'Role — to be filled',
    contribution: 'Contribution — to be filled',
    alt: '组员 04 个人照片',
    sq: img('team-m4-sq-900x900'),
    av: img('team-m4-av-200x200'),
  },
  {
    n: '05',
    label: 'MEMBER 05',
    role: 'Role — to be filled',
    contribution: 'Contribution — to be filled',
    alt: '组员 05 个人照片',
    sq: img('team-m5-sq-900x900'),
    av: img('team-m5-av-200x200'),
  },
  {
    n: '06',
    label: 'MEMBER 06',
    role: 'Role — to be filled',
    contribution: 'Contribution — to be filled',
    alt: '组员 06 个人照片',
    sq: img('team-m6-sq-900x900'),
    av: img('team-m6-av-200x200'),
  },
];
