export interface AverbacaoRow {
  id?: string;
  dataAverbacao: string;
  origem: string;
  destino: string;
  placaCav: string;
  placaCarr: string;
  nf: string;
  valorNf: string;
  somaVl: string;
  protocolo: string;
  transportadora?: string;
  tecnologia?: string;
  nomeMotorista?: string;
  cpf?: string;
  telefone?: string;
}

export interface ExtraData {
  origem: string;
  destino: string;
  transportadora: string;
  placaCav: string;
  placaCarr: string;
  tecnologia: string;
  nomeMotorista: string;
  cpf: string;
  telefone: string;
}

export interface ParseResult {
  rows: AverbacaoRow[];
  extra: Partial<ExtraData>;
  detectedFormat: string;
}

// Helper to format currency
export function formatCurrencyValue(val: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(val);
}

// Helper to parse currency strings to numbers
export function parseCurrencyNumber(val?: string | number): number {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const clean = val.replace(/R\$/gi, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}

// Format raw number or string as currency display
export function cleanCurrencyString(val?: string): string {
  if (!val) return '';
  const num = parseCurrencyNumber(val);
  if (num > 0) {
    return formatCurrencyValue(num);
  }
  return val.trim();
}

// Clean plate string
export function cleanPlate(val?: string): string {
  if (!val) return '';
  const clean = val.replace(/[^A-Za-z0-9]/g, '').toUpperCase().trim();
  if (clean.length === 7) {
    return clean;
  }
  return val.trim().toUpperCase();
}

// Detect delimiter for text lines
function detectDelimiter(line: string): string {
  if (line.includes('\t')) return '\t';
  if (line.includes(';')) return ';';
  if ((line.match(/,/g) || []).length >= 4) return ',';
  if (line.includes('|')) return '|';
  return '\t';
}

export function parseAverbacaoData(text: string): ParseResult {
  if (!text || !text.trim()) {
    return { rows: [], extra: {}, detectedFormat: 'Vazio' };
  }

  const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (rawLines.length === 0) {
    return { rows: [], extra: {}, detectedFormat: 'Vazio' };
  }

  const delimiter = detectDelimiter(rawLines[0]);
  const splitLine = (l: string) => l.split(delimiter).map(c => c.trim());

  const firstCols = splitLine(rawLines[0]).map(c => c.toUpperCase());

  // Check if first row contains headers
  const headerKeywords = [
    'ORIGEM', 'DESTINO', 'CAVALO', 'CARRETA', 'PLACA', 'NF', 'NOTA',
    'VALOR', 'MOTORISTA', 'CONDUTOR', 'CPF', 'TELEFONE', 'TRANSPORT',
    'STATUS', 'PROTOCOLO', 'AVERB'
  ];
  const hasHeaderRow = headerKeywords.some(kw =>
    firstCols.some(col => col.includes(kw))
  );

  let detectedFormat = 'Tabela Tabulada';
  const rows: AverbacaoRow[] = [];
  const extra: Partial<ExtraData> = {};

  if (hasHeaderRow) {
    detectedFormat = `Planilha com Cabeçalhos (${firstCols.length} colunas)`;

    const findIdx = (patterns: string[]) => {
      return firstCols.findIndex(col =>
        patterns.some(p => col === p || col.includes(p))
      );
    };

    const origemIdx = findIdx(['ORIGEM', 'CIDADE ORIGEM', 'UNIDADE ORIGEM']);
    const destinoIdx = findIdx(['DESTINO', 'CIDADE DESTINO', 'UNIDADE DESTINO', 'DEST']);
    const cavaloIdx = firstCols.findIndex(col =>
      (col === 'CAVALO' || col.includes('PLACA CAV') || col.includes('CAVALO')) && !col.includes('MODELO')
    );
    const carretaIdx = firstCols.findIndex(col =>
      (col === 'CARRETA' || col.includes('PLACA CAR') || col.includes('CARRETA')) && !col.includes('MODELO') && !col.includes('ESTADO')
    );
    const transpIdx = findIdx(['TRANSPORTADOR', 'TRANSPORTADORA', 'TRANSP', 'EMPRESA']);
    const nfIdx = findIdx(['NF', 'NOTA FISCAL', 'Nº NF', 'N° NF', 'NUMERO NF', 'NOTAS']);
    let valorNfIdx = findIdx(['VALOR NF', 'VALOR DA CARGA', 'VALOR CARGA', 'VALOR_NF', 'VLR NF', 'VLR CARGA']);
    if (valorNfIdx === -1) {
      valorNfIdx = firstCols.findIndex(col => col.includes('VALOR') && !col.includes('DATA'));
    }
    const protocoloIdx = findIdx(['PROTOCOLO', 'AVERBACAO', 'AVERBAÇÃO', 'AT&M', 'NUM PROTOCOLO']);
    const dataIdx = firstCols.findIndex(col => col.includes('DATA') && !col.includes('HORA'));
    const tecIdx = findIdx(['TECNOLOGIA', 'RASTREADOR', 'SISTEMA PGR', 'SISTEMA']);
    const condutorIdx = findIdx(['CONDUTOR', 'MOTORISTA', 'NOME MOTORISTA', 'NOME CONDUTOR']);
    const cpfIdx = findIdx(['CPF']);
    const telIdx = findIdx(['TELEFONE', 'TEL', 'CELULAR', 'CONTATO WHATS', 'WHATSAPP', 'CONTATO']);

    for (let i = 1; i < rawLines.length; i++) {
      const parts = splitLine(rawLines[i]);
      if (parts.length === 0 || parts.every(p => !p)) continue;

      const rawOrig = (origemIdx >= 0 ? parts[origemIdx] : '') || '';
      const rawDest = (destinoIdx >= 0 ? parts[destinoIdx] : '') || '';
      const rawCav = (cavaloIdx >= 0 ? parts[cavaloIdx] : '') || '';
      const rawCarr = (carretaIdx >= 0 ? parts[carretaIdx] : '') || '';
      const rawNf = (nfIdx >= 0 ? parts[nfIdx] : '') || '';
      const rawValor = (valorNfIdx >= 0 ? parts[valorNfIdx] : '') || '';
      const rawProt = (protocoloIdx >= 0 ? parts[protocoloIdx] : '') || '';
      const rawData = (dataIdx >= 0 ? parts[dataIdx] : '') || '';
      const rawTransp = (transpIdx >= 0 ? parts[transpIdx] : '') || '';
      const rawTec = (tecIdx >= 0 ? parts[tecIdx] : '') || '';
      const rawMot = (condutorIdx >= 0 ? parts[condutorIdx] : '') || '';
      const rawCpf = (cpfIdx >= 0 ? parts[cpfIdx] : '') || '';
      const rawTel = (telIdx >= 0 ? parts[telIdx] : '') || '';

      const cleanedNf = rawNf.replace(/[^0-9]/g, '');
      const cleanedValor = cleanCurrencyString(rawValor);
      const cleanedProt = rawProt.trim() || (cleanedNf ? `AVB-${cleanedNf}` : '');

      rows.push({
        id: `row-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        dataAverbacao: rawData || '',
        origem: rawOrig.split('/')[0].trim().toUpperCase(),
        destino: rawDest.split('/')[0].trim().toUpperCase(),
        placaCav: cleanPlate(rawCav),
        placaCarr: cleanPlate(rawCarr),
        nf: cleanedNf || rawNf.trim(),
        valorNf: cleanedValor,
        somaVl: cleanedValor,
        protocolo: cleanedProt,
        transportadora: rawTransp.toUpperCase().trim() || undefined,
        tecnologia: rawTec.toUpperCase().trim() || undefined,
        nomeMotorista: rawMot.toUpperCase().trim() || undefined,
        cpf: rawCpf.trim() || undefined,
        telefone: rawTel.trim() || undefined
      });

      if (!extra.origem && rawOrig) extra.origem = rawOrig.split('/')[0].trim().toUpperCase();
      if (!extra.destino && rawDest) extra.destino = rawDest.split('/')[0].trim().toUpperCase();
      if (!extra.placaCav && rawCav) extra.placaCav = cleanPlate(rawCav);
      if (!extra.placaCarr && rawCarr) extra.placaCarr = cleanPlate(rawCarr);
      if (!extra.transportadora && rawTransp) extra.transportadora = rawTransp.toUpperCase().trim();
      if (!extra.tecnologia && rawTec) extra.tecnologia = rawTec.toUpperCase().trim();
      if (!extra.nomeMotorista && rawMot) extra.nomeMotorista = rawMot.toUpperCase().trim();
      if (!extra.cpf && rawCpf) extra.cpf = rawCpf.trim();
      if (!extra.telefone && rawTel) extra.telefone = rawTel.trim();
    }
  } else {
    // No headers detected - inspect line structure and column counts
    for (let i = 0; i < rawLines.length; i++) {
      const parts = splitLine(rawLines[i]);
      if (parts.length === 0 || parts.every(p => !p)) continue;

      // Case A: 15+ columns -> Operations Sheet (Controle / Pré-Alerta standard)
      if (parts.length >= 15) {
        detectedFormat = `Planilha de Operações (${parts.length} colunas)`;
        let rawOrig = parts[1] || '';
        let rawData = parts[3] || '';
        let rawDest = parts[10] || '';
        let rawTransp = parts[11] || '';
        let rawCav = parts[12] || '';
        let rawCarr = parts[13] || '';
        let rawNf = parts[16] || '';
        let rawTec = parts[18] || '';
        let rawMot = parts[19] || '';
        let rawCpf = parts[20] || '';
        let rawTel = parts[23] || '';
        let rawValor = parts[24] || '';

        // Dynamic fallback scans in case user copied a variation of columns
        parts.forEach((p, idx) => {
          const val = p.trim();
          if (!val) return;
          // Look for NF if empty or not matching pure digits
          if (!rawNf || !/^\d{4,9}$/.test(rawNf.replace(/[^0-9]/g, ''))) {
            if (/^\d{5,8}$/.test(val) && idx >= 10 && idx <= 20) {
              rawNf = val;
            }
          }
          // Look for CPF
          if (!rawCpf && /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(val)) {
            rawCpf = val;
          }
          // Look for Telephone
          if (!rawTel && (/^\(?\d{2}\)?\s*9?\d{4}-?\d{4}$/.test(val) || val.includes('(21)') || val.includes('(31)'))) {
            rawTel = val;
          }
          // Look for license plates
          const cleanP = cleanPlate(val);
          if (/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(cleanP)) {
            if (!rawCav) rawCav = cleanP;
            else if (!rawCarr) rawCarr = cleanP;
          }
          // Currency
          if (val.includes('R$') || (val.match(/^\d+[\.,]\d{2}$/) && !val.includes('/'))) {
            rawValor = val;
          }
        });

        const cleanedNf = rawNf.replace(/[^0-9]/g, '');
        const cleanedValor = cleanCurrencyString(rawValor);
        const cleanedProt = cleanedNf ? `AVB-${cleanedNf}` : '';

        rows.push({
          id: `row-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          dataAverbacao: rawData || '',
          origem: rawOrig.split('/')[0].trim().toUpperCase(),
          destino: rawDest.split('/')[0].trim().toUpperCase(),
          placaCav: cleanPlate(rawCav),
          placaCarr: cleanPlate(rawCarr),
          nf: cleanedNf || rawNf.trim(),
          valorNf: cleanedValor,
          somaVl: cleanedValor,
          protocolo: cleanedProt,
          transportadora: rawTransp.toUpperCase().trim() || undefined,
          tecnologia: rawTec.toUpperCase().trim() || undefined,
          nomeMotorista: rawMot.toUpperCase().trim() || undefined,
          cpf: rawCpf.trim() || undefined,
          telefone: rawTel.trim() || undefined
        });

        if (!extra.origem && rawOrig) extra.origem = rawOrig.split('/')[0].trim().toUpperCase();
        if (!extra.destino && rawDest) extra.destino = rawDest.split('/')[0].trim().toUpperCase();
        if (!extra.placaCav && rawCav) extra.placaCav = cleanPlate(rawCav);
        if (!extra.placaCarr && rawCarr) extra.placaCarr = cleanPlate(rawCarr);
        if (!extra.transportadora && rawTransp) extra.transportadora = rawTransp.toUpperCase().trim();
        if (!extra.tecnologia && rawTec) extra.tecnologia = rawTec.toUpperCase().trim();
        if (!extra.nomeMotorista && rawMot) extra.nomeMotorista = rawMot.toUpperCase().trim();
        if (!extra.cpf && rawCpf) extra.cpf = rawCpf.trim();
        if (!extra.telefone && rawTel) extra.telefone = rawTel.trim();
      }
      // Case B: 7 to 14 columns -> Standard Averbação TSV
      else if (parts.length >= 7) {
        detectedFormat = `Planilha de Averbação (${parts.length} colunas)`;
        const rawData = parts[0] || '';
        const rawOrig = parts[1] || '';
        const rawDest = parts[2] || '';
        const rawCav = parts[3] || '';
        const rawCarr = parts[4] || '';
        const rawNf = parts[5] || '';
        const rawValor = parts[6] || '';
        const rawSoma = parts[7] || '';
        const rawProt = parts[8] || '';

        const cleanedNf = rawNf.replace(/[^0-9]/g, '');
        const cleanedValor = cleanCurrencyString(rawValor);
        const cleanedProt = rawProt.trim() || (cleanedNf ? `AVB-${cleanedNf}` : '');

        let rawTransp = '';
        let rawMot = '';
        if (parts.length >= 10) {
          rawTransp = parts[9] || '';
        }
        if (parts.length >= 11) {
          rawMot = parts[10] || '';
        }

        rows.push({
          id: `row-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          dataAverbacao: rawData || '',
          origem: rawOrig.split('/')[0].trim().toUpperCase(),
          destino: rawDest.split('/')[0].trim().toUpperCase(),
          placaCav: cleanPlate(rawCav),
          placaCarr: cleanPlate(rawCarr),
          nf: cleanedNf || rawNf.trim(),
          valorNf: cleanedValor,
          somaVl: cleanCurrencyString(rawSoma) || cleanedValor,
          protocolo: cleanedProt,
          transportadora: rawTransp.toUpperCase().trim() || undefined,
          nomeMotorista: rawMot.toUpperCase().trim() || undefined
        });

        if (!extra.origem && rawOrig) extra.origem = rawOrig.split('/')[0].trim().toUpperCase();
        if (!extra.destino && rawDest) extra.destino = rawDest.split('/')[0].trim().toUpperCase();
        if (!extra.placaCav && rawCav) extra.placaCav = cleanPlate(rawCav);
        if (!extra.placaCarr && rawCarr) extra.placaCarr = cleanPlate(rawCarr);
        if (!extra.transportadora && rawTransp) extra.transportadora = rawTransp.toUpperCase().trim();
        if (!extra.nomeMotorista && rawMot) extra.nomeMotorista = rawMot.toUpperCase().trim();
      }
      // Case C: 2 to 6 columns -> Flexible Heuristic Extraction
      else if (parts.length >= 2) {
        detectedFormat = `Lista Rápida (${parts.length} colunas)`;
        let foundData = '';
        let foundOrig = '';
        let foundDest = '';
        let foundPlaca1 = '';
        let foundPlaca2 = '';
        let foundNf = '';
        let foundValor = '';
        let foundProt = '';

        parts.forEach((p) => {
          const trimmed = p.trim();
          if (!trimmed) return;

          // Date regex: DD/MM or DD/MM/YYYY
          if (!foundData && /^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/.test(trimmed)) {
            foundData = trimmed;
            return;
          }
          // Currency regex: contains R$ or digits with comma
          if (!foundValor && (/R\$/i.test(trimmed) || /^\d{1,3}(\.\d{3})*,\d{2}$/.test(trimmed))) {
            foundValor = cleanCurrencyString(trimmed);
            return;
          }
          // Protocol regex
          if (!foundProt && /^(AVB|AT&M|PROT|\d{10,})/i.test(trimmed)) {
            foundProt = trimmed.toUpperCase();
            return;
          }
          // License plate regex: 3 letters + 4 alphanumeric
          const cleanedPl = cleanPlate(trimmed);
          if (/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(cleanedPl)) {
            if (!foundPlaca1) foundPlaca1 = cleanedPl;
            else if (!foundPlaca2) foundPlaca2 = cleanedPl;
            return;
          }
          // NF: pure number 4 to 9 digits
          if (!foundNf && /^\d{4,9}$/.test(trimmed)) {
            foundNf = trimmed;
            return;
          }
          // Cities / text
          if (!foundOrig && (trimmed.toUpperCase().includes('SANTA LUZIA') || trimmed.toUpperCase().includes('POUSO ALEGRE') || trimmed.toUpperCase().includes('VARGINHA'))) {
            foundOrig = trimmed.split('/')[0].trim().toUpperCase();
            return;
          }
          if (!foundDest && (trimmed.toUpperCase().includes('LONDRINA') || trimmed.toUpperCase().includes('RIO') || trimmed.toUpperCase().includes('GUARULHOS') || trimmed.toUpperCase().includes('SUMARÉ') || trimmed.toUpperCase().includes('GOV'))) {
            foundDest = trimmed.split('/')[0].trim().toUpperCase();
            return;
          }
        });

        const cleanedProt = foundProt || (foundNf ? `AVB-${foundNf}` : '');

        rows.push({
          id: `row-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          dataAverbacao: foundData || '',
          origem: foundOrig,
          destino: foundDest,
          placaCav: foundPlaca1,
          placaCarr: foundPlaca2,
          nf: foundNf,
          valorNf: foundValor,
          somaVl: foundValor,
          protocolo: cleanedProt
        });

        if (!extra.origem && foundOrig) extra.origem = foundOrig;
        if (!extra.destino && foundDest) extra.destino = foundDest;
        if (!extra.placaCav && foundPlaca1) extra.placaCav = cleanPlate(foundPlaca1);
        if (!extra.placaCarr && foundPlaca2) extra.placaCarr = cleanPlate(foundPlaca2);
      }
    }
  }

  // Calculate sum of values if multiple rows
  const totalSum = rows.reduce((acc, r) => acc + parseCurrencyNumber(r.valorNf), 0);
  const formattedTotal = formatCurrencyValue(totalSum);
  rows.forEach(r => {
    if (!r.somaVl || r.somaVl === 'R$ 0,00') {
      r.somaVl = formattedTotal;
    }
  });

  return { rows, extra, detectedFormat };
}
