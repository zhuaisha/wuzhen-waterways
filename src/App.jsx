import Navbar from './components/Navbar.jsx';
import ChapterRail from './components/ChapterRail.jsx';
import Hero from './components/Hero.jsx';
import Atlas from './components/Atlas.jsx';
import Story from './components/Story.jsx';
import Facts from './components/Facts.jsx';
import Gallery from './components/Gallery.jsx';
import Keywords from './components/Keywords.jsx';
import WhyWater from './components/WhyWater.jsx';
import Timeline from './components/Timeline.jsx';
import Sources from './components/Sources.jsx';
import Team from './components/Team.jsx';
import Summary from './components/Summary.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <ChapterRail />
      <main>
        <Hero />
        <Story />
        <Atlas />
        <Facts />
        <Gallery />
        <Keywords />
        <WhyWater />
        <div className="water-divider" aria-hidden="true">
          <svg className="water-divider__line" viewBox="0 0 1200 60" preserveAspectRatio="none">
            <path d="M0,30 C200,10 400,50 600,30 C800,10 1000,50 1200,30" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            <path d="M0,35 C200,15 400,55 600,35 C800,15 1000,55 1200,35" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25" />
            <path d="M0,25 C200,5 400,45 600,25 C800,5 1000,45 1200,25" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" />
          </svg>
        </div>
        <Timeline />
        <Sources />
        <Team />
        <Summary />
      </main>
      <Footer />
    </div>
  );
}
