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
import AthleteBalchin from "./pages/AthleteBalchin";
import AthleteVoss from "./pages/AthleteVoss";
import AthleteJackson from "./pages/AthleteJackson";
import AthleteInksterBaynes from "./pages/AthleteInksterBaynes";
import AthleteDryden from "./pages/AthleteDryden";
import AthletePulford from "./pages/AthletePulford";
import AthleteJones from "./pages/AthleteJones";
import AthleteTanimoto from "./pages/AthleteTanimoto";
import AthleteFaherty from "./pages/AthleteFaherty";
import AthleteGraves from "./pages/AthleteGraves";
import AthleteMcWhirter from "./pages/AthleteMcWhirter";
import AthleteDowns from "./pages/AthleteDowns";
import AthleteKnowles from "./pages/AthleteKnowles";
import AthleteLogan from "./pages/AthleteLogan";
import AthleteCullernThorby from "./pages/AthleteCullernThorby";
import AthleteCaseyThorby from "./pages/AthleteCaseyThorby";
import AthleteBrentGodfrey from "./pages/AthleteBrentGodfrey";
import AthleteJackMoody from "./pages/AthleteJackMoody";
import AthleteBenTwyman from "./pages/AthleteBenTwyman";
import AthleteDougalThorburn from "./pages/AthleteDougalThorburn";
import AthleteOrestasRimkus from "./pages/AthleteOrestasRimkus";
import AthleteBrettTingay from "./pages/AthleteBrettTingay";
import AthleteMikePhillips from "./pages/AthleteMikePhillips";
import AthleteReport from "./pages/AthleteReport";
import Calculator from "./pages/Calculator";
import Compare from "./pages/Compare";
import Rotorua from "./pages/Rotorua";
import Christchurch from "./pages/Christchurch";
import Queenstown from "./pages/Queenstown";
import HawkesBay from "./pages/HawkesBay";
import WaterfrontHalf from "./pages/WaterfrontHalf";
import Devonport from "./pages/Devonport";
import Coatesville from "./pages/Coatesville";
import Omaha from "./pages/Omaha";
import Maraetai from "./pages/Maraetai";
import Kerikeri from "./pages/Kerikeri";
import Wellington from "./pages/Wellington";
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
        <Route path="/races/waterfront-half-marathon" element={<WaterfrontHalf />} />
        <Route path="/races/devonport-half-marathon" element={<Devonport />} />
        <Route path="/races/coatesville-half-marathon" element={<Coatesville />} />
        <Route path="/races/omaha-half-marathon" element={<Omaha />} />
        <Route path="/races/maraetai-half-marathon" element={<Maraetai />} />
        <Route path="/races/kerikeri-half-marathon" element={<Kerikeri />} />
        <Route path="/races/wellington-marathon" element={<Wellington />} />
        <Route path="/results" element={<Results />} />
        <Route path="/records" element={<Records />} />
        <Route path="/athletes" element={<Athletes />} />
        <Route path="/athletes/daniel-balchin" element={<AthleteBalchin />} />
        <Route path="/athletes/michael-voss" element={<AthleteVoss />} />
        <Route path="/athletes/jonathan-jackson" element={<AthleteJackson />} />
        <Route path="/athletes/oska-inkster-baynes" element={<AthleteInksterBaynes />} />
        <Route path="/athletes/christopher-dryden" element={<AthleteDryden />} />
        <Route path="/athletes/aaron-pulford" element={<AthletePulford />} />
        <Route path="/athletes/daniel-jones" element={<AthleteJones />} />
        <Route path="/athletes/hiro-tanimoto" element={<AthleteTanimoto />} />
        <Route path="/athletes/ciaran-faherty" element={<AthleteFaherty />} />
        <Route path="/athletes/cameron-graves" element={<AthleteGraves />} />
        <Route path="/athletes/blair-mcwhirter" element={<AthleteMcWhirter />} />
        <Route path="/athletes/fabe-downs" element={<AthleteDowns />} />
        <Route path="/athletes/scott-knowles" element={<AthleteKnowles />} />
        <Route path="/athletes/dylan-logan" element={<AthleteLogan />} />
        <Route path="/athletes/cullern-thorby" element={<AthleteCullernThorby />} />
        <Route path="/athletes/casey-thorby" element={<AthleteCaseyThorby />} />
        <Route path="/athletes/brent-godfrey" element={<AthleteBrentGodfrey />} />
        <Route path="/athletes/jack-moody" element={<AthleteJackMoody />} />
        <Route path="/athletes/ben-twyman" element={<AthleteBenTwyman />} />
        <Route path="/athletes/dougal-thorburn" element={<AthleteDougalThorburn />} />
        <Route path="/athletes/orestas-rimkus" element={<AthleteOrestasRimkus />} />
        <Route path="/athletes/brett-tingay" element={<AthleteBrettTingay />} />
        <Route path="/athletes/mike-phillips" element={<AthleteMikePhillips />} />
        <Route path="/athletes/:slug/report" element={<AthleteReport />} />
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
