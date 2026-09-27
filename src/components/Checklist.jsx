import Reveal from './Reveal.jsx';

/* ------------------------------------------------------------------ */
/* Weekly task reports — Week 1 (completed) / Weeks 2–4 (up next).    */
/* All four cards share one layout: headline, six task rows on the     */
/* left, a WEEK 0x / status square badge on the right.                 */
/* ------------------------------------------------------------------ */

const WEEKS = [
  {
    num: '07',
    en: 'WEEK ONE',
    cn: 'Week One Task Report',
    weekLabel: 'Week 01',
    status: 'COMPLETED',
    statusTone: 'done',
    tasks: [
      '确定具体项目切口',
      '找到3条可靠事实',
      '找到3张候选图片',
      '整理7–9个英文关键词',
      '记录图片来源与授权',
      '完成第一周资料整理',
    ],
  },
  {
    num: '08',
    en: 'WEEK TWO',
    cn: 'Week Two Task Report',
    weekLabel: 'Week 02',
    status: 'COMPLETED',
    statusTone: 'done',
    tasks: [
      '深化水道与桥的资料',
      '完成中文段落初稿',
      '筛选并确认最终图片',
      '打磨7–9个英文关键词',
      '撰写英文导览页60–80词',
      '组内互评与修改',
    ],
  },
  {
    num: '09',
    en: 'WEEK THREE',
    cn: 'Week Three Task Report',
    weekLabel: 'Week 03',
    status: 'COMPLETED',
    statusTone: 'done',
    tasks: [
      '完善英文段落与语法',
      '准备约90秒英文推介稿',
      '制作展示页面与配图',
      '录制口头表达并互评',
      '整理来源与引用规范',
      '全组联排彩排',
    ],
  },
  {
    num: '10',
    en: 'WEEK FOUR',
    cn: 'Week Four Task Report',
    weekLabel: 'Week 04',
    status: 'COMPLETED',
    statusTone: 'done',
    tasks: [
      '定稿英文导览页',
      '完成最终展示PPT/网页',
      '准备现场展示与问答',
      '提交全部过程材料',
      '填写小组自查表',
      '组内互评与教师评价',
    ],
  },
];

function WeekCard({ w, idx, showHead }) {
  const done = w.statusTone === 'done';
  return (
    <Reveal className={`week-card week-card--${w.statusTone}`} delay={idx * 120}>
      <div className="week-card__body">
        <h3 className="week-card__title">{w.cn}</h3>
        <div className="week-card__grid">
          <div className="week-card__list">
            {w.tasks.map((task, i) => (
              <div
                key={task}
                className={`week-task${done ? ' week-task--done' : ''}`}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <span className="week-task__icon">
                  <svg width="18" height="18" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                    <circle cx="11" cy="11" r="10" stroke="currentColor" strokeWidth="1.5" />
                    {done ? (
                      <path d="M7 11l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    ) : (
                      <line x1="4" y1="11" x2="18" y2="11" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
                    )}
                  </svg>
                </span>
                <span className="week-task__text">{task}</span>
              </div>
            ))}
          </div>
          <div className={`week-badge week-badge--${w.statusTone}`}>
            <div className="week-badge__week">{w.weekLabel}</div>
            <div className="week-badge__status">{w.status}</div>
          </div>
        </div>
      </div>
      {showHead && (
        <div className="week-card__head">
          <div className="week-card__num">
            <span>{w.num}</span>
            <span className="week-card__slash">/</span>
            <span>{w.en}</span>
          </div>
        </div>
      )}
    </Reveal>
  );
}

export default function Checklist() {
  return (
    <section id="checklist" className="section checklist-section">
      <div className="container">
        {WEEKS.map((w, i) => (
          <WeekCard key={w.num} w={w} idx={i} showHead={i < WEEKS.length - 1} />
        ))}
      </div>
    </section>
  );
}
