import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';
import sourcesData from '../data/images-sources.json';

// The manifest is written by tools/fetch_images.py — every image used on the
// site, with the license and author verified from the Wikimedia Commons API.
const items = Object.values(sourcesData).sort((a, b) => a.key.localeCompare(b.key));

export default function Sources() {
  const bySection = {};
  for (const it of items) {
    (bySection[it.section] ||= []).push(it);
  }
  // Sort by chapter number so the list reads 01 → 02 → … → GALLERY.
  const ordered = Object.entries(bySection).sort((a, b) => {
    const na = parseInt(a[0].split(' ')[0], 10);
    const nb = parseInt(b[0].split(' ')[0], 10);
    if (Number.isNaN(na) && Number.isNaN(nb)) return a[0].localeCompare(b[0]);
    if (Number.isNaN(na)) return 1;
    if (Number.isNaN(nb)) return -1;
    return na - nb;
  });

  return (
    <section id="sources" className="section sources-section">
      <div className="container">
        <SectionHeader number="08" en="SOURCES" cn="资料来源" week="Week 1" />
        <p className="sources-intro">
          本站所有图片均来自 Wikimedia Commons，经核验为 CC0 / CC BY / CC BY-SA 公开授权。
          原始文件下载后统一处理为 WebP / AVIF / JPG 并存放于本地资源目录，网站运行时不依赖境外图片服务器。
        </p>
        <div className="sources-list">
          {ordered.map(([section, list]) => (
            <Reveal key={section} className="sources-group">
              <div className="sources-group__head">
                <span className="sources-group__section">{section}</span>
                <span className="sources-group__count">{list.length}</span>
              </div>
              <div className="sources-group__items">
                {list.map((s, i) => (
                  <div key={s.key} className="source-card">
                    <span className="source-card__num">{String(i + 1).padStart(2, '0')}</span>
                    <div className="source-card__content">
                      <h3 className="source-card__title">
                        <a href={s.page} target="_blank" rel="noreferrer">
                          {s.file.replace(/^File:/, '')}
                        </a>
                      </h3>
                      <p className="source-card__cn">{s.caption}</p>
                      <p className="source-card__meta">
                        <span>Photo: {s.artist}</span>
                        <span>·</span>
                        <span>{s.license}</span>
                        <span>·</span>
                        <span>{s.original}</span>
                      </p>
                      <p className="source-card__uses">
                        <span className="source-card__tag">used in {s.section}</span>
                        <span className="source-card__tag">
                          webp {s.sizes_kb.webp} KB · avif {s.sizes_kb.avif} KB · jpg {s.sizes_kb.jpg} KB
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
