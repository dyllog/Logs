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
import Calculator from "./pages/Calculator";
import Compare from "./pages/Compare";
import Rotorua from "./pages/Rotorua";
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
        <Route path="/results" element={<Results />} />
        <Route path="/records" element={<Records />} />
        <Route path="/athletes" element={<Athletes />} />
        <Route path="/athletes/daniel-whareaitu" element={<Athlete />} />
        <Route path="/athletes/daniel-balchin" element={<AthleteBalchin />} />
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
