import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';
import { SOURCE_URLS } from '../config/assets.js';

const sources = [
  {
    index: '01',
    name: 'Wikimedia Commons — Aerial panorama of Wuzhen',
    cn: 'Hero 背景图片来源',
    url: SOURCE_URLS.hero,
    author: 'Wanderingchina',
    license: 'CC BY 4.0',
    uses: ['Hero 背景图', '航拍乌镇全景', '展示水道与古镇整体布局'],
  },
  {
    index: '02',
    name: 'Wikimedia Commons — WuzhenWaterway.jpg',
    cn: '乌镇水道图片来源',
    url: SOURCE_URLS.waterway,
    author: 'Evilbish',
    license: 'CC BY-SA 3.0',
    uses: ['Wikimedia Commons 图片', '页面标注 Creative Commons 授权', '用于 Gallery 01：乌镇水道'],
  },
  {
    index: '03',
    name: 'Wikimedia Commons — Wuzhen Xizha 2009-13.jpg',
    cn: '乌镇西栅古桥图片来源',
    url: SOURCE_URLS.bridge,
    author: 'Gerbil',
    license: 'CC BY-SA 3.0',
    uses: ['Wikimedia Commons 图片', '页面标注 Creative Commons 授权', '用于 Gallery 02：古桥'],
  },
  {
    index: '04',
    name: 'Wikimedia Commons — Canal in Wuzhen.JPG',
    cn: '乌镇运河与游船图片来源',
    url: SOURCE_URLS.boat,
    author: 'Unknown',
    license: 'CC BY-SA',
    uses: ['Wikimedia Commons 图片', '页面标注 Creative Commons 授权', '用于 Gallery 03：乘船与徒步'],
  },
];

export default function Sources() {
  return (
    <section id="sources" className="section">
      <div className="container">
        <SectionHeader number="08" en="SOURCES" cn="资料来源" />
        <div className="sources-list">
          {sources.map((source, i) => (
            <Reveal key={source.index} delay={i * 80}>
              <div className="source-card">
                <span className="source-card__num">{source.index}</span>
                <div className="source-card__content">
                  <h3 className="source-card__title">
                    <a href={source.url} target="_blank" rel="noreferrer">
                      {source.name}
                    </a>
                  </h3>
                  <p className="source-card__cn">{source.cn}</p>
                  <p className="source-card__meta">
                    <span>Photo: {source.author}</span>
                    <span>·</span>
                    <span>{source.license}</span>
                  </p>
                  <p className="source-card__uses">
                    {source.uses.map((u, j) => (
                      <span key={j} className="source-card__tag">{u}</span>
                    ))}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
