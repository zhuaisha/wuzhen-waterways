// Six chapters of the scroll narrative. Everything here is factual copy for a
// ninth-grade English PBL project — short, readable, and true to Wuzhen.
const BASE = import.meta.env.BASE_URL;
const img = (key) => ({
  webp: `${BASE}images/${key}-webp.webp`,
  avif: `${BASE}images/${key}-avif.avif`,
  jpg: `${BASE}images/${key}-jpg.jpg`,
});

export const CHAPTERS = [
  {
    id: 'chapter-water',
    n: '01',
    en: 'WATER',
    cn: '水',
    lede: 'WATER SHAPES WUZHEN',
    lines: [
      'Canals run through every corner of the town.',
      'They were the roads, and still are.',
    ],
    body:
      'In Wuzhen the water came first. The canals were dug long before the streets were paved, and the houses were built facing them. To move from one side of town to the other, a family might walk along a stone embankment, or take a boat.',
    image: img('waterway'),
    caption: 'The canal carries the whole town.',
    source: '01',
    mask: 'clip-expand',
    bg: 'deep',
    motif: 'ripple',
  },
  {
    id: 'chapter-bridges',
    n: '02',
    en: 'BRIDGES',
    cn: '桥',
    lede: 'BRIDGES LINK TWO BANKS',
    lines: ['Stone arches. Low steps.', 'A crossing, and a view.'],
    body:
      'Wuzhen is criss-crossed by stone bridges. Many are old enough to remember the shape of a different town. A boat must duck beneath them, and a person climbing the steps looks down onto still water. The bridge is the one place where the town has to decide how to meet itself.',
    image: img('bridge'),
    caption: 'A stone arch bridges two banks.',
    source: '02',
    mask: 'clip-bridge',
    bg: 'dark',
    motif: 'bridge-draw',
  },
  {
    id: 'chapter-boats',
    n: '03',
    en: 'BOATS',
    cn: '船',
    lede: 'THE BOAT MOVES FORWARD',
    lines: ['A pole pushes against mud.', 'The water answers.'],
    body:
      'The black-canopied boat — a wupeng — is the slowest and most patient way to travel here. It slips under the low arches, turns a corner, and keeps going. Watching a boat read the town like a sentence: the water is the line it is written on.',
    image: img('boat'),
    caption: 'A boat moves with the current.',
    source: '03',
    mask: 'clip-slide',
    bg: 'image',
    motif: 'current',
  },
  {
    id: 'chapter-life',
    n: '04',
    en: 'LIFE',
    cn: '生活',
    lede: 'LIFE HAPPENS BY WATER',
    lines: ['Laundry at the embankment.', 'Shops, doors, footsteps.'],
    body:
      'People did not build a water town and then move in. They were already there, and the water became the place of daily work — where clothes were washed, where boats were tied up, where neighbours met. The street is the story of that ordinary life, repeated for a thousand mornings.',
    image: img('street'),
    caption: "Daily life happens at the water's edge.",
    source: '04',
    mask: 'clip-rise',
    bg: 'deep',
    motif: 'none',
  },
  {
    id: 'chapter-night',
    n: '05',
    en: 'NIGHT',
    cn: '夜',
    lede: 'THE LIGHTS COME ON',
    lines: ['Lanterns over the water.', 'The town darkens, then glows.'],
    body:
      'When evening falls, Wuzhen changes its colour. The stone cools to blue and the lanterns take over, pouring warm light onto the water and then off it again into reflections. Standing on a bridge at night, it is hard to tell where the town ends and its image begins.',
    image: img('night'),
    caption: 'The town darkens, lights come on.',
    source: '05',
    mask: 'clip-lantern',
    bg: 'near-black',
    motif: 'lantern',
  },
  {
    id: 'chapter-memory',
    n: '06',
    en: 'MEMORY',
    cn: '记忆',
    lede: 'A PLACE SHAPED BY WATER',
    lines: ['bridges, and time.', ''],
    body:
      'The question this project began with — why is water the main line of the ancient town? — is answered by simply watching it work. Water carried the people, the boats, the light and the evening. A town built around water keeps its shape around water, for as long as the canals stay open.',
    image: null,
    caption: '',
    source: '',
    mask: 'none',
    bg: 'deep',
    motif: 'none',
    outro: true,
  },
];

// Sources section numbers that correspond to this chapter's image.
export const CHAPTER_INDEX = CHAPTERS.map((c) => c.n);
