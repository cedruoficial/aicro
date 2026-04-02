import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { PainelGeral } from './pages/PainelGeral';
import { Insights } from './pages/Insights';
import { PCP } from './pages/PCP';
import { CEO } from './pages/CEO';

import { Comercial } from './pages/Comercial';
import { SectorDetail } from './pages/SectorDetail';
import { SubSectorDetail } from './pages/SubSectorDetail';
import { RH } from './pages/RH';

export default function App() {
  return (
    <BrowserRouter>
      <div className="bg-[#F4F3F8] min-h-screen font-sans text-[#2D2D3A] overflow-x-hidden">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<PainelGeral />} />
            <Route path="/comercial" element={<Comercial />} />
            <Route path="/setor/:id" element={<SectorDetail />} />
            <Route path="/setor/:sectorId/:subId" element={<SubSectorDetail />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/dashboard" element={<Navigate to="/insights" replace />} />
            <Route path="/relatorios" element={<Navigate to="/insights" replace />} />
            <Route path="/pcp" element={<PCP />} />
            <Route path="/rh" element={<RH />} />
            <Route path="/ceo" element={<CEO />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
