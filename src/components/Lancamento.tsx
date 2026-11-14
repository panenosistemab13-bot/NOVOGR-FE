import React, { useState, useEffect } from 'react';
import {
  Clipboard,
  Copy,
  Check,
  Trash2,
  ArrowLeft,
  FileSpreadsheet,
  Sparkles,
  Plus,
  Search,
  Zap,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { safeCopyText, safeCopyHtmlAndText } from '../utils/clipboard';

export interface LancamentoRow {
  id: string;
  data: string;
  destino: string;
  motorista: string;
  chegou: string;
  cavalo: string;
  carreta: string;
  positron: string;
  resgate: string;
  envio: string;
}

const EXAMPLE_ROWS_FROM_IMAGE: LancamentoRow[] = [
  { id: '1', data: '01/11/2026', destino: 'Santa Luzia x Rio De Janeiro', motorista: 'PAULO DE OLIVEIRA RAMOS', chegou: 'SIM', cavalo: 'SBK5C22', carreta: 'POG1245', positron: 'R100000761', resgate: 'OK', envio: 'OK' },
  { id: '2', data: '01/11/2026', destino: 'Santa Luzia x Rio De Janeiro', motorista: 'PAULO DE OLIVEIRA RAMOS', chegou: 'SIM', cavalo: 'SBK5C22', carreta: 'POG0885', positron: 'R100002422', resgate: 'OK', envio: 'OK' },
  { id: '3', data: '02/11/2026', destino: 'Mossoró-RN x Rio de Janeiro-RJ', motorista: 'VALDIR NUNES JUNIOR', chegou: 'SIM', cavalo: 'UUN-6J15', carreta: 'UUG-3A65', positron: 'R100000062', resgate: 'OK', envio: 'OK' },
  { id: '4', data: '03/11/2026', destino: 'Natal - RN x - Rio de Janeiro - RJ', motorista: 'JOAO PAULO ANTUNES REGIS', chegou: 'SIM', cavalo: 'UVF3H25', carreta: 'UVC0E75', positron: 'R100000810', resgate: 'OK', envio: 'OK' },
  { id: '5', data: '03/11/2026', destino: 'Natal - RN x - Rio de Janeiro - RJ', motorista: 'JOAO PAULO ANTUNES REGIS', chegou: 'SIM', cavalo: 'UVF3H25', carreta: 'UUO9B65', positron: 'R100000219', resgate: 'OK', envio: 'OK' },
  { id: '6', data: '03/11/2026', destino: 'Natal - RN x - Rio de Janeiro - RJ', motorista: 'MILTON NUNES DE MEDEIROS JUNIOR', chegou: 'SIM', cavalo: 'UUY8J95', carreta: 'UVD4J66', positron: 'R100000883', resgate: 'OK', envio: 'OK' },
  { id: '7', data: '03/11/2026', destino: 'Natal - RN x - Rio de Janeiro - RJ', motorista: 'MILTON NUNES DE MEDEIROS JUNIOR', chegou: 'SIM', cavalo: 'UUY8J95', carreta: 'UVD8C16', positron: 'R100003185', resgate: 'OK', envio: 'OK' },
  { id: '8', data: '06/11/2026', destino: 'Santa Luzia x Rio De Janeiro', motorista: 'SAMUEL ALVES PEREIRA DA SILVA', chegou: 'SIM', cavalo: 'PNY-2215', carreta: 'POF9075', positron: 'R100003153', resgate: 'OK', envio: 'OK' },
  { id: '9', data: '06/11/2026', destino: 'Santa Luzia x Rio De Janeiro', motorista: 'DANIEL PEREIRA DA CUNHA', chegou: 'SIM', cavalo: 'SBK-4I42', carreta: 'POR5E42', positron: 'R100000877', resgate: 'OK', envio: 'OK' },
  { id: '10', data: '06/11/2026', destino: 'Santa Luzia x Rio De Janeiro', motorista: 'ADILSON DOS REIS SILVA', chegou: 'SIM', cavalo: 'SAR-8D82', carreta: 'POG0545', positron: 'R100002338', resgate: 'OK', envio: 'OK' },
  { id: '11', data: '06/11/2026', destino: 'MONTES CLAROS/MG X RIO DE JANEIRO', motorista: 'Ronaldo Adriano da Silva', chegou: 'SIM', cavalo: 'TYQ6F08', carreta: 'TYQ6F11', positron: 'R100000829', resgate: 'OK', envio: 'OK' },
  { id: '12', data: '06/11/2026', destino: 'MONTES CLAROS/MG X RIO DE JANEIRO', motorista: 'Ronaldo Adriano da Silva', chegou: 'SIM', cavalo: 'TYQ6F08', carreta: 'TYQ6F14', positron: 'R100000858', resgate: 'OK', envio: 'OK' },
  { id: '13', data: '07/11/2026', destino: 'Santa Luzia x Rio De Janeiro', motorista: 'LEANDRO ALVES PIRES', chegou: 'SIM', cavalo: 'SBK5C22', carreta: 'POG1245', positron: 'R100002339', resgate: 'OK', envio: 'OK' },
  { id: '14', data: '08/11/2026', destino: 'Santa Luzia x Rio De Janeiro', motorista: 'SAMUEL ALVES PEREIRA DA SILVA', chegou: 'SIM', cavalo: 'PNY-2215', carreta: 'POF9175', positron: 'R100003133', resgate: 'OK', envio: 'OK' },
  { id: '15', data: '08/11/2026', destino: 'Santa Luzia x Rio De Janeiro', motorista: 'ANDERSON DE ALMEIDA SOARES', chegou: 'SIM', cavalo: 'THX-8C51', carreta: 'PNE4812', positron: 'R100003135', resgate: 'OK', envio: 'OK' },
  { id: '16', data: '10/11/2026', destino: 'Santa Luzia x Rio De Janeiro', motorista: 'PAULO PEREIRA DE SOUSA', chegou: 'SIM', cavalo: 'TYT8A14', carreta: 'POF7875', positron: 'R100000718', resgate: 'OK', envio: 'OK' },
  { id: '17', data: '10/11/2026', destino: 'Santa Luzia x Rio De Janeiro', motorista: 'PAULO PEREIRA DE SOUSA', chegou: 'SIM', cavalo: 'TYT8A14', carreta: 'POF8075', positron: 'R100000876', resgate: 'OK', envio: 'OK' },
  { id: '18', data: '10/11/2026', destino: 'Santa Luzia x Rio De Janeiro', motorista: 'ADRIANO CESAR RODRIGUES', chegou: 'SIM', cavalo: 'UVF-7G65', carreta: 'UUH3G15', positron: 'R100002349', resgate: 'OK', envio: 'OK' },
  { id: '19', data: '10/11/2026', destino: 'Santa Luzia x Rio De Janeiro', motorista: 'Weber Dalfran Fernandes', chegou: 'SIM', cavalo: 'SBK5A52', carreta: 'POG0685', positron: 'R100000661', resgate: 'OK', envio: 'OK' },
];

// Regex que identifica o número da isca começando com R100... ou 30D100...
const ISCA_GLOBAL_REGEX = /\b(R100\d{4,9}|30D100\d{4,9}|R10\d{5,9}|30D10\d{5,9})\b/gi;
const ISCA_SINGLE_REGEX = /^(R100\d{4,9}|30D100\d{4,9}|R10\d{5,9}|30D10\d{5,9})$/i;
const PLATE_SINGLE_REGEX = /^[A-Z]{3}-?\d[A-Z0-9]\d{2}$/i;
const DATE_SLASH_REGEX = /\b(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/;
const DATE_SHORT_MON_REGEX = /^(\d{1,2})[.\-\s]+(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\.?$/i;

const MONTH_NAME_TO_NUM: Record<string, string> = {
  jan: '01', fev: '02', mar: '03', abr: '04', mai: '05', jun: '06',
  jul: '07', ago: '08', set: '09', out: '10', nov: '11', dez: '12'
};

function normalizeDateString(raw: string): string {
  const trimmed = raw.trim();
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, '0');
    const month = slashMatch[2].padStart(2, '0');
    let year = slashMatch[3] || String(new Date().getFullYear());
    if (year.length === 2) year = `20${year}`;
    return `${day}/${month}/${year}`;
  }
  const monMatch = trimmed.match(DATE_SHORT_MON_REGEX);
  if (monMatch) {
    const day = monMatch[1].padStart(2, '0');
    const mon = MONTH_NAME_TO_NUM[monMatch[2].toLowerCase()] || '11';
    const year = String(new Date().getFullYear());
    return `${day}/${mon}/${year}`;
  }
  return trimmed;
}

function formatTitleCaseCity(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(w => (w.length > 2 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

/**
 * Analisa texto colado (linhas de planilha, pré-alerta, e-mail ou lista)
 * identificando automaticamente o N° da Isca (ex: R100003185 ou 30D100003291)
 * e estruturando as 9 colunas exatas da planilha.
 */
export function parseLancamentoInput(rawText: string, defaultDestinoRota = 'Santa Luzia x Rio De Janeiro'): LancamentoRow[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const results: LancamentoRow[] = [];
  const todayFormatted = new Date().toLocaleDateString('pt-BR');

  // Verifica se é um bloco de Pré-Alerta / mensagem multi-linha (ex: "Data:", "Motorista:", "Cavalo:")
  const isMultiLineMessage = lines.some(l => /^(data|motorista|condutor|cavalo|carreta|placa|destino|origem|isca)/i.test(l)) && !lines[0].includes('\t');

  if (isMultiLineMessage) {
    const allIscas = Array.from(new Set((rawText.match(ISCA_GLOBAL_REGEX) || []).map(s => s.toUpperCase())));
    if (allIscas.length > 0) {
      let data = todayFormatted;
      let origem = 'Santa Luzia';
      let destino = 'Rio De Janeiro';
      let rotaExplicita = '';
      let motorista = '';
      let cavalo = '';
      const carretas: string[] = [];

      for (const line of lines) {
        const dMatch = line.match(DATE_SLASH_REGEX);
        if (dMatch && (line.toLowerCase().includes('data') || data === todayFormatted)) {
          data = normalizeDateString(dMatch[1]);
        }
        if (/motorista|condutor/i.test(line)) {
          motorista = line.replace(/^.*?(?:motorista|condutor)\s*[:\-]\s*/i, '').trim().toUpperCase();
        }
        if (/origem/i.test(line)) {
          origem = line.replace(/^.*?origem\s*[:\-]\s*/i, '').trim();
        }
        if (/destino/i.test(line)) {
          const val = line.replace(/^.*?destino\s*[:\-]\s*/i, '').trim();
          if (/\s+x\s+/i.test(val)) {
            rotaExplicita = val;
          } else {
            destino = val;
          }
        }
        if (/cavalo/i.test(line)) {
          const pMatch = line.match(/\b([A-Z]{3}-?\d[A-Z0-9]\d{2})\b/i);
          if (pMatch) cavalo = pMatch[1].toUpperCase();
        }
        if (/carreta|ba[uú]|reboque/i.test(line)) {
          const matches = line.match(/\b([A-Z]{3}-?\d[A-Z0-9]\d{2})\b/gi);
          if (matches) {
            matches.forEach(m => {
              const up = m.toUpperCase();
              if (up !== cavalo && !carretas.includes(up)) carretas.push(up);
            });
          }
        }
      }

      // Se não achou placas com rótulo, busca todas as placas no texto
      if (!cavalo) {
        const allPlates = (rawText.match(/\b([A-Z]{3}-?\d[A-Z0-9]\d{2})\b/gi) || []).map(p => p.toUpperCase());
        if (allPlates.length > 0) cavalo = allPlates[0];
        if (allPlates.length > 1 && carretas.length === 0) {
          allPlates.slice(1).forEach(p => {
            if (!carretas.includes(p)) carretas.push(p);
          });
        }
      }

      const finalRota = rotaExplicita || `${formatTitleCaseCity(origem)} x ${formatTitleCaseCity(destino)}`;

      allIscas.forEach((isca, idx) => {
        results.push({
          id: `lanc-${Date.now()}-${idx}`,
          data,
          destino: finalRota || defaultDestinoRota,
          motorista: motorista || '-',
          chegou: 'SIM',
          cavalo: cavalo || '-',
          carreta: carretas[idx] || carretas[0] || '-',
          positron: isca,
          resgate: 'OK',
          envio: 'OK'
        });
      });

      return results;
    }
  }

  // Processamento linha a linha (planilha copiada, TSV, CSV ou linhas soltas)
  lines.forEach((line, lineIdx) => {
    const upperLine = line.toUpperCase();
    // Ignora linha de cabeçalho
    if (
      (upperLine.includes('NOME MOTORISTA') && upperLine.includes('CAVALO')) ||
      (upperLine.includes('ID ISCA') && upperLine.includes('STATUS')) ||
      (upperLine.startsWith('DATA') && upperLine.includes('POSITRON'))
    ) {
      return;
    }

    const iscasInLine = (line.match(ISCA_GLOBAL_REGEX) || []).map(s => s.toUpperCase());
    if (iscasInLine.length === 0) return;

    const delimiter = line.includes('\t') ? '\t' : line.includes(';') ? ';' : line.includes('|') ? '|' : null;

    if (delimiter) {
      const cells = line.split(delimiter).map(c => c.trim());
      const firstCellIsIsca = ISCA_SINGLE_REGEX.test(cells[0] || '');

      // Caso 1: Linha vinda da Planilha Geral de Controle de Iscas
      // Ordem: 0:ID ISCA | 1:DESTINO | 2:STATUS | 3:OBS 1 | 4:DATA STATUS | 5:CARRETA | 6:CAVALO | 7:MOTORISTA | 8:UNIDADE
      if (firstCellIsIsca && cells.length >= 6) {
        const idIsca = cells[0].toUpperCase();
        const destCity = cells[1] || 'Rio De Janeiro';
        const dataRaw = cells[4] || todayFormatted;
        const carreta = (cells[5] || '').toUpperCase();
        const cavalo = (cells[6] || '').toUpperCase();
        const motorista = cells[7] || '';
        const unidade = cells[8] || 'Santa Luzia';

        const rota = /\s+x\s+/i.test(destCity)
          ? destCity
          : `${formatTitleCaseCity(unidade)} x ${formatTitleCaseCity(destCity)}`;

        results.push({
          id: `lanc-${Date.now()}-${lineIdx}`,
          data: normalizeDateString(dataRaw),
          destino: rota,
          motorista: motorista || '-',
          chegou: 'SIM',
          cavalo: cavalo || '-',
          carreta: carreta || '-',
          positron: idIsca,
          resgate: 'OK',
          envio: 'OK'
        });
        return;
      }

      // Caso 2: Linha já no padrão da Planilha da Filial (DATA | DESTINO | MOTORISTA | CHEGOU | CAVALO | CARRETA | N° POSITRON | RESGATE | ENVIO)
      // ou variações tabuladas
      let data = '';
      let destino = '';
      let motorista = '';
      let chegou = 'SIM';
      let cavalo = '';
      let carreta = '';
      const positron = iscasInLine[0];
      let resgate = 'OK';
      let envio = 'OK';

      const platesFound: string[] = [];
      const textCandidates: string[] = [];

      cells.forEach((cell) => {
        if (!cell) return;
        const up = cell.toUpperCase();

        if (ISCA_SINGLE_REGEX.test(up)) {
          return;
        }
        if (!data && (DATE_SLASH_REGEX.test(cell) || DATE_SHORT_MON_REGEX.test(cell))) {
          data = normalizeDateString(cell);
          return;
        }
        if (PLATE_SINGLE_REGEX.test(up)) {
          platesFound.push(up);
          return;
        }
        if (up === 'SIM' || up === 'NÃO' || up === 'NAO') {
          chegou = up;
          return;
        }
        if (up === 'OK' || up === 'PENDENTE' || up === 'EM ROTA(IDA)' || up === 'NO DESTINO' || up === 'PRÉ ALERTA OK' || up === 'PRE ALERTA OK') {
          return;
        }
        if (/\s+x\s+/i.test(cell)) {
          destino = cell;
          return;
        }
        textCandidates.push(cell);
      });

      if (platesFound.length >= 2) {
        cavalo = platesFound[0];
        carreta = platesFound[1];
      } else if (platesFound.length === 1) {
        cavalo = platesFound[0];
      }

      if (!destino && textCandidates.length >= 2) {
        destino = textCandidates[0];
        motorista = textCandidates[1];
      } else if (textCandidates.length >= 1) {
        motorista = textCandidates[0];
      }

      results.push({
        id: `lanc-${Date.now()}-${lineIdx}`,
        data: data || todayFormatted,
        destino: destino || defaultDestinoRota,
        motorista: motorista || '-',
        chegou,
        cavalo: cavalo || '-',
        carreta: carreta || '-',
        positron,
        resgate,
        envio
      });
      return;
    }

    // Caso 3: Linha sem delimitador fixo (espaços / texto corrido contendo nº da isca)
    const dateMatch = line.match(DATE_SLASH_REGEX);
    const data = dateMatch ? normalizeDateString(dateMatch[1]) : todayFormatted;
    const plates = (line.match(/\b([A-Z]{3}-?\d[A-Z0-9]\d{2})\b/gi) || []).map(p => p.toUpperCase());

    iscasInLine.forEach((isca, idx) => {
      results.push({
        id: `lanc-${Date.now()}-${lineIdx}-${idx}`,
        data,
        destino: defaultDestinoRota,
        motorista: '-',
        chegou: 'SIM',
        cavalo: plates[0] || '-',
        carreta: plates[idx + 1] || plates[1] || '-',
        positron: isca,
        resgate: 'OK',
        envio: 'OK'
      });
    });
  });

  return results;
}

export default function Lancamento({ onBack }: { onBack?: () => void }) {
  const [pasteInput, setPasteInput] = useState('');
  const [filialHeader, setFilialHeader] = useState('DESTINO À FILIAL RIO DE JANEIRO');
  const [defaultRota, setDefaultRota] = useState('Santa Luzia x Rio De Janeiro');
  const [searchTerm, setSearchTerm] = useState('');
  const [outputMode, setOutputMode] = useState<'tabela_completa' | 'isca_ok_ok' | 'apenas_iscas'>('tabela_completa');
  const [copiedMain, setCopiedMain] = useState(false);
  const [copiedWithHeader, setCopiedWithHeader] = useState(false);
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const [rows, setRows] = useState<LancamentoRow[]>(() => {
    try {
      const saved = localStorage.getItem('lancamento_positron_rows');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return EXAMPLE_ROWS_FROM_IMAGE;
  });

  useEffect(() => {
    try {
      localStorage.setItem('lancamento_positron_rows', JSON.stringify(rows));
    } catch {}
  }, [rows]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2800);
  };

  // Detecta iscas em tempo real enquanto o usuário digita ou cola no campo em branco
  const detectedIscasPreview = Array.from(
    new Set((pasteInput.match(ISCA_GLOBAL_REGEX) || []).map(s => s.toUpperCase()))
  );

  const handleProcessPaste = (textToProcess?: string) => {
    const raw = textToProcess !== undefined ? textToProcess : pasteInput;
    if (!raw.trim()) {
      showToast('Cole as informações no campo em branco antes de processar.');
      return;
    }

    const parsed = parseLancamentoInput(raw, defaultRota);
    if (parsed.length > 0) {
      setRows(parsed);
      setPasteInput('');
      showToast(`${parsed.length} lançamento(s) de isca identificado(s) e formatado(s)!`);
    } else {
      showToast('Nenhuma isca (ex: R100003185 ou 30D100003291) encontrada no texto colado.');
    }
  };

  const handlePasteFromClipboardButton = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setPasteInput(text);
        const parsed = parseLancamentoInput(text, defaultRota);
        if (parsed.length > 0) {
          setRows(parsed);
          showToast(`${parsed.length} isca(s) identificada(s) automaticamente da área de transferência!`);
        }
      } else {
        showToast('A área de transferência está vazia.');
      }
    } catch {
      showToast('Clique no campo em branco e pressione Ctrl+V.');
    }
  };

  const handleUpdateCell = (index: number, field: keyof LancamentoRow, value: string) => {
    setRows(prev => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], [field]: value };
      }
      return next;
    });
  };

  const handleAddBlankRow = () => {
    const today = new Date().toLocaleDateString('pt-BR');
    setRows(prev => [
      ...prev,
      {
        id: `lanc-${Date.now()}`,
        data: today,
        destino: defaultRota,
        motorista: '',
        chegou: 'SIM',
        cavalo: '',
        carreta: '',
        positron: 'R10000',
        resgate: 'OK',
        envio: 'OK'
      }
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setRows([]);
    setPasteInput('');
    try {
      localStorage.removeItem('lancamento_positron_rows');
    } catch {}
    showToast('Tabela limpa! Cole novas informações no campo em branco.');
  };

  const filteredRows = rows.filter(r => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.positron.toLowerCase().includes(term) ||
      r.motorista.toLowerCase().includes(term) ||
      r.cavalo.toLowerCase().includes(term) ||
      r.carreta.toLowerCase().includes(term) ||
      r.destino.toLowerCase().includes(term) ||
      r.data.toLowerCase().includes(term)
    );
  });

  // Gera exatamente o texto TSV para colar na planilha
  const generateSpreadsheetText = (includeHeader = false, customRows?: LancamentoRow[]) => {
    const targetRows = customRows || filteredRows;
    if (outputMode === 'apenas_iscas') {
      return targetRows.map(r => r.positron).join('\n');
    }
    if (outputMode === 'isca_ok_ok') {
      const header = ['N° POSITRON', 'RESGATE', 'ENVIO'].join('\t');
      const body = targetRows.map(r => [r.positron, r.resgate || 'OK', r.envio || 'OK'].join('\t')).join('\n');
      return includeHeader ? `${header}\n${body}` : body;
    }

    const header = [
      'DATA',
      filialHeader,
      'NOME MOTORISTA',
      'CHEGOU',
      'CAVALO',
      'CARRETA',
      'N° POSITRON',
      'RESGATE',
      'ENVIO'
    ].join('\t');

    const body = targetRows
      .map(r =>
        [
          r.data,
          r.destino,
          r.motorista,
          r.chegou || 'SIM',
          r.cavalo,
          r.carreta,
          r.positron,
          r.resgate || 'OK',
          r.envio || 'OK'
        ].join('\t')
      )
      .join('\n');

    return includeHeader ? `${header}\n${body}` : body;
  };

  // Gera HTML estilizado idêntico à planilha em anexo (com fundo amarelo no N° POSITRON e verde em SIM/OK/OK)
  const generateSpreadsheetHtml = (includeHeader = false, customRows?: LancamentoRow[]) => {
    const targetRows = customRows || filteredRows;
    if (outputMode !== 'tabela_completa') {
      return `<pre>${generateSpreadsheetText(includeHeader, targetRows)}</pre>`;
    }

    const headerHtml = includeHeader
      ? `<thead>
          <tr style="background-color:#000000;color:#ffffff;font-weight:bold;font-style:italic;font-family:Calibri,Arial,sans-serif;font-size:11pt;text-align:center;">
            <th style="border:1px solid #000000;padding:4px 8px;">DATA</th>
            <th style="border:1px solid #000000;padding:4px 8px;">${filialHeader}</th>
            <th style="border:1px solid #000000;padding:4px 8px;">NOME MOTORISTA</th>
            <th style="border:1px solid #000000;padding:4px 8px;">CHEGOU</th>
            <th style="border:1px solid #000000;padding:4px 8px;">CAVALO</th>
            <th style="border:1px solid #000000;padding:4px 8px;">CARRETA</th>
            <th style="border:1px solid #000000;padding:4px 8px;">N° POSITRON</th>
            <th style="border:1px solid #000000;padding:4px 8px;">RESGATE</th>
            <th style="border:1px solid #000000;padding:4px 8px;">ENVIO</th>
          </tr>
        </thead>`
      : '';

    const rowsHtml = targetRows
      .map(
        r => `<tr style="font-family:Calibri,Arial,sans-serif;font-size:11pt;text-align:center;">
          <td style="border:1px solid #000000;padding:3px 8px;background-color:#ffffff;color:#000000;">${r.data}</td>
          <td style="border:1px solid #000000;padding:3px 8px;background-color:#ffffff;color:#000000;">${r.destino}</td>
          <td style="border:1px solid #000000;padding:3px 8px;background-color:#ffffff;color:#000000;">${r.motorista}</td>
          <td style="border:1px solid #000000;padding:3px 8px;background-color:#D9EAD3;color:#274E13;font-weight:bold;">${r.chegou || 'SIM'}</td>
          <td style="border:1px solid #000000;padding:3px 8px;background-color:#ffffff;color:#000000;">${r.cavalo}</td>
          <td style="border:1px solid #000000;padding:3px 8px;background-color:#ffffff;color:#000000;">${r.carreta}</td>
          <td style="border:1px solid #000000;padding:3px 8px;background-color:#FFFF00;color:#000000;font-weight:bold;">${r.positron}</td>
          <td style="border:1px solid #000000;padding:3px 8px;background-color:#D9EAD3;color:#274E13;font-weight:bold;">${r.resgate || 'OK'}</td>
          <td style="border:1px solid #000000;padding:3px 8px;background-color:#D9EAD3;color:#274E13;font-weight:bold;">${r.envio || 'OK'}</td>
        </tr>`
      )
      .join('');

    return `<table style="border-collapse:collapse;border:1px solid #000000;">${headerHtml}<tbody>${rowsHtml}</tbody></table>`;
  };

  const handleCopyAll = async (includeHeader: boolean) => {
    if (filteredRows.length === 0) return;
    const plain = generateSpreadsheetText(includeHeader);
    const html = generateSpreadsheetHtml(includeHeader);
    await safeCopyHtmlAndText(html, plain);
    if (includeHeader) {
      setCopiedWithHeader(true);
      setTimeout(() => setCopiedWithHeader(false), 2500);
    } else {
      setCopiedMain(true);
      setTimeout(() => setCopiedMain(false), 2500);
    }
    showToast(`${filteredRows.length} linha(s) copiada(s) para colar na planilha (Ctrl+V)!`);
  };

  const handleCopySingleRow = async (row: LancamentoRow) => {
    const plain = generateSpreadsheetText(false, [row]);
    const html = generateSpreadsheetHtml(false, [row]);
    await safeCopyHtmlAndText(html, plain);
    setCopiedRowId(row.id);
    setTimeout(() => setCopiedRowId(null), 2000);
    showToast(`Isca ${row.positron} copiada para colar na planilha!`);
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F0E6] p-4 sm:p-6 text-[#25231F] font-sans text-left space-y-5">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-[#292820] text-[#FFFCF6] border border-[#C49A45] text-xs font-mono font-bold shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-[#E6D2A3]" />
          <span>{notification}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3.5 py-2 rounded-xl bg-[#F5F0E6] hover:bg-[#E6D2A3]/50 text-[#292820] border border-[#E6D2A3] text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowLeft size={14} />
              <span>Voltar</span>
            </button>
          )}
          <div className="w-10 h-10 rounded-xl bg-[#292820] border border-[#C49A45]/60 flex items-center justify-center text-[#E6D2A3] shadow-xs shrink-0">
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-[#292820] uppercase tracking-tight">
                PASTA DE LANÇAMENTO DE ISCAS
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#C49A45]/20 border border-[#C49A45]/50 text-[#9A7230] text-[10px] font-mono font-black uppercase">
                R10000... / 30D10000...
              </span>
            </div>
            <p className="text-xs text-[#77736B] mt-0.5 font-medium">
              Cole as informações no campo em branco: o sistema identifica automaticamente o N° da Isca e gera o texto exato para colar na planilha.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setRows(EXAMPLE_ROWS_FROM_IMAGE);
              showToast('Exemplo da planilha carregado!');
            }}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF5E8] text-[#292820] border border-[#E6D2A3] text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Sparkles size={13} className="text-[#C49A45]" />
            <span>Carregar Modelo da Imagem</span>
          </button>

          {rows.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3.5 py-2 rounded-xl bg-[#FFF5F5] hover:bg-[#FFE3E3] text-[#C91F2D] border border-red-300 text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Trash2 size={13} />
              <span>Limpar Tudo</span>
            </button>
          )}
        </div>
      </div>

      {/* STEP 1: CAMPO EM BRANCO PARA COLAR INFORMAÇÕES */}
      <div className="bg-[#FFFCF6] border-2 border-[#C49A45]/60 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6D2A3]/70 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#C49A45] text-[#292820] flex items-center justify-center font-black text-xs">
              1
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#292820]">
                CAMPO EM BRANCO — COLE AS INFORMAÇÕES AQUI (CTRL+V)
              </h2>
              <p className="text-[11px] text-[#77736B]">
                Aceita linhas da planilha, dados do Pré-Alerta, mensagens ou qualquer texto contendo iscas iniciadas com <strong>R10000...</strong> ou <strong>30D10000...</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePasteFromClipboardButton}
              className="px-3.5 py-2 rounded-xl bg-[#292820] hover:bg-[#3A3830] text-[#E6D2A3] border border-[#C49A45]/40 text-[11px] font-black uppercase flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Clipboard size={13} className="text-[#C49A45]" />
              <span>Colar da Área de Transferência</span>
            </button>
          </div>
        </div>

        <textarea
          rows={5}
          value={pasteInput}
          onChange={(e) => setPasteInput(e.target.value)}
          placeholder={`Cole aqui as informações (Ctrl+V)...\nExemplo:\n03/11/2026\tNatal - RN x - Rio de Janeiro - RJ\tMILTON NUNES DE MEDEIROS JUNIOR\tSIM\tUUY8J95\tUVD8C16\tR100003185\tOK\tOK\nOu texto contendo R100003185 / 30D100003291...`}
          className="w-full bg-white text-[#292820] border-2 border-[#E6D2A3] focus:border-[#C49A45] rounded-xl p-3.5 font-mono text-xs outline-none transition-all shadow-inner placeholder:text-stone-400"
        />

        {/* Real-time Isca detection bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-black uppercase text-[#77736B] flex items-center gap-1.5">
              <Radio size={13} className={detectedIscasPreview.length > 0 ? "text-emerald-600 animate-pulse" : "text-stone-400"} />
              Iscas detectadas no texto:
            </span>
            {detectedIscasPreview.length > 0 ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                {detectedIscasPreview.map(isca => (
                  <span
                    key={isca}
                    className="px-2.5 py-0.5 rounded-md bg-[#FFFF00] text-black border border-black font-mono font-black text-xs shadow-2xs"
                  >
                    {isca}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[11px] font-mono text-stone-400">
                Aguardando colagem (ex: R100003185 ou 30D100003291)...
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleProcessPaste()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C49A45] via-[#D8B15A] to-[#9A7230] hover:brightness-105 text-[#292820] font-black uppercase text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
          >
            <Zap size={15} className="fill-[#292820]" />
            <span>IDENTIFICAR ISCAS E GERAR TEXTO</span>
          </button>
        </div>
      </div>

      {/* STEP 2: TEXTO PRONTO PARA COLAR NA PLANILHA */}
      <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#E6D2A3]/70 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#292820] text-[#E6D2A3] flex items-center justify-center font-black text-xs">
              2
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#292820]">
                TEXTO EXATO GERADO PARA COLAR NA PLANILHA ({filteredRows.length} {filteredRows.length === 1 ? 'LINHA' : 'LINHAS'})
              </h2>
              <p className="text-[11px] text-[#77736B]">
                Copie abaixo e aperte <strong>Ctrl+V</strong> diretamente na sua planilha Excel ou Google Sheets.
              </p>
            </div>
          </div>

          {/* Mode selector & Copy buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-[#F5F0E6] p-1 rounded-xl border border-[#E6D2A3]">
              {[
                { id: 'tabela_completa', label: '9 Colunas (Padrão Imagem)' },
                { id: 'isca_ok_ok', label: 'N° Positron + OK + OK' },
                { id: 'apenas_iscas', label: 'Apenas N° Iscas' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setOutputMode(m.id as any)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-[10.5px] font-black uppercase transition-all cursor-pointer",
                    outputMode === m.id
                      ? "bg-[#292820] text-[#E6D2A3] shadow-2xs"
                      : "text-[#77736B] hover:text-[#292820]"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleCopyAll(false)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-md active:scale-95 border",
                copiedMain
                  ? "bg-emerald-600 text-white border-emerald-500"
                  : "bg-[#292820] hover:bg-[#3A3830] text-[#E6D2A3] border-[#C49A45]/50"
              )}
            >
              {copiedMain ? <Check size={14} /> : <Copy size={14} className="text-[#C49A45]" />}
              <span>{copiedMain ? 'TEXTO COPIADO!' : 'COPIAR PARA COLAR NA PLANILHA'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleCopyAll(true)}
              className={cn(
                "px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all border",
                copiedWithHeader
                  ? "bg-emerald-600 text-white border-emerald-500"
                  : "bg-white hover:bg-[#FAF5E8] text-[#292820] border-[#E6D2A3]"
              )}
            >
              {copiedWithHeader ? <Check size={13} /> : <Copy size={13} className="text-[#C49A45]" />}
              <span>{copiedWithHeader ? 'COPIADO!' : 'COPIAR COM CABEÇALHO'}</span>
            </button>
          </div>
        </div>

        {/* Read-only TSV preview ready for spreadsheet paste */}
        <div className="relative">
          <textarea
            readOnly
            rows={Math.min(8, Math.max(3, filteredRows.length + 1))}
            value={generateSpreadsheetText(false)}
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            className="w-full bg-[#1E1E1C] text-[#F5F0E6] border border-[#292820] rounded-xl p-3.5 font-mono text-xs outline-none overflow-x-auto leading-relaxed selection:bg-[#C49A45] selection:text-black"
          />
          <span className="absolute top-2.5 right-3 px-2 py-0.5 rounded bg-black/60 text-[#E6D2A3] text-[9.5px] font-mono uppercase">
            Separado por TAB (Pronto para Excel / Sheets)
          </span>
        </div>
      </div>

      {/* STEP 3: TABELA VISUAL IDÊNTICA À PLANILHA EM ANEXO */}
      <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77736B]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar por isca, motorista ou placa..."
                className="w-full bg-white text-[#292820] border border-[#E6D2A3] rounded-xl pl-9 pr-3 py-2 text-xs font-semibold outline-none focus:border-[#C49A45]"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-[#77736B] text-[11px] uppercase">Rota Padrão:</span>
              <input
                type="text"
                value={defaultRota}
                onChange={(e) => setDefaultRota(e.target.value)}
                className="bg-white border border-[#E6D2A3] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#292820] outline-none focus:border-[#C49A45] w-56"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddBlankRow}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
          >
            <Plus size={14} />
            <span>Adicionar Linha Manual</span>
          </button>
        </div>

        {/* Spreadsheet Table Matching Attached Image 100% */}
        <div className="overflow-x-auto border-2 border-black shadow-md bg-white">
          <table className="w-full border-collapse text-xs font-sans text-center">
            <thead>
              <tr className="bg-black text-white font-bold italic text-[11px] uppercase tracking-wide">
                <th className="border border-stone-600 px-3 py-2 whitespace-nowrap">DATA</th>
                <th className="border border-stone-600 px-3 py-2 min-w-[230px]">
                  <input
                    type="text"
                    value={filialHeader}
                    onChange={(e) => setFilialHeader(e.target.value.toUpperCase())}
                    className="w-full bg-transparent text-white font-bold italic text-center uppercase outline-none focus:bg-white/10 rounded px-1"
                    title="Clique para editar o título da filial"
                  />
                </th>
                <th className="border border-stone-600 px-3 py-2 min-w-[230px]">NOME MOTORISTA</th>
                <th className="border border-stone-600 px-2.5 py-2 w-20">CHEGOU</th>
                <th className="border border-stone-600 px-3 py-2 w-28">CAVALO</th>
                <th className="border border-stone-600 px-3 py-2 w-28">CARRETA</th>
                <th className="border border-stone-600 px-3 py-2 w-36">N° POSITRON</th>
                <th className="border border-stone-600 px-2.5 py-2 w-20">RESGATE</th>
                <th className="border border-stone-600 px-2.5 py-2 w-20">ENVIO</th>
                <th className="border border-stone-600 px-2.5 py-2 w-24 not-italic">COPIAR</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-stone-500 font-semibold">
                    Nenhuma linha na tabela. Cole os dados no campo em branco acima para gerar automaticamente.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => {
                  const isRowCopied = copiedRowId === row.id;
                  return (
                    <tr key={row.id} className="text-[12px] text-black">
                      {/* DATA */}
                      <td className="border border-black p-0 bg-white">
                        <input
                          type="text"
                          value={row.data}
                          onChange={(e) => handleUpdateCell(idx, 'data', e.target.value)}
                          className="w-full px-2 py-1.5 text-center bg-transparent outline-none focus:bg-amber-50"
                        />
                      </td>

                      {/* DESTINO À FILIAL */}
                      <td className="border border-black p-0 bg-white">
                        <input
                          type="text"
                          value={row.destino}
                          onChange={(e) => handleUpdateCell(idx, 'destino', e.target.value)}
                          className="w-full px-2 py-1.5 text-center bg-transparent outline-none focus:bg-amber-50"
                        />
                      </td>

                      {/* NOME MOTORISTA */}
                      <td className="border border-black p-0 bg-white">
                        <input
                          type="text"
                          value={row.motorista}
                          onChange={(e) => handleUpdateCell(idx, 'motorista', e.target.value)}
                          className="w-full px-2 py-1.5 text-center bg-transparent outline-none focus:bg-amber-50"
                        />
                      </td>

                      {/* CHEGOU (Verde claro idêntico à imagem) */}
                      <td className="border border-black p-0 bg-[#D9EAD3] text-[#274E13] font-semibold">
                        <input
                          type="text"
                          value={row.chegou}
                          onChange={(e) => handleUpdateCell(idx, 'chegou', e.target.value.toUpperCase())}
                          className="w-full px-2 py-1.5 text-center bg-transparent text-[#274E13] font-semibold outline-none"
                        />
                      </td>

                      {/* CAVALO */}
                      <td className="border border-black p-0 bg-white">
                        <input
                          type="text"
                          value={row.cavalo}
                          onChange={(e) => handleUpdateCell(idx, 'cavalo', e.target.value.toUpperCase())}
                          className="w-full px-2 py-1.5 text-center bg-transparent uppercase outline-none focus:bg-amber-50"
                        />
                      </td>

                      {/* CARRETA */}
                      <td className="border border-black p-0 bg-white">
                        <input
                          type="text"
                          value={row.carreta}
                          onChange={(e) => handleUpdateCell(idx, 'carreta', e.target.value.toUpperCase())}
                          className="w-full px-2 py-1.5 text-center bg-transparent uppercase outline-none focus:bg-amber-50"
                        />
                      </td>

                      {/* N° POSITRON (Amarelo vibrante #FFFF00 com texto em negrito idêntico à imagem) */}
                      <td className="border border-black p-0 bg-[#FFFF00] text-black font-bold">
                        <input
                          type="text"
                          value={row.positron}
                          onChange={(e) => handleUpdateCell(idx, 'positron', e.target.value.toUpperCase())}
                          className="w-full px-2 py-1.5 text-center bg-transparent text-black font-bold uppercase outline-none"
                        />
                      </td>

                      {/* RESGATE (Verde claro) */}
                      <td className="border border-black p-0 bg-[#D9EAD3] text-[#274E13] font-semibold">
                        <input
                          type="text"
                          value={row.resgate}
                          onChange={(e) => handleUpdateCell(idx, 'resgate', e.target.value.toUpperCase())}
                          className="w-full px-2 py-1.5 text-center bg-transparent text-[#274E13] font-semibold outline-none"
                        />
                      </td>

                      {/* ENVIO (Verde claro) */}
                      <td className="border border-black p-0 bg-[#D9EAD3] text-[#274E13] font-semibold">
                        <input
                          type="text"
                          value={row.envio}
                          onChange={(e) => handleUpdateCell(idx, 'envio', e.target.value.toUpperCase())}
                          className="w-full px-2 py-1.5 text-center bg-transparent text-[#274E13] font-semibold outline-none"
                        />
                      </td>

                      {/* AÇÕES DA LINHA */}
                      <td className="border border-black px-1.5 py-1 bg-[#FAF6EE]">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopySingleRow(row)}
                            title="Copiar esta linha para colar na planilha"
                            className={cn(
                              "px-2 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer transition-all",
                              isRowCopied
                                ? "bg-emerald-600 text-white"
                                : "bg-[#292820] hover:bg-[#3A3830] text-[#E6D2A3]"
                            )}
                          >
                            {isRowCopied ? <Check size={11} /> : <Copy size={11} />}
                            <span>{isRowCopied ? 'OK' : 'Copiar'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(idx)}
                            title="Remover linha"
                            className="p-1 text-stone-400 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
