export default function SectionHeader({ number, en, cn, dark = false }) {
  return (
    <div className={`section-header ${dark ? 'section-header--dark' : ''}`}>
      <div className="section-header__label">
        <span className="section-header__num">{number}</span>
        <span className="section-header__slash">/</span>
        <span>{en}</span>
      </div>
      {cn && <h2 className="section-header__cn">{cn}</h2>}
    </div>
  );
}
