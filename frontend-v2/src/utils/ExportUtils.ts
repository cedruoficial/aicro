import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SECTOR_EFFICIENCY, FINANCIAL_METRICS } from '../data/mockFinanceiro';

export async function exportToPDF(analysisText: string, filename: string) {
  // Configurações do PDF (A4)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // --- CABEÇALHO LIMPO E CORP (Minimalista/Sério) ---
  pdf.setFillColor(20, 20, 25);
  pdf.rect(0, 0, pageWidth, 5); // Fina linha superior
  
  pdf.setTextColor(20, 20, 25);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('REUNIÃO EXECUTIVA / PRESTAÇÃO DE CONTAS', 15, 20);
  
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('GRUPO CROMOTRANSFER | AVALIAÇÃO DE GARGALOS E CUSTOS OPERACIONAIS', 15, 26);

  const dateStr = new Date().toLocaleDateString('pt-BR');
  pdf.setTextColor(60, 60, 60);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`DATA: ${dateStr}`, pageWidth - 15, 20, { align: 'right' });

  // Linha divisória
  pdf.setDrawColor(200, 200, 200);
  pdf.line(15, 32, pageWidth - 15, 32);

  let cursorY = 42;

  // --- 1. SÍNTESE FINANCEIRA ---
  pdf.setTextColor(20, 20, 25);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('1. SÍNTESE DE DESPERDÍCIOS REPORTADOS', 15, cursorY);
  cursorY += 8;

  const kpiData = FINANCIAL_METRICS.filter(k => k.title.includes('Desperdício') || k.title.includes('WIP')).map(kpi => [
    kpi.title.replace('Desperdício: ', '').toUpperCase(), 
    kpi.value, 
    kpi.description
  ]);
  
  autoTable(pdf, {
    startY: cursorY,
    head: [['Onde o dinheiro é perdido', 'Impacto Atual', 'Causa Raiz']],
    body: kpiData,
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 245], textColor: [20, 20, 25], fontStyle: 'bold', lineColor: [200, 200, 200] },
    bodyStyles: { textColor: [40, 40, 40], lineColor: [200, 200, 200] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 }, 1: { cellWidth: 25, halign: 'center', textColor: [200, 30, 30], fontStyle: 'bold' } },
    margin: { left: 15, right: 15 }
  });

  cursorY = (pdf as any).lastAutoTable.finalY + 15;

  // --- 2. PAUTA DE COBRANÇA POR SETOR (Accountability) ---
  if (cursorY > pageHeight - 80) { pdf.addPage(); cursorY = 20; }

  pdf.setTextColor(20, 20, 25);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('2. PAUTA DE COBRANÇA POR SETOR E LIDERANÇA', 15, cursorY);
  cursorY += 6;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Responsabilidade direta sobre os custos gerados no fluxo logístico.', 15, cursorY);
  cursorY += 10;

  SECTOR_EFFICIENCY.forEach((s) => {
    // Check page break for block (Aumentado para acomodar gráficos e metas)
    if (cursorY > pageHeight - 75) { pdf.addPage(); cursorY = 20; }

    const eff = (s as any).efficiency || 0;
    const isCritical = eff < 50;
    const boxColor = isCritical ? 250 : 255;
    const projLoss = (s as any).projectedLoss || 0;
    
    // Fundo do "Card"
    pdf.setFillColor(boxColor, boxColor, boxColor);
    pdf.setDrawColor(220, 220, 220);
    pdf.roundedRect(15, cursorY, pageWidth - 30, 62, 2, 2, 'FD');

    // Cabeçalho do Card
    pdf.setTextColor(20, 20, 25);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`SETOR: ${s.sector.toUpperCase()}`, 20, cursorY + 7);

    // Responsável destacado (Vermelho se crítico, Cinza se ok)
    pdf.setTextColor(isCritical ? 200 : 80, isCritical ? 30 : 80, isCritical ? 30 : 80);
    pdf.text(`RESPONSÁVEL: ${(s as any).manager ? (s as any).manager.toUpperCase() : 'NÃO ATRIBUÍDO'}`, pageWidth - 20, cursorY + 7, { align: 'right' });

    // Valores Financeiros
    pdf.setTextColor(60, 60, 60);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Custo Operacional Mensal: R$ ${s.cost.toLocaleString('pt-BR')}`, 20, cursorY + 14);
    
    // Sangria Projetada (Gatilho de Urgência)
    if (projLoss > 0) {
      pdf.setTextColor(220, 40, 40);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`SANGRIA PROJETADA (+7d): R$ ${projLoss.toLocaleString('pt-BR')}`, 80, cursorY + 14);
    }

    // Label de Status
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(isCritical ? 200 : 40, isCritical ? 30 : 150, isCritical ? 30 : 60);
    pdf.text(`Diagnóstico: ${s.label.toUpperCase()}`, pageWidth - 20, cursorY + 14, { align: 'right' });

    // Gráfico de Barra (OEE / Eficiência)
    pdf.setTextColor(20, 20, 25);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Eficiência (OEE):', 20, cursorY + 22);

    // Fundo da barra de progresso
    pdf.setFillColor(235, 235, 235);
    pdf.rect(50, cursorY + 19, 70, 3.5, 'F');
    
    // Preenchimento da barra de progresso com base na cor
    if (eff >= 80) pdf.setFillColor(0, 184, 148); // Verde
    else if (eff >= 50) pdf.setFillColor(253, 203, 110); // Laranja/Amarelo
    else pdf.setFillColor(255, 71, 87); // Vermelho

    pdf.rect(50, cursorY + 19, (eff / 100) * 70, 3.5, 'F');
    
    pdf.setTextColor(60, 60, 60);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${eff}%`, 123, cursorY + 22);

    // SLA vs Tempo Real (Gargalo de fluxo)
    pdf.setTextColor(40, 40, 40);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Fluxo / Lead Time:', 135, cursorY + 22);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${(s as any).slaMetric || '-'}`, 166, cursorY + 22);

    pdf.setDrawColor(240, 240, 240);
    pdf.line(20, cursorY + 26, pageWidth - 20, cursorY + 26);

    // Ação Corretiva
    pdf.setTextColor(20, 20, 25);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AÇÃO EXIGIDA:', 20, cursorY + 34);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${(s as any).action || 'Manter rotina atual.'}`, 50, cursorY + 34);

    // Meta SMART (Indicador a ser batido)
    pdf.setFont('helvetica', 'bold');
    pdf.text('META IMEDIATA:', 20, cursorY + 41);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${(s as any).target || '-'}`, 50, cursorY + 41);

    // Checklist e Prazo
    pdf.setTextColor(100, 100, 100);
    pdf.text('[   ] Gestor compromissado com a Meta e Prazo estipulados.', 20, cursorY + 54);
    
    pdf.setDrawColor(150, 150, 150);
    pdf.line(pageWidth - 75, cursorY + 54, pageWidth - 20, cursorY + 54);
    pdf.text('Assinatura do Gestor:', pageWidth - 105, cursorY + 54);

    cursorY += 67;
  });

  // --- 3. DIRETRIZES DA INTELIGÊNCIA ARTIFICIAL ---
  if (cursorY > pageHeight - 50) { pdf.addPage(); cursorY = 20; }
  else { cursorY += 5; }

  pdf.setTextColor(20, 20, 25);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('3. DIAGNÓSTICO DO ALGORITMO (IA)', 15, cursorY);
  cursorY += 8;

  pdf.setTextColor(60, 60, 60);
  pdf.setFontSize(10);
  
  // Limpar "emojis" e caracteres especiais do Markdown que a fonte não processa (mantendo acentos e símbolos básicos latin1)
  const cleanAnalysisText = analysisText.replace(/[^\x20-\x7E\xA0-\xFF\n]/g, '');

  const lines = cleanAnalysisText.split('\n');
  
  lines.forEach(line => {
    let text = line.trim();
    if (!text) { cursorY += 2; return; }

    if (text.startsWith('**') && text.includes('**', 2)) {
      pdf.setFont('helvetica', 'bold');
      text = text.replace(/\*\*/g, '');
    } else {
      pdf.setFont('helvetica', 'normal');
    }

    if (text.startsWith('-') || text.startsWith('*')) {
      text = '  > ' + text.substring(1).trim();
      text = text.replace(/\*\*/g, ''); 
    }

    const splitText = pdf.splitTextToSize(text, pageWidth - 30);
    
    if (cursorY + (splitText.length * 5) > pageHeight - 20) {
      pdf.addPage(); cursorY = 20;
    }

    pdf.text(splitText, 15, cursorY);
    cursorY += (splitText.length * 5) + 1;
  });

  cursorY += 15;
  if (cursorY > pageHeight - 30) { pdf.addPage(); cursorY = 20; }

  // --- ASSINATURAS E CONCLUSÃO ---
  pdf.setDrawColor(150, 150, 150);
  pdf.line(pageWidth / 4, cursorY, (pageWidth / 4) * 3, cursorY);
  cursorY += 5;
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(100, 100, 100);
  pdf.text('VISTO E APROVAÇÃO DO CEO', pageWidth / 2, cursorY, { align: 'center' });

  // --- RODAPÉ NUMERADO ---
  const reportHash = Math.random().toString(36).substring(2, 10).toUpperCase();

  const pageCount = (pdf as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(7);
    pdf.setTextColor(150, 150, 150);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      `Página ${i} de ${pageCount} - GRUPO CROMOTRANSFER | CÓPIA CONTROLADA`,
      pageWidth / 2, 
      pageHeight - 10, 
      { align: 'center' }
    );
    // Adiciona o Hash
    pdf.text(`HASH: #CTIA-${dateStr.replace(/\//g,'')}-${reportHash}`, 15, pageHeight - 10);
  }

  pdf.save(filename);
}


