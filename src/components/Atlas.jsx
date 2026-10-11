import { useState } from 'react';
import { assetUrl } from '../lib/assets.js';
import { useLang } from '../i18n/LanguageContext.jsx';

const stops = [
  { id: '01', key: 'northGate', cn: '北栅水门' },
  { id: '02', key: 'xizha', cn: '西栅古桥' },
  { id: '03', key: 'lantern', cn: '灯影码头' },
  { id: '04', key: 'market', cn: '清晨市集' },
];

const typeKeys = {
  '01': 'arrival',
  '02': 'crossing',
  '03': 'afterDusk',
  '04': 'dailyLife',
};

export default function Atlas() {
  const { t } = useLang();
  const [active, setActive] = useState(0);
  const stop = stops[active];
  const stopInfo = t(`atlas.${stop.key}`) || { name: stop.cn, note: '' };
  const stopType = t(`atlas.${typeKeys[stop.id]}`);
  const bg = assetUrl(`${import.meta.env.BASE_URL}images/hero_wuzhen-1920.webp`);

  return (
    <section className="atlas" id="atlas" aria-label="Wuzhen waterway atlas" style={{ '--atlas-bg': `url(${bg})` }}>
      <div className="atlas__image" aria-hidden="true" />
      <div className="atlas__veil" aria-hidden="true" />
      <div className="atlas__chrome" aria-hidden="true"><span>{t('atlas.chrome1')}</span><span>{t('atlas.chrome2')}</span></div>
      <div className="atlas__inner">
        <header className="atlas__header">
          <p className="atlas__eyebrow"><i /> {t('atlas.eyebrow')}</p>
          <h2>{t('atlas.titleLine1')}<br />{t('atlas.titleLine2')}</h2>
          <p>{t('atlas.intro')}</p>
        </header>

        <div className="atlas__panel">
          <div className="atlas__route" aria-label={t('atlas.selectLabel')}>
            <div className="atlas__line" aria-hidden="true"><span style={{ width: `${(active / (stops.length - 1)) * 100}%` }} /></div>
            {stops.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`atlas__stop ${index === active ? 'is-active' : ''}`}
                onClick={() => setActive(index)}
                aria-pressed={index === active}
              >
                <span className="atlas__marker"><b /></span>
                <span className="atlas__stop-id">{item.id}</span>
                <span className="atlas__stop-name">{t(`atlas.${item.key}.name`)}</span>
              </button>
            ))}
          </div>
          <article className="atlas__detail" key={stop.id}>
            <p className="atlas__detail-index">{t('atlas.stopLabel')} / {stop.id} <span>{stopType}</span></p>
            <h3>{stopInfo.name}</h3>
            <p className="atlas__detail-cn">{stop.cn}</p>
            <p className="atlas__detail-copy">{stopInfo.note}</p>
            <div className="atlas__detail-footer"><span>{t('atlas.footer1')}</span><span>{String(active + 1).padStart(2, '0')} — 04</span></div>
          </article>
        </div>
      </div>
    </section>
  );
}
