import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';

const sources = [
  {
    index: '01',
    name: 'Wikimedia Commons — Aerial panorama of Wuzhen',
    cn: 'Hero 背景图片来源',
    uses: ['图片作者：Wanderingchina', '许可证：CC BY 4.0', '用于 Hero 首屏背景'],
    url: 'https://commons.wikimedia.org/wiki/File:Aerial_panorama_of_Wuzhen_%E4%B9%8C%E9%95%87_Water_Town._December_2023.jpg',
  },
  {
    index: '02',
    name: 'Wikimedia Commons — WuzhenWaterway.jpg',
    cn: '乌镇水道图片来源',
    uses: ['图片作者：Evilbish', '许可证：CC BY-SA 3.0', '用于 Gallery 01：乌镇水道'],
    url: 'https://commons.wikimedia.org/wiki/File:WuzhenWaterway.jpg',
  },
  {
    index: '03',
    name: 'Wikimedia Commons — Wuzhen Xizha 2009-13.jpg',
    cn: '乌镇西栅古桥图片来源',
    uses: ['图片作者：Gerbil', '许可证：CC BY-SA 3.0', '用于 Gallery 02：乌镇古桥'],
    url: 'https://commons.wikimedia.org/wiki/File:Wuzhen_Xizha_2009-13.jpg',
  },
  {
    index: '04',
    name: 'Wikimedia Commons — Canal in Wuzhen.JPG',
    cn: '乌镇运河与游船图片来源',
    uses: ['Wikimedia Commons 图片', '页面标注 Creative Commons 授权', '用于 Gallery 03：乘船与步行'],
    url: 'https://commons.wikimedia.org/wiki/File:Canal_in_Wuzhen.JPG',
  },
];

export default function Sources() {
  return (
    <section id="sources" className="section sources-section">
      <div className="container">
        <SectionHeader number="08" en="SOURCES" cn="Sources & References" />
        <div className="sources-list">
          {sources.map((s, i) => (
            <Reveal key={s.index} className="source-card" delay={i * 100}>
              <div className="source-card__index">{s.index}</div>
              <div className="source-card__body">
                <h3 className="source-card__name">
                  <a href={s.url} target="_blank" rel="noreferrer">{s.name}</a>
                </h3>
                <p className="source-card__cn">{s.cn}</p>
                <div className="source-card__uses">
                  <p className="source-card__uses-label">图片授权 / 资料用途</p>
                  <ul>
                    {s.uses.map((u) => (
                      <li key={u}>{u}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
