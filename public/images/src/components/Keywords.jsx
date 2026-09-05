import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';

const keywords = [
  { en: 'CANAL', cn: '水道' },
  { en: 'BRIDGE', cn: '桥' },
  { en: 'WATERWAY', cn: '水路' },
  { en: 'BOAT', cn: '船' },
  { en: 'TRAVEL BY BOAT', cn: '乘船出行' },
  { en: 'CONNECT', cn: '连接' },
  { en: 'TRADITIONAL LIFE', cn: '传统生活' },
  { en: 'WATER TOWN', cn: '水乡古镇' },
];

export default function Keywords() {
  return (
    <section id="keywords" className="section keywords-section">
      <div className="container">
        <SectionHeader number="05" en="KEYWORDS" cn="Key Words for Our Presentation" />
        <div className="keywords-cloud">
          {keywords.map((kw, i) => (
            <Reveal key={kw.en} className="keyword-tag" delay={i * 50}>
              <span className="keyword-tag__en">{kw.en}</span>
              <span className="keyword-tag__cn">{kw.cn}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
