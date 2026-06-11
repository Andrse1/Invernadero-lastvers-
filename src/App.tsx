import { Routes, Route } from "react-router";
import { ThemeProvider } from "@/providers/ThemeProvider";
import Home from "./pages/Home";
import Co2 from "./pages/Co2";
import Nebulizador from "./pages/Nebulizador";
import Iluminacion from "./pages/Iluminacion";
import SistemaRiego from "./pages/SistemaRiego";
import Fotovoltaico from "./pages/Fotovoltaico";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/co2" element={<Co2 />} />
        <Route path="/nebulizador" element={<Nebulizador />} />
        <Route path="/iluminacion" element={<Iluminacion />} />
        <Route path="/riego" element={<SistemaRiego />} />
        <Route path="/fotovoltaico" element={<Fotovoltaico />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}
