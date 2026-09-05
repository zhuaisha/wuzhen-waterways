import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';

const tasks = [
  '确定具体项目切口',
  '找到3条可靠事实',
  '找到3张候选图片',
  '整理7–9个英文关键词',
  '记录资料来源',
  '完成第一周资料整理',
];

export default function Checklist() {
  return (
    <section id="checklist" className="section checklist-section">
      <div className="container">
        <SectionHeader number="09" en="WEEK ONE" cn="Week One Checklist" />
        <div className="checklist-grid">
          <div className="checklist-list">
            {tasks.map((task, i) => (
              <Reveal key={task} className="checklist-item" delay={i * 60}>
                <span className="checklist-item__icon">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <circle cx="11" cy="11" r="10" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M7 11l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="checklist-item__text">{task}</span>
              </Reveal>
            ))}
          </div>
          <Reveal className="checklist-badge" delay={400}>
            <div className="checklist-badge__week">Week 01</div>
            <div className="checklist-badge__status">COMPLETED</div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
