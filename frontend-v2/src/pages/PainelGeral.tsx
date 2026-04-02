import { useState } from 'react';
import { SectorCard } from '../components/SectorCard';
import { FeedPanel } from '../components/FeedPanel';
import { SECTORS } from '../data/mock';

export function PainelGeral() {
  const [expandedSector, setExpandedSector] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 p-6 md:p-8 max-w-[1440px] mx-auto min-h-[calc(100vh-64px)]">
      {/* LEFT COLUMN: Sectors */}
      <div>
        <div className="mb-6">
          <h1 className="text-[26px] font-bold m-0 text-[#2D2D3A]">
            Painel Geral
          </h1>
          <p className="text-sm text-[#8B8BA0] mt-1 font-medium">
            Visão integrada de todos os setores da cadeia produtiva
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {SECTORS.map((sector) => (
            <SectorCard
              key={sector.id}
              sector={sector}
              isExpanded={expandedSector === sector.id}
              onToggle={() => setExpandedSector(prev => prev === sector.id ? null : sector.id)}
            />
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: Feed */}
      <div className="hidden lg:block">
        <FeedPanel />
      </div>
    </div>
  );
}
