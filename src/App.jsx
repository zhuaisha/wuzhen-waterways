import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Focus from './components/Focus.jsx';
import CoreQuestion from './components/CoreQuestion.jsx';
import Questions from './components/Questions.jsx';
import Facts from './components/Facts.jsx';
import Gallery from './components/Gallery.jsx';
import Keywords from './components/Keywords.jsx';
import WhyWater from './components/WhyWater.jsx';
import Timeline from './components/Timeline.jsx';
import Sources from './components/Sources.jsx';
import Checklist from './components/Checklist.jsx';
import Summary from './components/Summary.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Hero />
        <Focus />
        <CoreQuestion />
        <Questions />
        <Facts />
        <Gallery />
        <Keywords />
        <WhyWater />
        <Timeline />
        <Sources />
        <Checklist />
        <Summary />
      </main>
      <Footer />
    </div>
  );
}
