export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          <div className="footer__brand">
            <span className="footer__brand-main">WUZHEN</span>
            <span className="footer__brand-sub">Waterways &amp; Bridges</span>
          </div>
          <div className="footer__info">
            <p>Grade 9 English Project · Week One</p>
            <p>907班 · 90706</p>
            <p>小组长：蒋盛熠</p>
          </div>
        </div>
        <div className="footer__members">
          <p className="footer__members-title">小组成员与分工</p>
          <p className="footer__members-text">
            蒋盛熠（资料收集） · 汪瀚宇（图片整理） · 沈毅程（英文写作） · 沈煜辰（网页设计） · 鲁昂（内容校对） · 朱钟乐（项目协调）
          </p>
        </div>
        <div className="footer__bottom">
          <p>© 2026 Wuzhen Waterways &amp; Bridges · Grade 9 English PBL Project</p>
        </div>
      </div>
    </footer>
  );
}