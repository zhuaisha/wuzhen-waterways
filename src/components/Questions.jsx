import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';

const questions = [
  {
    num: '01',
    en: 'Which waterway and bridge did we choose?',
    cn: '我们选择了哪一段水道、哪座桥？',
    answerCn: '我们选择乌镇西栅的一段水道和沿线古桥，重点观察水道、桥梁与两岸建筑之间的关系。',
    answerEn: 'We chose a section of waterway in Xizha, Wuzhen, focusing on the relationship between the canal, ancient stone bridges, and the buildings along both banks.',
  },
  {
    num: '02',
    en: 'What role does water play here?',
    cn: '水在这里有什么作用？',
    answerCn: '水道既是古镇的重要交通空间，也是连接建筑、街道和桥梁的重要纽带，同时形成独特的水乡景观。',
    answerEn: 'The canal serves as an important transportation route, connecting buildings, streets, and bridges while creating the unique landscape of a water town.',
  },
  {
    num: '03',
    en: 'How did people use waterways and bridges?',
    cn: '人们如何利用水道或桥出行、生活？',
    answerCn: '过去人们可以乘船出行、运输货物和进行交易，水道与居民的日常生活联系密切。',
    answerEn: 'In the past, people traveled by boat, transported goods, and conducted trade along the waterways, which were closely connected to daily life.',
  },
  {
    num: '04',
    en: 'Where can visitors feel the water-town character?',
    cn: '游客在哪里最容易感受到水乡特色？',
    answerCn: '可以从水道乘船观察两岸，再步行经过古桥，从水面和桥上同时感受古镇风景。',
    answerEn: 'Visitors can take a boat ride along the canal to observe both banks, then walk across ancient bridges to experience the water town from both water and bridge perspectives.',
  },
];

export default function Questions() {
  return (
    <section id="questions" className="section">
      <div className="container">
        <SectionHeader number="02" en="RESEARCH QUESTIONS" cn="四个小问题" week="Week 1" />
        <div className="questions-grid">
          {questions.map((q, i) => (
            <Reveal key={q.num} className="q-card" delay={i * 80}>
              <div className="q-card__num">Q{q.num}</div>
              <h3 className="q-card__en">{q.en}</h3>
              <p className="q-card__cn-title">{q.cn}</p>
              <p className="q-card__answer">{q.answerCn}</p>
              <p className="q-card__answer-en">{q.answerEn}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}