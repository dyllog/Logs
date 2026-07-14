import { useState, useEffect, useCallback } from 'react';
import { SearchContext } from './context/SearchContext';
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
import RaceProfile from "./pages/RaceProfile";
import Races from "./pages/Races";
import Results from "./pages/Results";
import Records from "./pages/Records";
import Athletes from "./pages/Athletes";
import AthleteIndex from "./pages/AthleteIndex";
import AthleteProfile from "./pages/AthleteProfile";
import AthleteReport from "./pages/AthleteReport";
import Calculator from "./pages/Calculator";
import Compare from "./pages/Compare";
import NotFound from "./pages/NotFound";

function Layout() {
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const openSearch = useCallback((q = '') => {
    setSearchQuery(q);
    setSearchOpen(true);
  }, []);

  return (
    <SearchContext.Provider value={openSearch}>
      <ScrollToTop />
      <Nav onOpenSearch={() => openSearch()} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} initialQuery={searchQuery} />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/races" element={<Races />} />
        <Route path="/races/:raceSlug" element={<RaceProfile />} />
        <Route path="/results" element={<Results />} />
        <Route path="/records" element={<Records />} />
        <Route path="/athletes" element={<Athletes />} />
        <Route path="/athletes/letter/:letter" element={<AthleteIndex />} />
        <Route path="/athletes/:slug/report" element={<AthleteReport />} />
        <Route path="/athletes/:slug" element={<AthleteProfile />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <SiteFooter />
      <TweaksPanel />
    </SearchContext.Provider>
  );
}

const App = () => (
  <BrowserRouter>
    <Layout />
  </BrowserRouter>
);

export default App;
