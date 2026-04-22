import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Races from "./pages/Races";
import Results from "./pages/Results";
import Records from "./pages/Records";
import Athletes from "./pages/Athletes";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/races" element={<Races />} />
      <Route path="/results" element={<Results />} />
      <Route path="/records" element={<Records />} />
      <Route path="/athletes" element={<Athletes />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
