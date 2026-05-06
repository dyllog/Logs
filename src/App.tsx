import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // Let the browser handle anchor scrolling naturally
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}
import Nav from "./components/Nav";
import SiteFooter from "./components/SiteFooter";
import SearchOverlay from "./components/SearchOverlay";
import TweaksPanel from "./components/TweaksPanel";
import Index from "./pages/Index";
import Race from "./pages/Race";
import Races from "./pages/Races";
import Results from "./pages/Results";
import Records from "./pages/Records";
import Athletes from "./pages/Athletes";
import Athlete from "./pages/Athlete";
import AthleteBalchin from "./pages/AthleteBalchin";
import AthleteVoss from "./pages/AthleteVoss";
import AthleteJackson from "./pages/AthleteJackson";
import AthleteInksterBaynes from "./pages/AthleteInksterBaynes";
import AthleteDryden from "./pages/AthleteDryden";
import AthletePulford from "./pages/AthletePulford";
import AthleteJones from "./pages/AthleteJones";
import AthleteTanimoto from "./pages/AthleteTanimoto";
import Calculator from "./pages/Calculator";
import Compare from "./pages/Compare";
import Rotorua from "./pages/Rotorua";
import Christchurch from "./pages/Christchurch";
import Queenstown from "./pages/Queenstown";
import HawkesBay from "./pages/HawkesBay";
import NotFound from "./pages/NotFound";

function Layout() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <ScrollToTop />
      <Nav onOpenSearch={() => setSearchOpen(true)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/races" element={<Races />} />
        <Route path="/races/auckland-marathon" element={<Race />} />
        <Route path="/races/rotorua-marathon" element={<Rotorua />} />
        <Route path="/races/christchurch-marathon" element={<Christchurch />} />
        <Route path="/races/queenstown-marathon" element={<Queenstown />} />
        <Route path="/races/hawkes-bay-marathon" element={<HawkesBay />} />
        <Route path="/results" element={<Results />} />
        <Route path="/records" element={<Records />} />
        <Route path="/athletes" element={<Athletes />} />
        <Route path="/athletes/daniel-whareaitu" element={<Athlete />} />
        <Route path="/athletes/daniel-balchin" element={<AthleteBalchin />} />
        <Route path="/athletes/michael-voss" element={<AthleteVoss />} />
        <Route path="/athletes/jonathan-jackson" element={<AthleteJackson />} />
        <Route path="/athletes/oska-inkster-baynes" element={<AthleteInksterBaynes />} />
        <Route path="/athletes/christopher-dryden" element={<AthleteDryden />} />
        <Route path="/athletes/aaron-pulford" element={<AthletePulford />} />
        <Route path="/athletes/daniel-jones" element={<AthleteJones />} />
        <Route path="/athletes/hiro-tanimoto" element={<AthleteTanimoto />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <SiteFooter />
      <TweaksPanel />
    </>
  );
}

const App = () => (
  <BrowserRouter>
    <Layout />
  </BrowserRouter>
);

export default App;
