import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';

const questions = [
  {
    num: '01',
    en: 'Which waterway and bridge did we choose?',
    cn: '我们选择了哪一段水道、哪座桥？',
    answerCn: '我们选择乌镇西栅的一段水道和沿线古桥，重点观察水道、桥梁与两岸建筑之间的关系。',
  },
  {
    num: '02',
    en: 'What role does water play here?',
    cn: '水在这里有什么作用？',
    answerCn: '水道既是古镇的重要交通空间，也是连接建筑、街道和桥梁的重要纽带，同时形成独特的水乡景观。',
  },
  {
    num: '03',
    en: 'How did people use waterways and bridges?',
    cn: '人们如何利用水道或桥出行、生活？',
    answerCn: '过去人们可以乘船出行、运输货物和进行交易，水道与居民的日常生活联系密切。',
  },
  {
    num: '04',
    en: 'Where can visitors feel the water-town character?',
    cn: '游客在哪里最容易感受到水乡特色？',
    answerCn: '可以从水道乘船观察两岸，再步行经过古桥，从水面和桥上同时感受古镇风景。',
  },
];

export default function Questions() {
  return (
    <section id="questions" className="section">
      <div className="container">
        <SectionHeader number="02" en="RESEARCH QUESTIONS" cn="四个小问题" />
        <div className="questions-grid">
          {questions.map((q, i) => (
            <Reveal key={q.num} className="q-card" delay={i * 80}>
              <div className="q-card__num">Q{q.num}</div>
              <h3 className="q-card__en">{q.en}</h3>
              <p className="q-card__cn-title">{q.cn}</p>
              <p className="q-card__answer">{q.answerCn}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
