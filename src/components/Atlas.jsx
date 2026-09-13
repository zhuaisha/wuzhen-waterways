import { useState } from 'react';

const stops = [
  { id: '01', name: 'North Water Gate', cn: '北栅水门', type: 'Arrival', note: 'The town opens at the edge of the canal — stone, mist, and the first crossing.' },
  { id: '02', name: 'Xizha Bridge', cn: '西栅古桥', type: 'Crossing', note: 'A short arc links two banks and turns a route into a shared point of view.' },
  { id: '03', name: 'Lantern Wharf', cn: '灯影码头', type: 'After dusk', note: 'The water carries reflected windows, boats and the soft rhythm of evening.' },
  { id: '04', name: 'Morning Market', cn: '清晨市集', type: 'Daily life', note: 'The canal is not scenery alone: it remains an everyday street and threshold.' },
];

export default function Atlas() {
  const [active, setActive] = useState(0);
  const stop = stops[active];
  const bg = `${import.meta.env.BASE_URL}images/hero_wuzhen-1920.webp`;

  return (
    <section className="atlas" id="atlas" aria-label="Wuzhen waterway atlas" style={{ '--atlas-bg': `url(${bg})` }}>
      <div className="atlas__image" aria-hidden="true" />
      <div className="atlas__veil" aria-hidden="true" />
      <div className="atlas__chrome" aria-hidden="true"><span>WATERWAY ATLAS</span><span>120.49° E / 30.75° N</span></div>
      <div className="atlas__inner">
        <header className="atlas__header">
          <p className="atlas__eyebrow"><i /> A live field guide</p>
          <h2>Find your way<br />by water.</h2>
          <p>Four moments on the Wuzhen canal, organized as a field interface rather than a linear scroll.</p>
        </header>

        <div className="atlas__panel">
          <div className="atlas__route" aria-label="Select a waterway stop">
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
                <span className="atlas__stop-name">{item.name}</span>
              </button>
            ))}
          </div>
          <article className="atlas__detail" key={stop.id}>
            <p className="atlas__detail-index">STOP / {stop.id} <span>{stop.type}</span></p>
            <h3>{stop.name}</h3>
            <p className="atlas__detail-cn">{stop.cn}</p>
            <p className="atlas__detail-copy">{stop.note}</p>
            <div className="atlas__detail-footer"><span>WUZHEN / ZHEJIANG</span><span>{String(active + 1).padStart(2, '0')} — 04</span></div>
          </article>
        </div>
      </div>
    </section>
  );
}
