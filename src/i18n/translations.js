// Unified bilingual data for the Wuzhen site.
// Every visible string on the site lives here — both languages, shipped with
// the build (no runtime translation, no external API).
//
// Usage:
//   const { t, lang } = useT();
//   t('nav.story')            -> 'Story'  / '故事'
//   t('chapters.body.water')  -> chapter body text in the active language
//
// Components never write `lang === 'zh' ? '中文' : 'English'` themselves;
// they pull from this table so switching is a single re-render pass.

export const translations = {
  /* ---------------- NAVBAR ---------------- */
  nav: {
    en: {
      story: 'Story',
      water: 'Water',
      bridges: 'Bridges',
      facts: 'Facts',
      gallery: 'Gallery',
      history: 'History',
      team: 'Team',
      explore: 'Explore',
      menu: 'Toggle menu',
      language: 'Language',
    },
    zh: {
      story: '故事',
      water: '水道',
      bridges: '桥',
      facts: '事实',
      gallery: '影像',
      history: '历史',
      team: '团队',
      explore: '探索',
      menu: '打开菜单',
      language: '语言',
    },
  },

  /* ---------------- HERO ---------------- */
  hero: {
    en: {
      sub: 'Waterways & Bridges',
      tag: '水乡乌镇 · 水，是这座古镇的主线',
      scroll: 'Scroll to explore',
      meetTeam: 'Meet Our Team',
      alt: 'Wuzhen water town at dusk — stone bridges spanning a broad canal, stilted houses with white walls and dark tile roofs, boats moored along the waterway',
    },
    zh: {
      sub: '水道与桥',
      tag: '水乡乌镇 · 水，是这座古镇的主线',
      scroll: '向下探索',
      meetTeam: '认识我们的团队',
      alt: '黄昏中的乌镇水乡 — 石拱桥横跨宽阔的水道，白墙黛瓦的吊脚楼，停泊在水边的船',
    },
  },

  /* ---------------- CHAPTERS (Story) ---------------- */
  // Chapter structure (title + lede lines + body) is bilingual per chapter.
  // `id` matches chapters.js `id` minus the 'chapter-' prefix.
  chapters: {
    water: {
      en: {
        title: 'WATER',
        lines: [
          'Water runs through every part of the town.',
          'The canals were the first roads, and still are.',
        ],
        body: 'In Wuzhen, water came before everything else. The canals were dug long before the streets were built. Houses were built facing the water, not the road. To go from one side of town to the other, a family could walk along the stone canal edge, or take a small boat. The water was not just for drinking or washing — it was the way people moved through their town, and it still is.',
        caption: 'The canal carries the whole town.',
      },
      zh: {
        title: '水',
        lines: ['水穿过城镇的每一个角落。', '水道是最早的道路，如今依然如此。'],
        body: '在乌镇，水比一切都更早出现。水道比街道开凿得更早。房子朝向水，而不是朝向路。要从城镇的一边到另一边，一家人可以沿着石砌的河边走，也可以坐小船。水不只是为了喝和洗 — 它是人们穿过这座城的方式，而且它仍然如此。',
        caption: '水道承载着整座古镇。',
      },
    },
    bridges: {
      en: {
        title: 'BRIDGES',
        lines: ['Stone arches. Low steps.', 'A crossing, and a view.'],
        body: 'Wuzhen is full of stone bridges. Many of them are very old — older than most of the houses around them. A boat has to bend low to go under them. When you climb the steps, you can look down at the still water below and see the sky reflected on the surface. The bridge is where the two sides of town meet, and the best place to watch boats pass by.',
        caption: 'A stone arch bridges two banks.',
      },
      zh: {
        title: '桥',
        lines: ['石拱。低台阶。', '一道跨越，一处风景。'],
        body: '乌镇的石桥很多，而且都很古老 — 有的比周围的房子还要老。小船必须压低船身才能从桥下穿过。爬上台阶，可以俯瞰脚下平静的水面，看见天空倒映在水上。桥是城镇两岸相遇的地方，也是看船经过的最佳位置。',
        caption: '一座石拱桥连接着两岸。',
      },
    },
    boats: {
      en: {
        title: 'BOATS',
        lines: ['A pole pushes against mud.', 'The water answers.'],
        body: 'The black-covered boat — called a wupeng — is the slowest way to travel here, and maybe the best. It goes under the low bridges, turns a corner, and keeps moving at a peaceful pace. The boat person uses a long pole to push against the bottom of the canal. Watching a boat is like reading the town: the water is the line, and the boat is the word. There is no hurry — you just sit and enjoy the ride.',
        caption: 'A boat moves with the current.',
      },
      zh: {
        title: '船',
        lines: ['船篙一点泥。', '水乡自有回应。'],
        body: '乌篷船是这里最慢的出行方式，也许也是最好的。它从低桥下穿过，拐过弯，平静地前行。船夫用长长的船篙撑住河底。看船，就像在读这座城：水是行，船是字。不必着急 — 坐着享受这段水路就好。',
        caption: '船顺水而行，缓缓向前。',
      },
    },
    life: {
      en: {
        title: 'LIFE',
        lines: ['Laundry at the embankment.', 'Shops, doors, footsteps.'],
        body: 'People did not build a water town and then move in. They were already living there, and the water became part of daily life — where clothes were washed, where boats were tied up, where neighbors met and talked. Shops opened their doors toward the canal, and children played on the stone steps beside the water. The street tells the story of that ordinary life, repeated every single morning for a thousand years.',
        caption: "Daily life happens at the water's edge.",
      },
      zh: {
        title: '生活',
        lines: ['河埠头洗衣。', '店铺、门、脚步。'],
        body: '人们并不是先造好一座水乡再搬进去。他们本来就住在那里，水成了日常生活的一部分 — 洗衣服的地方、系船的地方、邻居们见面谈天的地方。店铺朝水道开门，孩子们在河边的石阶上玩耍。这条街讲述着那种平凡生活的故事，一年又一年，重复了上千年。',
        caption: '日常生活就发生在水边。',
      },
    },
    night: {
      en: {
        title: 'NIGHT',
        lines: ['Lanterns over the water.', 'The town darkens, then glows.'],
        body: 'When evening comes, Wuzhen changes color. The stone turns blue, and lanterns fill the air with warm light. The light falls onto the water and then bounces back up as reflections. Standing on a bridge at night, it is hard to tell where the real town ends and its mirror begins. The quiet water, the glowing lights, and the dark sky all come together to make Wuzhen feel like a different place after dark.',
        caption: 'The town darkens, lights come on.',
      },
      zh: {
        title: '夜',
        lines: ['灯笼映在水面上。', '城镇暗下来，又亮起来。'],
        body: '夜幕降临时，乌镇换了颜色。石头变蓝，灯笼把温暖的光填满了空气。光落在水面上，又化作倒影弹回来。夜里站在桥上，很难分清哪边是真正的城镇，哪边是它的镜像。安静的水、亮着的路灯、深色的天空加在一起，让乌镇在入夜后像是另一个地方。',
        caption: '城镇暗下来，灯亮了。',
      },
    },
    memory: {
      en: {
        title: 'MEMORY',
        lines: ['A place shaped by water, bridges, and time.', ''],
        body: 'Our question was: why is water the main line of the ancient town? The answer is simple — just watch how it works. Water carried the people, the boats, the light, and the evening. It connected the houses, the bridges, and the streets. A town built around water keeps its shape around water, as long as the canals stay open. That is why Wuzhen still looks the same today.',
        closing: 'A place shaped by water,\nbridges, and time.',
      },
      zh: {
        title: '记忆',
        lines: ['一座被水、桥与时间塑造的地方。', ''],
        body: '我们的问题是：为什么水是古镇的主线？答案很简单 — 看它是如何运作的便知。水承载着人、船、灯光和夜晚，连接着房子、桥与街道。一座围绕水建起来的城镇，只要水道还在，就会一直保持着围绕水生长的样子。这就是乌镇今天依然如故的原因。',
        closing: '一座被水、桥\n与时间塑造的地方。',
      },
    },
  },

  /* ---------------- AUDIO (speech buttons) ---------------- */
  audio: {
    en: {
      voice: 'VOICE',
      play: 'Listen',
      playing: 'Playing',
      paused: 'Paused',
      stop: 'Stop',
      unavailable: 'Audio is unavailable on this device.',
    },
    zh: {
      voice: '语音',
      play: '播放',
      playing: '正在播放',
      paused: '已暂停',
      stop: '停止',
      unavailable: '当前设备暂不支持语音播放。',
    },
  },

  /* ---------------- ATLAS ---------------- */
  atlas: {
    en: {
      chrome1: 'WATERWAY ATLAS',
      chrome2: '120.49° E / 30.75° N',
      eyebrow: 'A walking guide along the canal',
      titleLine1: 'Find your way',
      titleLine2: 'by water.',
      intro: 'Four places along the Wuzhen canal — click each one to explore what life looks like there.',
      stopLabel: 'STOP',
      footer1: 'WUZHEN / ZHEJIANG',
      selectLabel: 'Select a waterway stop',
      arrival: 'Arrival',
      crossing: 'Crossing',
      afterDusk: 'After dusk',
      dailyLife: 'Daily life',
      northGate: {
        name: 'North Water Gate',
        note: 'The town begins at the canal entrance — stone paths, morning mist, and the first bridge you cross. It is where visitors first step into Wuzhen.',
      },
      xizha: {
        name: 'Xizha Bridge',
        note: 'A low stone arch connects two banks. Stand on it and you can see the whole town below — boats, houses, and people living along the water.',
      },
      lantern: {
        name: 'Lantern Wharf',
        note: 'At night, the water reflects the warm light from houses and boats. The town glows quietly, and the air feels calm and peaceful.',
      },
      market: {
        name: 'Morning Market',
        note: 'The canal is not just for visitors — it is still the street where people buy, sell, and meet every day. It is the real life of the town.',
      },
    },
    zh: {
      chrome1: '水道图集',
      chrome2: '120.49° E / 30.75° N',
      eyebrow: '一条沿水道行走的指南',
      titleLine1: '循水而行',
      titleLine2: '自在水乡。',
      intro: '乌镇水道旁的四个地点 — 点击每一个，看看那里的生活是什么样的。',
      stopLabel: '站点',
      footer1: '乌镇 / 浙江',
      selectLabel: '选择一个水道站点',
      arrival: '入口',
      crossing: '渡桥',
      afterDusk: '入夜后',
      dailyLife: '日常生活',
      northGate: {
        name: '北栅水门',
        note: '城镇从水道入口开始 — 石板路、晨雾，还有你遇到的第一座桥。游客初到乌镇，都从这里走进来。',
      },
      xizha: {
        name: '西栅古桥',
        note: '一座低矮的石拱连接着两岸。站上去，可以看到脚下的整座城镇 — 船、房子，和住在水边的人。',
      },
      lantern: {
        name: '灯影码头',
        note: '夜里，房屋和船的暖光都落进了水面。古镇静静地亮着，四下一片安宁。',
      },
      market: {
        name: '清晨市集',
        note: '水道不只属于游客 — 它仍然是一条街道，人们每天在这里买、卖、见面。这才是城镇真实的生活。',
      },
    },
  },

  /* ---------------- FACTS ---------------- */
  facts: {
    en: {
      headerCn: '3 Facts about Wuzhen',
      week: 'Week 1',
      tag: 'Fact',
      f1: {
        en: 'Cross-shaped Water System',
        cn: '乌镇的内河水系呈十字形，把古镇划分为不同区域，水道是古镇空间布局的重要组成部分。',
        summary: 'Water divides the town into different zones. It also connects them all, making the town one whole place.',
      },
      f2: {
        bigLabel: 'Ancient Stone Bridges',
        en: 'Xizha has nearly 10,000 meters of waterways and 72 ancient stone bridges.',
        unit1: 'METERS',
        label1: 'of waterways in Xizha',
        unit2: 'BRIDGES',
        label2: 'ancient stone arches',
        cn: '西栅有近万米河道和72座古石桥，桥梁与水道共同构成典型的江南水乡景观。',
        summary: 'Bridges connect the two sides of the canal, so everyone can reach the water. They are the key to the water town.',
      },
      f3: {
        en: 'Water & Everyday Life',
        enBody: 'In the past, local people used boats for travel, transportation and trade.',
        cn: '过去当地居民常利用船只出行、运输和进行交易，水道直接参与人们的日常生活。',
        summary: 'Water was not just beautiful to look at — it was the road people used for travel, trade, and daily life.',
      },
    },
    zh: {
      headerCn: '关于乌镇的三个事实',
      week: '第一周',
      tag: '事实',
      f1: {
        en: '十字形水系',
        cn: '乌镇的内河水系呈十字形，把古镇划成不同的区域。水道既是划分，也是串联，是古镇空间布局的重要组成部分。',
        summary: '水把古镇分成不同的区域，也把它们连在一起 — 整座古镇因此成为一个完整的空间。',
      },
      f2: {
        bigLabel: '古石桥',
        en: '西栅有近万米河道和72座古石桥。',
        unit1: '米',
        label1: '西栅水道长度',
        unit2: '座',
        label2: '古石拱桥',
        cn: '西栅有近万米河道、72座古石桥，桥与水道共同构成了典型的江南水乡风貌。',
        summary: '桥连接水道两岸，让每个人都能走到水边。桥是水乡的关键。',
      },
      f3: {
        en: '水与日常生活',
        enBody: '过去，当地居民常用船只出行、运输和交易。',
        cn: '过去当地居民常利用船只出行、运输和进行交易，水道直接参与人们的日常生活。',
        summary: '水不只是好看的风景 — 它是人们出行、交易和日常生活所依赖的道路。',
      },
    },
  },

  /* ---------------- GALLERY ---------------- */
  gallery: {
    en: {
      headerCn: 'Visual Research — Wuzhen Waterways',
      week: 'Week 1',
      intro: 'Feel the canals, old bridges, and traditional life through photographs',
      view: 'VIEW',
      source: 'Source',
      wikimedia: 'Wikimedia Commons',
      close: 'Close lightbox',
      images: {
        waterway: {
          title: 'The Canal',
          chapter: '01 — WATER',
          desc: '水道贯穿乌镇，两岸白墙黛瓦与倒映在水面的建筑构成典型的江南水乡景观。',
          observation: 'We noticed that the white walls and dark tiles of the buildings are reflected in the canal water, making a beautiful mirror-like picture.',
          alt: '乌镇水道与沿岸传统建筑',
        },
        bridge: {
          title: 'Stone Arch',
          chapter: '02 — BRIDGES',
          desc: '古桥连接水道两岸，是乌镇传统空间结构和水乡生活的重要组成部分。',
          observation: 'We saw that the stone bridges connect both sides of the canal, making the water town easy to walk through and explore on foot.',
          alt: '乌镇古石拱桥',
        },
        boat: {
          title: 'On the Water',
          chapter: '03 — BOATS',
          desc: '乘坐传统游船沿着水道前行，可以从水上感受乌镇的街巷、桥梁和传统生活。',
          observation: 'We found that taking a boat along the canal is the best way to see the water town — you can enjoy bridges, streets, and daily life all from the water.',
          alt: '乌镇运河与传统游船',
        },
      },
    },
    zh: {
      headerCn: '影像调研 — 乌镇水道',
      week: '第一周',
      intro: '通过照片感受水道、古桥与传统生活',
      view: '查看',
      source: '来源',
      wikimedia: '维基共享资源',
      close: '关闭图片',
      images: {
        waterway: {
          title: '水道',
          chapter: '01 — 水',
          desc: '水道贯穿乌镇，两岸白墙黛瓦与倒映在水面的建筑构成典型的江南水乡景观。',
          observation: '我们注意到，建筑的白墙黛瓦映在水道里，形成美丽的镜像。',
          alt: '乌镇水道与沿岸传统建筑',
        },
        bridge: {
          title: '石拱桥',
          chapter: '02 — 桥',
          desc: '古桥连接水道两岸，是乌镇传统空间结构和水乡生活的重要组成部分。',
          observation: '我们看到，石桥把水道两岸连起来，让人们可以步行穿越并探索水乡。',
          alt: '乌镇古石拱桥',
        },
        boat: {
          title: '船上',
          chapter: '03 — 船',
          desc: '乘坐传统游船沿着水道前行，可以从水上感受乌镇的街巷、桥梁和传统生活。',
          observation: '我们发现，沿水道坐船是游览水乡最好的方式 — 从水上就能欣赏桥、街巷和日常生活。',
          alt: '乌镇运河与传统游船',
        },
      },
    },
  },

  /* ---------------- KEYWORDS ---------------- */
  keywords: {
    en: {
      headerCn: 'Key Words for Our Presentation',
      week: 'Week 2',
      words: {
        WATER: '水', BRIDGES: '桥', CANAL: '水道', LIFE: '生活',
        WATERWAY: '水路', BOATS: '船', 'TRAVEL BY BOAT': '乘船出行',
        NIGHT: '夜', CONNECT: '连接', 'TRADITIONAL LIFE': '传统生活',
        MEMORY: '记忆', 'WATER TOWN': '水乡古镇', 'BOAT TOUR': '游船体验',
        REFLECTION: '倒影', 'AT DUSK': '黄昏时分',
      },
    },
    zh: {
      headerCn: '我们演示用的关键词',
      week: '第二周',
      words: {
        WATER: '水', BRIDGES: '桥', CANAL: '水道', LIFE: '生活',
        WATERWAY: '水路', BOATS: '船', 'TRAVEL BY BOAT': '乘船出行',
        NIGHT: '夜', CONNECT: '连接', 'TRADITIONAL LIFE': '传统生活',
        MEMORY: '记忆', 'WATER TOWN': '水乡古镇', 'BOAT TOUR': '游船体验',
        REFLECTION: '倒影', 'AT DUSK': '黄昏时分',
      },
    },
  },

  /* ---------------- WHY WATER ---------------- */
  whywater: {
    en: {
      headerCn: 'Why is water the main line?',
      week: 'Week 2',
      top: 'WATER',
      mid: 'CONNECTS',
      small: ['HOUSES', 'BRIDGES', 'STREETS', 'PEOPLE', 'BOATS'],
      bottom: 'TRADITIONAL LIFE',
    },
    zh: {
      headerCn: '为什么水是主线？',
      week: '第二周',
      top: '水',
      mid: '连接',
      small: ['房子', '桥', '街道', '人', '船'],
      bottom: '传统生活',
    },
  },

  /* ---------------- TIMELINE ---------------- */
  timeline: {
    en: {
      headerCn: 'From Everyday Life to Cultural Experience',
      week: 'Week 2',
      subtitle: '从日常生活到文化体验',
      pastLabel: 'PAST',
      pastTitle: '过去',
      pastList: ['Boats', 'Transportation', 'Trade', 'Daily Life'],
      pastCn: '船 · 交通 · 贸易 · 日常生活',
      presentLabel: 'PRESENT',
      presentTitle: '现在',
      presentList: ['Tourism', 'Sightseeing', 'Cultural Experience'],
      presentCn: '旅游 · 观光 · 文化体验',
      water: 'WATER',
    },
    zh: {
      headerCn: '从日常生活到文化体验',
      week: '第二周',
      subtitle: 'From everyday life to a cultural experience',
      pastLabel: '过去',
      pastTitle: '过去',
      pastList: ['船', '交通', '贸易', '日常生活'],
      pastCn: 'Boats · Transportation · Trade · Daily Life',
      presentLabel: '现在',
      presentTitle: '现在',
      presentList: ['旅游', '观光', '文化体验'],
      presentCn: 'Tourism · Sightseeing · Cultural Experience',
      water: '水',
    },
  },

  /* ---------------- TEAM ---------------- */
  team: {
    en: {
      headerCn: 'Six Members. One Story.',
      chrome1: 'WUZHEN / 2026',
      chrome2: (n) => `${String(n).padStart(2, '0')} MEMBERS`,
      lede1: 'Six Members. One Story.',
      lede2: '六位成员，同一个故事。',
      intro: 'We are a team exploring the beauty, history, and culture of Wuzhen. Through this project, we hope to share the charm of its waterways and bridges.',
      groupCap: 'GROUP PHOTO',
      roles: {
        lead: 'Project lead',
        research: 'Research & mapping',
        design: 'Design & web',
        photo: 'Photography',
        copy: 'Copy & research',
        production: 'Production & final review',
      },
      contributions: {
        lead: 'Helped plan the four-week project, made sure everyone stayed on schedule and finished on time, and led the final presentation and Q&A session.',
        research: 'Traced the canal routes and mapped out all the bridges, showing how the waterways connect different parts of the old town.',
        design: 'Built the interactive website — layout, animations, and the visual story — and managed all the images and their credits.',
        photo: 'Took the photos of the canals and bridges, and found and organized all the images used throughout the website.',
        copy: 'Wrote the text on the website, checked the bridge facts and history, and made sure the story was accurate and well-told.',
        production: 'Ran the weekly checklists, prepared the slides and materials, and did the final review with the whole team before the presentation.',
      },
      panel: {
        member: 'MEMBER',
        role: 'ROLE',
        contribution: 'CONTRIBUTION',
        close: 'Close member details',
        prev: 'Previous member',
        next: 'Next member',
        voice: 'VOICE',
        listen: 'Listen',
        playing: 'Playing',
        stopped: 'Stopped',
      },
    },
    zh: {
      headerCn: '六位成员，同一个故事。',
      chrome1: '乌镇 / 2026',
      chrome2: (n) => `${String(n).padStart(2, '0')} 位成员`,
      lede1: '六位成员，同一个故事。',
      lede2: 'Six Members. One Story.',
      intro: '我们是一支探索乌镇之美、历史与文化的团队。希望通过这个项目，把乌镇水道与古桥的魅力分享给更多人。',
      groupCap: '团队合照',
      roles: {
        lead: '项目负责人',
        research: '调研与测绘',
        design: '设计与网站',
        photo: '摄影',
        copy: '文案与资料',
        production: '制作与终审',
      },
      contributions: {
        lead: '协助规划四周的项目，确保每个人按时完成，并主持了最终演示与问答环节。',
        research: '追踪水道路线，测绘了所有桥梁，展示了水道如何连接古镇的不同部分。',
        design: '制作了互动网站 — 版式、动画与视觉叙事 — 并管理所有图片及其来源。',
        photo: '拍摄了水道与桥梁的照片，并寻找和整理了网站中使用的所有图片。',
        copy: '撰写了网站文字，核对了桥梁的事实与历史，确保故事准确、讲述得当。',
        production: '负责每周检查清单，准备了演示材料与幻灯片，并在展示前与全队完成了终审。',
      },
      panel: {
        member: '成员',
        role: '角色',
        contribution: '贡献',
        close: '关闭成员详情',
        prev: '上一位成员',
        next: '下一位成员',
        voice: '语音',
        listen: '播放',
        playing: '正在播放',
        stopped: '已停止',
      },
    },
  },

  /* ---------------- SUMMARY ---------------- */
  summary: {
    en: {
      title: 'Water connects everything.',
      cn: '水，把一切连接起来。',
      lines: [
        'Water connects the town,',
        'supports traditional life,',
        'and gives Wuzhen its unique character.',
      ],
      cnBlock: [
        '在乌镇，水并不只是风景的一部分。',
        '它连接着古镇，也支撑着传统生活，',
        '赋予古镇独特的魅力。',
      ],
    },
    zh: {
      title: '水，把一切连接起来。',
      cn: 'Water connects everything.',
      lines: [
        '它连接着古镇，',
        '支撑着传统生活，',
        '赋予乌镇独特的魅力。',
      ],
      cnBlock: [
        'Water connects the town,',
        'supports traditional life,',
        'and gives Wuzhen its unique character.',
      ],
    },
  },

  /* ---------------- FOOTER ---------------- */
  footer: {
    en: {
      sub: 'Waterways & Bridges',
      line1: 'Grade 9 English Project · Week One',
      line2: '907班 · 90706',
      line3: '小组长：蒋盛熠',
      membersTitle: '小组成员与分工',
      membersText: '蒋盛熠（项目负责人） · 汪瀚宇（调研与测绘） · 鲁昂（设计与网站） · 朱钟乐（摄影） · 沈毅程（文案与资料） · 沈煜辰（制作与终审）',
      bottom: '© 2026 Wuzhen Waterways & Bridges · Grade 9 English PBL Project',
    },
    zh: {
      sub: '水道与桥',
      line1: '九年级英语项目 · 第一周',
      line2: '907班 · 90706',
      line3: '小组长：蒋盛熠',
      membersTitle: '小组成员与分工',
      membersText: '蒋盛熠（项目负责人） · 汪瀚宇（调研与测绘） · 鲁昂（设计与网站） · 朱钟乐（摄影） · 沈毅程（文案与资料） · 沈煜辰（制作与终审）',
      bottom: '© 2026 乌镇水道与桥 · 九年级英语 PBL 项目',
    },
  },

  /* ---------------- OUR PROJECT VIDEO ---------------- */
  // The team's own film — the only video module on the site.
  ourVideo: {
    en: {
      eyebrow: 'Our Project Video',
      title: 'A Closer Look at Wuzhen',
      description:
        'Discover the waterways, ancient bridges, and cultural beauty of Wuzhen through our project video.',
      captionCn: '项目自制影片',
      captionEn: 'Our Project Video',
      download: 'Open the original MP4',
      error: 'The video could not be loaded.',
      hint: 'Make sure public/videos/our-project-video.mp4 is deployed alongside the site.',
      retry: 'Try again',
      unsupported: 'Your browser does not support HTML5 video.',
    },
    zh: {
      eyebrow: '项目自制影片',
      title: '走近乌镇',
      description: '通过我们的视频，一起了解乌镇的水道、古桥与独特的水乡文化。',
      captionCn: '项目自制影片',
      captionEn: 'Our Project Video',
      download: '打开原始 MP4',
      error: '视频加载失败。',
      hint: '请确认 public/videos/our-project-video.mp4 已随站点一起部署。',
      retry: '重试',
      unsupported: '你的浏览器不支持 HTML5 视频。',
    },
  },

  /* ---------------- CHAPTER RAIL ---------------- */
  rail: {
    en: {
      progress: 'Section progress',
      labels: {
        '01': 'MEET OUR TEAM',
        '02': 'FACTS',
        '03': 'VISUAL RESEARCH',
        '04': 'KEYWORDS',
        '05': 'WHY WATER?',
        '06': 'PAST → PRESENT',
      },
    },
    zh: {
      progress: '章节进度',
      labels: {
        '01': '我们的团队',
        '02': '事实',
        '03': '影像调研',
        '04': '关键词',
        '05': '为什么是水？',
        '06': '过去 → 现在',
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/* Resolvers                                                          */
/* ------------------------------------------------------------------ */

/**
 * Returns a function t(keyPath) that resolves the value at `keyPath` for the
 * active language.
 *
 * The translations table is organised as:
 *   { section: { en: {...}, zh: {...} } }
 *
 * so a key like 'facts.f2.bigLabel' means
 *   translations.facts[lang].f2.bigLabel
 * and a key like 'chapters.water.body' means
 *   translations.chapters.water[lang].body
 *
 * @param {'en'|'zh'} lang
 * @returns {(key: string) => any}
 */
export function makeT(lang) {
  const fallback = 'en';
  return (key) => {
    const parts = key.split('.');
    const [section, ...rest] = parts;
    const sec = translations[section];
    if (!sec) return '';
    // `chapters` is nested one level deeper: chapters.<chKey>.<en|zh>
    if (section === 'chapters') {
      const chKey = rest[0];
      const chap = sec[chKey];
      if (!chap) return '';
      const table = chap[lang] || chap[fallback];
      for (let i = 1; i < rest.length; i += 1) {
        if (table && typeof table === 'object') table = table[rest[i]];
        else return '';
      }
      return table;
    }
    const table = sec[lang] || sec[fallback];
    let v = table;
    for (const p of rest) {
      if (v && typeof v === 'object') v = v[p];
      else return '';
    }
    return v;
  };
}

export default translations;
