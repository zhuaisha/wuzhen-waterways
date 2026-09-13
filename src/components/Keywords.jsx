import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';

// size: xl | l | m | s — varied so the cloud reads as composition, not a list
const keywords = [
  { en: 'WATER', cn: '水', size: 'xl' },
  { en: 'BRIDGES', cn: '桥', size: 'l' },
  { en: 'CANAL', cn: '水道', size: 'm' },
  { en: 'LIFE', cn: '生活', size: 'l' },
  { en: 'WATERWAY', cn: '水路', size: 's' },
  { en: 'BOATS', cn: '船', size: 'm' },
  { en: 'TRAVEL BY BOAT', cn: '乘船出行', size: 's' },
  { en: 'NIGHT', cn: '夜', size: 'xl' },
  { en: 'CONNECT', cn: '连接', size: 's' },
  { en: 'TRADITIONAL LIFE', cn: '传统生活', size: 's' },
  { en: 'MEMORY', cn: '记忆', size: 'm' },
  { en: 'WATER TOWN', cn: '水乡古镇', size: 'l' },
  { en: 'BOAT TOUR', cn: '游船体验', size: 's' },
  { en: 'REFLECTION', cn: '倒影', size: 'm' },
  { en: 'AT DUSK', cn: '黄昏时分', size: 's' },
];

export default function Keywords() {
  return (
    <section id="keywords" className="section keywords-section">
      <div className="container">
        <SectionHeader number="05" en="KEYWORDS" cn="Key Words for Our Presentation" week="Week 2" />
        <div className="keywords-cloud">
          {keywords.map((kw, i) => (
            <Reveal key={kw.en} className={`keyword-tag keyword-tag--${kw.size}`} delay={i * 45}>
              <span className="keyword-tag__en">{kw.en}</span>
              <span className="keyword-tag__cn">{kw.cn}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
