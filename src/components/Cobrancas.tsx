import React, { useState, useMemo, useEffect } from 'react';
import {
  FileSpreadsheet,
  Filter,
  Trash2,
  Copy,
  Check,
  Search,
  RotateCcw,
  Clock,
  ShieldAlert,
  TrendingUp,
  Layers,
  MapPin,
  UserCheck,
  ChevronDown,
  ChevronUp,
  ClipboardPaste,
  BarChart3,
  PieChart,
  Info,
  Sliders,
  Truck,
  Barcode,
  Calendar,
  User,
  Container,
  Building2,
  FileText,
  Zap,
  Bell,
  AlertTriangle,
  Database,
  Hourglass,
  Mail,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { logAuditAction, logDebouncedEdit } from '../utils/auditHistory';

interface CobrancasProps {
  onBack?: () => void;
}

export interface CobrancaRow {
  id: string;
  idIsca: string;
  destino: string;
  status: string;
  cavalo: string;
  motorista: string;
  diasAguard: string;
  diasNum: number;
  ultimaPosicao: string;
  endereco: string;
}

type ColumnKey =
  | 'idIsca'
  | 'destino'
  | 'status'
  | 'cavalo'
  | 'motorista'
  | 'diasAguard'
  | 'ultimaPosicao'
  | 'endereco';

interface ColumnDef {
  key: ColumnKey;
  label: string;
  width: string;
  icon: React.ElementType;
}

const COLUMNS: ColumnDef[] = [
  { key: 'idIsca', label: 'ID ISCA', width: 'min-w-[130px]', icon: Barcode },
  { key: 'destino', label: 'DESTINO', width: 'min-w-[145px]', icon: MapPin },
  { key: 'status', label: 'STATUS', width: 'min-w-[135px]', icon: Layers },
  { key: 'cavalo', label: 'CAVALO', width: 'min-w-[115px]', icon: Truck },
  { key: 'motorista', label: 'MOTORISTA', width: 'min-w-[220px]', icon: User },
  { key: 'diasAguard', label: 'DIAS AGUARD', width: 'min-w-[118px]', icon: Clock },
  { key: 'ultimaPosicao', label: 'Ultima posição Atualizada', width: 'min-w-[180px]', icon: Clock },
  { key: 'endereco', label: 'Endereço', width: 'min-w-[300px]', icon: MapPin }
];

const SAMPLE_TSV = `ID ISCA\tDESTINO\tSTATUS\tCAVALO\tMOTORISTA\tDIAS AGUARD\tUltima posição Atualizada\tEndereço
R100002328\tPREPARAÇÃO\tPND\tPOD-0645\tEllas de Souza Barbosa\t3\t16/11/2026 03:23:00\tr Olto - 1 A 216 - Santa Luzia - MG
R100000704\tRIO DE JANEIRO\tNO DESTINO\tPOD-0645\tElias de Souza Barbosa\t3\t16/11/2026 03:14:00\trua Do Alplate - Rio De Janeiro - RJ
R100000122\tRIO DE JANEIRO\tNO DESTINO\tPOD0255\tPEDRO HENRIQUE ARAUJO SOUSA\t3\t16/11/2026 03:00:00\trua California - Rio De Janeiro - RJ
R1000003148\tRIO DE JANEIRO\tNO DESTINO\tSAR-8D82\tADILSON DOS REIS SILVA\t3\t31/08/2026 08:15:32\trua Kelson - Penha Circular - Rio de Janeiro - RJ
R1000003140\tRIO DE JANEIRO\tNO DESTINO\tSBN-4J62\tLUIZ ANTONIO DOS SANTOS MARQUES\t3\t16/11/2026 03:20:00\trua kelson - penha circular - rio de janeiro - rj`;

const STORAGE_KEY = 'pgr_cobrancas_raw_v1';

function parseRawSpreadsheet(raw: string): CobrancaRow[] {
  if (!raw || !raw.trim()) return [];
  const lines = raw
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const parsed: CobrancaRow[] = [];
  let headerIndices: Record<string, number> = {
    idIsca: 0,
    destino: 1,
    status: 2,
    cavalo: 6,
    motorista: 7,
    diasAguard: 9,
    ultimaPosicao: 14,
    endereco: 15
  };

  lines.forEach((line, idx) => {
    const cols = line.includes('\t')
      ? line.split('\t').map(c => c.trim())
      : line.split(';').length >= 5
      ? line.split(';').map(c => c.trim())
      : line.split(/\s{2,}/).map(c => c.trim());

    if (cols.length === 0) return;

    const firstUpper = (cols[0] || '').toUpperCase();
    const secondUpper = (cols[1] || '').toUpperCase();
    if (
      firstUpper.includes('ID ISCA') ||
      (firstUpper === 'ID' && secondUpper.includes('DESTINO')) ||
      secondUpper === 'DESTINO' ||
      firstUpper.includes('ID')
    ) {
      cols.forEach((colName, cIdx) => {
        const u = colName.toUpperCase();
        if (u.includes('ID ISCA') || u === 'ID') headerIndices.idIsca = cIdx;
        else if (u.includes('DESTINO')) headerIndices.destino = cIdx;
        else if (u.includes('STATUS')) headerIndices.status = cIdx;
        else if (u.includes('CAVALO')) headerIndices.cavalo = cIdx;
        else if (u.includes('MOTORISTA')) headerIndices.motorista = cIdx;
        else if (u.includes('DIAS') || u.includes('AGUARD')) headerIndices.diasAguard = cIdx;
        else if (u.includes('ULTIMA') || u.includes('POSIÇÃO') || u.includes('POSICAO') || u.includes('ATUALIZADA')) headerIndices.ultimaPosicao = cIdx;
        else if (u.includes('ENDEREÇO') || u.includes('ENDERECO')) headerIndices.endereco = cIdx;
      });
      return;
    }

    let idIsca = '-';
    let destino = '-';
    let status = '-';
    let cavalo = '-';
    let motorista = '-';
    let diasAguard = '-';
    let ultimaPosicao = '-';
    let endereco = '-';

    if (cols.length <= 8) {
      idIsca = cols[0] || '-';
      destino = cols[1] || '-';
      status = cols[2] || '-';
      cavalo = cols[3] || '-';
      motorista = cols[4] || '-';
      diasAguard = cols[5] || '-';
      ultimaPosicao = cols[6] || '-';
      endereco = cols[7] || '-';
    } else {
      idIsca = cols[headerIndices.idIsca] !== undefined ? cols[headerIndices.idIsca] : (cols[0] || '-');
      destino = cols[headerIndices.destino] !== undefined ? cols[headerIndices.destino] : (cols[1] || '-');
      status = cols[headerIndices.status] !== undefined ? cols[headerIndices.status] : (cols[2] || '-');
      cavalo = cols[headerIndices.cavalo] !== undefined ? cols[headerIndices.cavalo] : (cols[6] || '-');
      motorista = cols[headerIndices.motorista] !== undefined ? cols[headerIndices.motorista] : (cols[7] || '-');
      diasAguard = cols[headerIndices.diasAguard] !== undefined ? cols[headerIndices.diasAguard] : (cols[9] || '-');
      ultimaPosicao = cols[headerIndices.ultimaPosicao] !== undefined ? cols[headerIndices.ultimaPosicao] : (cols[14] || '-');
      endereco = cols[headerIndices.endereco] !== undefined ? cols[headerIndices.endereco] : (cols[15] || cols[cols.length - 1] || '-');
    }

    if (/^\d{1,2}[\.\/][A-Z\d]+/i.test(status) || /^\d{2}\/\d{2}/.test(status)) {
      const statusLikeCol = cols.find(c => /ROTA|IDA|VOLTA|DESTINO|PND|ENTREGUE|AGUARDANDO|VIAGEM/i.test(c));
      if (statusLikeCol) {
        status = statusLikeCol;
      }
    }

    const diasNum = parseInt(String(diasAguard).replace(/[^\d-]/g, ''), 10);

    parsed.push({
      id: `${idx}-${idIsca}-${cavalo}`,
      idIsca: idIsca || '-',
      destino: destino || '-',
      status: status || '-',
      cavalo: cavalo || '-',
      motorista: motorista || '-',
      diasAguard: diasAguard || '-',
      diasNum: isNaN(diasNum) ? 0 : diasNum,
      ultimaPosicao: ultimaPosicao || '-',
      endereco: endereco || '-'
    });
  });

  return parsed;
}

export default function Cobrancas({ onBack: _onBack }: CobrancasProps) {
  const [rawInput, setRawInput] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved !== null ? saved : SAMPLE_TSV;
    } catch {
      return SAMPLE_TSV;
    }
  });

  const [columnSearch, setColumnSearch] = useState<Record<ColumnKey, string>>({
    idIsca: '',
    destino: '',
    status: '',
    cavalo: '',
    motorista: '',
    diasAguard: '',
    ultimaPosicao: '',
    endereco: ''
  });

  const [columnExact, setColumnExact] = useState<Record<ColumnKey, string>>({
    idIsca: 'TODOS',
    destino: 'TODOS',
    status: 'TODOS',
    cavalo: 'TODOS',
    motorista: 'TODOS',
    diasAguard: 'TODOS',
    ultimaPosicao: 'TODOS',
    endereco: 'TODOS'
  });

  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'NORMAL'>('ALL');
  const [copiedTable, setCopiedTable] = useState(false);
  const [copiedIscas, setCopiedIscas] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isPasteExpanded, setIsPasteExpanded] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, rawInput);
    } catch {
      // ignore
    }
  }, [rawInput]);

  const allRows = useMemo(() => parseRawSpreadsheet(rawInput), [rawInput]);

  const uniqueColumnValues = useMemo(() => {
    const map: Record<ColumnKey, string[]> = {
      idIsca: [],
      destino: [],
      status: [],
      cavalo: [],
      motorista: [],
      diasAguard: [],
      ultimaPosicao: [],
      endereco: []
    };

    COLUMNS.forEach(({ key }) => {
      const setVals = new Set<string>();
      allRows.forEach(row => {
        const val = String(row[key] || '').trim();
        if (val) setVals.add(val);
      });
      map[key] = Array.from(setVals).sort((a, b) =>
        a.localeCompare(b, 'pt-BR', { numeric: true })
      );
    });

    return map;
  }, [allRows]);

  const filteredRows = useMemo(() => {
    return allRows.filter(row => {
      if (severityFilter === 'CRITICAL' && row.diasNum < 15) return false;
      if (severityFilter === 'WARNING' && (row.diasNum < 10 || row.diasNum >= 15)) return false;
      if (severityFilter === 'NORMAL' && row.diasNum >= 10) return false;

      for (const col of COLUMNS) {
        const key = col.key;
        const cellVal = String(row[key] || '').toLowerCase();
        const searchVal = String(columnSearch[key] || '').trim().toLowerCase();
        const exactVal = columnExact[key];

        if (exactVal !== 'TODOS' && String(row[key] || '') !== exactVal) {
          return false;
        }
        if (searchVal && !cellVal.includes(searchVal)) {
          return false;
        }
      }

      return true;
    });
  }, [allRows, columnSearch, columnExact, severityFilter]);

  const metrics = useMemo(() => {
    const total = filteredRows.length;
    const critical = filteredRows.filter(r => r.diasNum >= 15).length;
    const warning = filteredRows.filter(r => r.diasNum >= 10 && r.diasNum < 15).length;
    const normal = filteredRows.filter(r => r.diasNum < 10).length;
    const maxDias = filteredRows.reduce((acc, r) => (r.diasNum > acc ? r.diasNum : acc), 0);
    const avgDias =
      total > 0
        ? (filteredRows.reduce((acc, r) => acc + r.diasNum, 0) / total).toFixed(1)
        : '0.0';

    return { total, critical, warning, normal, maxDias, avgDias };
  }, [filteredRows]);

  const hasActiveFilters = useMemo(() => {
    if (severityFilter !== 'ALL') return true;
    return COLUMNS.some(
      c => String(columnSearch[c.key] || '').trim() !== '' || columnExact[c.key] !== 'TODOS'
    );
  }, [columnSearch, columnExact, severityFilter]);

  const resetAllFilters = () => {
    setSeverityFilter('ALL');
    setColumnSearch({
      idIsca: '',
      destino: '',
      status: '',
      cavalo: '',
      motorista: '',
      ultimaPosicao: '',
      endereco: ''
    });
    setColumnExact({
      idIsca: 'TODOS',
      destino: 'TODOS',
      status: 'TODOS',
      cavalo: 'TODOS',
      motorista: 'TODOS',
      ultimaPosicao: 'TODOS',
      endereco: 'TODOS'
    });
  };

  const handleCopyFiltered = async () => {
    if (filteredRows.length === 0) return;
    const header = COLUMNS.map(c => c.label).join('\t');
    const body = filteredRows
      .map(r =>
        [
          r.idIsca,
          r.destino,
          r.status,
          r.cavalo,
          r.motorista,
          r.diasAguard,
          r.ultimaPosicao,
          r.endereco
        ].join('\t')
      )
      .join('\n');
    const text = `${header}\n${body}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedTable(true);
    setToast(`${filteredRows.length} registros copiados para a área de transferência!`);
    setTimeout(() => setCopiedTable(false), 2200);
    setTimeout(() => setToast(null), 2800);
  };

  const handleCopyIscasOnly = async () => {
    if (filteredRows.length === 0) return;
    const iscasList = filteredRows.map(r => r.idIsca).filter(Boolean).join(' ');
    try {
      await navigator.clipboard.writeText(iscasList);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = iscasList;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedIscas(true);
    setToast(`${filteredRows.length} IDs de Isca copiados!`);
    setTimeout(() => setCopiedIscas(false), 2200);
    setTimeout(() => setToast(null), 2800);
  };

  const handleCopySubject = async () => {
    const dest =
      columnExact.destino !== 'TODOS'
        ? columnExact.destino
        : filteredRows.length > 0 && filteredRows[0].destino
        ? filteredRows[0].destino
        : 'CURITIBA/PR';
    const subject = `🚨 🚨 🚨 NOTIFICAÇÃO DE DEVOLUÇÃO DE ISCAS RESGATADAS - ${dest.toUpperCase()} 🚨 🚨 🚨`;
    try {
      await navigator.clipboard.writeText(subject);
      setCopiedSubject(true);
      setToast('Assunto do e-mail copiado!');
      setTimeout(() => setCopiedSubject(false), 2200);
      setTimeout(() => setToast(null), 2800);
    } catch {
      setToast('Falha ao copiar assunto.');
      setTimeout(() => setToast(null), 2800);
    }
  };

  const handleCopyEmail = async () => {
    if (filteredRows.length === 0) return;
    const now = new Date();
    const hour = now.getHours();
    let saudacao = 'Bom dia, Prezados.';
    if (hour >= 12 && hour < 18) {
      saudacao = 'Boa tarde, Prezados.';
    } else if (hour >= 18) {
      saudacao = 'Boa noite, Prezados.';
    }

    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; color: #292820; font-size: 13px;">
        <h3 style="color: #D92332; text-transform: uppercase; margin-bottom: 8px;">RELATÓRIO DE ISCAS PENDENTES DE DEVOLUÇÃO</h3>
        <p><b>${saudacao}</b></p>
        <p>Pedimos a gentileza de priorizarem o recolhimento e a entrega dos itens abaixo, medida essencial para mantermos o fluxo contínuo da nossa operação:</p>
        <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; border-color: #D4AF37; width: 100%; font-size: 11px; margin-top: 10px;">
          <tr style="background-color: #141518; color: #ffffff; text-align: center; font-weight: bold;">
            ${COLUMNS.map(c => `<th>${c.label}</th>`).join('')}
          </tr>
          ${filteredRows.map((r, i) => `
            <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#FAF7F0'}; text-align: center;">
              <td style="color: #D92332; font-weight: bold;">${r.idIsca}</td>
              <td>${r.destino}</td>
              <td>${r.status}</td>
              <td>${r.cavalo}</td>
              <td>${r.motorista}</td>
              <td style="font-weight: bold;">${r.diasAguard}</td>
              <td>${r.ultimaPosicao}</td>
              <td style="text-align: left;">${r.endereco}</td>
            </tr>
          `).join('')}
        </table>
        <p style="margin-top: 15px; font-size: 11px; color: #77736B;">Gerenciamento de Risco • Cobrança de Retorno de Iscas - Operação 3 Corações</p>
      </div>
    `;

    const plainText = `RELATÓRIO DE ISCAS PENDENTES DE DEVOLUÇÃO\n${saudacao}\nPedimos a gentileza de priorizarem o recolhimento e a entrega dos itens abaixo, medida essencial para mantermos o fluxo contínuo da nossa operação:\n\n` + 
      filteredRows.map(r => COLUMNS.map(c => `${c.label}: ${r[c.key]}`).join(' | ')).join('\n');

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const htmlBlob = new Blob([htmlEmail], { type: "text/html" });
        const textBlob = new Blob([plainText], { type: "text/plain" });
        const item = new ClipboardItem({
          "text/html": htmlBlob,
          "text/plain": textBlob,
        });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }
      setCopiedEmail(true);
      setToast('Dados copiados para o e-mail com sucesso!');
      setTimeout(() => setCopiedEmail(false), 2200);
      setTimeout(() => setToast(null), 2800);
    } catch {
      try {
        await navigator.clipboard.writeText(plainText);
        setCopiedEmail(true);
        setToast('Dados copiados para o e-mail!');
        setTimeout(() => setCopiedEmail(false), 2200);
        setTimeout(() => setToast(null), 2800);
      } catch {
        setToast('Falha ao copiar conteúdo.');
        setTimeout(() => setToast(null), 2800);
      }
    }
  };

  return (
    <div
      className="cobrancas-premium w-full min-h-[calc(100vh-76px)] p-4 sm:p-6 font-sans select-none overflow-y-auto"
    >
      <style>{`
        .cobrancas-premium {
          background:
            radial-gradient(ellipse at 15% 0%, #ffffff 0%, transparent 48%),
            linear-gradient(135deg, #f8f9fb 0%, #e9ebef 50%, #f8f9fb 100%);
          color: #17191e;
          font-family: Inter, Arial, sans-serif;
          isolation: isolate;
        }

        .cobrancas-premium .cp-panel {
          background: linear-gradient(
            145deg,
            #ffffff 0%,
            #f5f6f8 48%,
            #e9ebef 100%
          );
          border: 1px solid #d2d6dd;
          box-shadow:
            0 3px 5px rgba(25, 30, 40, .07),
            0 12px 24px rgba(25, 30, 40, .10),
            inset 0 1px 1px #ffffff;
          border-radius: 19px;
        }

        .cobrancas-premium .cp-metal {
          background: linear-gradient(
            180deg,
            #ffffff 0%,
            #f1f2f5 45%,
            #dfe2e8 100%
          );
          border: 1px solid #c8cdd5;
          box-shadow:
            0 3px 7px rgba(0, 0, 0, .10),
            inset 0 1px 2px #ffffff;
        }

        .cobrancas-premium .cp-chrome {
          background: linear-gradient(
            180deg,
            #62656b 0%,
            #292c32 22%,
            #08090c 55%,
            #25272c 82%,
            #050608 100%
          );
          color: #ffffff;
          border: 1px solid #858990;
          box-shadow:
            0 4px 9px rgba(0, 0, 0, .22),
            inset 0 1px 2px rgba(255,255,255,.35),
            inset 0 -2px 3px rgba(0,0,0,.6);
        }

        .cobrancas-premium .cp-gold {
          background: linear-gradient(
            145deg,
            #fff4c5 0%,
            #f5ce66 30%,
            #d89b22 65%,
            #fff0ad 100%
          );
          border: 1px solid #c18a21;
          box-shadow:
            0 3px 7px rgba(151, 104, 20, .25),
            inset 0 1px 2px rgba(255,255,255,.85);
          color: #25211a;
        }

        .cobrancas-premium .cp-soft-shadow {
          box-shadow:
            0 5px 12px rgba(30, 35, 45, .09),
            inset 0 1px 1px rgba(255,255,255,.95);
        }

        .cobrancas-premium .cp-row {
          background: linear-gradient(90deg, #ffffff, #f7f8fa);
          border-bottom: 1px solid #dce0e6;
          transition: background .2s ease, box-shadow .2s ease;
        }

        .cobrancas-premium .cp-row:hover {
          background: linear-gradient(90deg, #fff9e9, #ffffff);
          box-shadow: inset 3px 0 #d6a63d;
        }

        .cobrancas-premium .cp-days {
          background: linear-gradient(
            180deg,
            #fff1b4,
            #f6c64e 55%,
            #e9a928
          );
          color: #292216;
          border: 1px solid #dba42e;
          border-radius: 9px;
          box-shadow:
            0 2px 5px rgba(160, 112, 24, .22),
            inset 0 1px 2px rgba(255,255,255,.9);
          font-weight: 700;
        }

        .cobrancas-premium button {
          transition:
            transform .2s ease,
            box-shadow .2s ease,
            filter .2s ease;
        }

        .cobrancas-premium button:hover:not(:disabled) {
          filter: brightness(1.025);
        }

        .cobrancas-premium button:active:not(:disabled) {
          transform: translateY(1px);
        }

        .cobrancas-premium input,
        .cobrancas-premium select,
        .cobrancas-premium textarea {
          border-color: #cbd0d8;
          box-shadow: inset 0 1px 3px rgba(20, 25, 35, .07);
        }

        .cobrancas-premium input:focus,
        .cobrancas-premium select:focus,
        .cobrancas-premium textarea:focus {
          outline: none;
          border-color: #c69a3b;
          box-shadow: 0 0 0 3px rgba(198, 154, 59, .13);
        }

        .cobrancas-premium table {
          border-collapse: separate;
          border-spacing: 0;
        }

        .cobrancas-premium th,
        .cobrancas-premium td {
          white-space: nowrap;
        }

        .cobrancas-premium .cp-chart-bar {
          position: relative;
          border-radius: 9px 9px 4px 4px;
          box-shadow:
            3px 3px 6px rgba(0, 0, 0, .16),
            inset 2px 0 3px rgba(255,255,255,.35);
        }

        .cobrancas-premium .cp-chart-bar::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 7px;
          border-radius: 50%;
          background: rgba(255,255,255,.45);
          border-bottom: 1px solid rgba(255,255,255,.2);
        }

        .cobrancas-premium .cp-donut {
          background: conic-gradient(
            #17191e 0deg 175deg,
            #e2a82e 175deg 330deg,
            #fff0b3 330deg 360deg
          );
          box-shadow:
            0 7px 15px rgba(0,0,0,.18),
            inset 2px 2px 4px rgba(255,255,255,.6);
        }

        @media (max-width: 768px) {
          .cobrancas-premium {
            padding: 10px;
          }

          .cobrancas-premium .cp-panel {
            border-radius: 14px;
          }
        }
      `}</style>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.96 }}
            className="fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl bg-[#F0FFF4] border border-emerald-400 text-emerald-900 text-xs font-mono font-bold flex items-center gap-2.5 shadow-xl"
          >
            <Check size={15} className="text-emerald-600 shrink-0 stroke-[3]" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1720px] mx-auto space-y-5">
        {/* =================================================================== */}
        {/* 1. TOP HEADER (EXACTLY MATCHING Painel_de_Cobran_as_de_Iscas_em_Rota) */}
        {/* =================================================================== */}
        <div className="bg-white border border-[#E5DEC9] rounded-3xl p-4 sm:px-6 sm:py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-[0_8px_30px_rgba(45,35,20,0.06)]">
          <div className="flex items-center gap-4 text-left">
            {/* Black rounded square launcher icon with golden dots */}
            <div className="w-12 h-12 rounded-2xl bg-[#141518] border-2 border-[#D4AF37] flex items-center justify-center shrink-0 shadow-md">
              <div className="grid grid-cols-3 gap-1 p-1">
                <div className="w-2 h-2 rounded-full bg-[#FFD700]" />
                <div className="w-2 h-2 rounded-full bg-[#FFD700]" />
                <div className="w-2 h-2 rounded-full bg-[#FFD700]" />
                <div className="w-2 h-2 rounded-full bg-[#FFD700]" />
                <div className="w-2 h-2 rounded-full bg-[#FFD700]" />
                <div className="w-2 h-2 rounded-full bg-[#FFD700]" />
                <div className="w-2 h-2 rounded-full bg-[#FFD700]" />
                <div className="w-2 h-2 rounded-full bg-[#FFD700]" />
                <div className="w-2 h-2 rounded-full bg-[#FFD700]" />
              </div>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#292820] opacity-80 block">
                GESTÃO DE ATIVOS E RASTREADORES - PADRÃO PRÉ-ALERTA
              </span>
              <h1 className="text-lg sm:text-[22px] font-black text-[#292820] uppercase tracking-tight leading-tight">
                PAINEL DE COBRANÇAS DE ISCAS EM ROTA
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleCopyIscasOnly}
              disabled={filteredRows.length === 0}
              className={cn(
                "flex items-center gap-2 font-black uppercase text-[11px] tracking-wider px-4 py-2.5 rounded-2xl transition-all cursor-pointer active:scale-95 border shadow-[0_4px_12px_rgba(0,0,0,0.04)]",
                filteredRows.length === 0
                  ? "bg-white text-[#77736B]/40 border-[#E5DEC9] cursor-not-allowed"
                  : copiedIscas
                  ? "bg-emerald-600 text-white border-emerald-500"
                  : "bg-white hover:bg-[#FAF7F0] text-[#292820] border-[#D4AF37]/60"
              )}
            >
              <span className="w-6 h-6 rounded-full bg-white border border-[#E5DEC9] flex items-center justify-center">
                {copiedIscas ? (
                  <Check size={13} className="text-emerald-600 stroke-[3]" />
                ) : (
                  <BarChart3 size={13} className="text-[#B8860B]" />
                )}
              </span>
              <span>{copiedIscas ? 'ISCAS COPIADAS!' : 'COPIAR IDS ISCAS'}</span>
            </button>



            <button
              type="button"
              onClick={handleCopySubject}
              className={cn(
                "flex items-center gap-2 font-black uppercase text-[11px] tracking-wider px-4 py-2.5 rounded-2xl transition-all cursor-pointer active:scale-95 border shadow-[0_4px_12px_rgba(0,0,0,0.04)]",
                copiedSubject
                  ? "bg-emerald-600 text-white border-emerald-500"
                  : "bg-white hover:bg-[#FAF7F0] text-[#292820] border-[#D4AF37]/60"
              )}
            >
              <span className="w-6 h-6 rounded-full bg-white border border-[#E5DEC9] flex items-center justify-center">
                {copiedSubject ? (
                  <Check size={13} className="text-emerald-600 stroke-[3]" />
                ) : (
                  <Tag size={13} className="text-[#B8860B]" />
                )}
              </span>
              <span>{copiedSubject ? 'ASSUNTO COPIADO!' : 'COPIAR ASSUNTO'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyEmail}
              disabled={filteredRows.length === 0}
              className={cn(
                "flex items-center gap-2 font-black uppercase text-[11px] tracking-wider px-4 py-2.5 rounded-2xl transition-all cursor-pointer active:scale-95 border shadow-[0_4px_12px_rgba(0,0,0,0.04)]",
                filteredRows.length === 0
                  ? "bg-white text-[#77736B]/40 border-[#E5DEC9] cursor-not-allowed"
                  : copiedEmail
                  ? "bg-emerald-600 text-white border-emerald-500"
                  : "bg-white hover:bg-[#FAF7F0] text-[#292820] border-[#D4AF37]/60"
              )}
            >
              <span className="w-6 h-6 rounded-full bg-white border border-[#E5DEC9] flex items-center justify-center">
                {copiedEmail ? (
                  <Check size={13} className="text-emerald-600 stroke-[3]" />
                ) : (
                  <Mail size={13} className="text-[#B8860B]" />
                )}
              </span>
              <span>{copiedEmail ? 'COPIADO P/ E-MAIL!' : 'COPIAR PARA EMAIL'}</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex items-center gap-1.5 font-black uppercase text-[11px] tracking-wider px-4 py-2.5 rounded-2xl transition-all cursor-pointer active:scale-95 bg-white hover:bg-amber-50 text-amber-900 border border-amber-400 shadow-xs"
              >
                <span className="w-6 h-6 rounded-full bg-white border border-amber-200 flex items-center justify-center">
                  <RotateCcw size={13} className="text-amber-700" />
                </span>
                <span>LIMPAR FILTROS</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const count = allRows.length;
                setRawInput('');
                resetAllFilters();
                logAuditAction({
                  action: 'DELETE',
                  module: 'Cobranças',
                  target: 'Tabela de Cobranças',
                  details: `Limpou dados e filtros (${count} isca(s) removida(s))`
                });
              }}
              className="flex items-center gap-2 font-black uppercase text-[11px] tracking-wider px-4 py-2.5 rounded-2xl transition-all cursor-pointer active:scale-95 bg-[#141518] hover:bg-[#292A30] text-white border border-transparent shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
            >
              <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                <Trash2 size={13} className="text-[#D92332]" />
              </span>
              <span>LIMPAR</span>
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2. FAIXA DE COLAGEM                                                 */}
        {/* =================================================================== */}
        <div className="cp-panel w-full bg-white border border-[#D4AF37]/50 rounded-3xl p-4 sm:p-5 shadow-[0_10px_35px_rgba(45,35,20,0.06)] space-y-4">
          <div className="w-full overflow-hidden rounded-2xl border border-[#D4AF37]/40 shadow-md bg-[#FFFDF9]">
            {/* Área de Colagem Minimizada com Botão MAXIMIZAR Dourado */}
            <div className="px-5 py-4 bg-white flex flex-col justify-center min-w-0 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setIsPasteExpanded(prev => !prev)}
                  className="text-[11px] font-black uppercase tracking-wider text-[#292820] flex items-center gap-2.5 cursor-pointer group bg-transparent border-0 p-0 text-left"
                >
                  <span className="w-7 h-7 rounded-full bg-white border border-[#D4AF37] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <FileText size={14} className="text-[#B8860B]" />
                  </span>
                  <span>COLAR DA PLANILHA (CAMPO EM BRANCO — CTRL+V)</span>
                  <span className="text-[10.5px] font-extrabold text-[#292820] bg-gradient-to-r from-[#FCE588] via-[#FAD554] to-[#D4AF37] hover:from-[#FAD554] hover:to-[#C5A059] px-4 py-1.5 rounded-xl ml-2 inline-flex items-center gap-1.5 shadow-sm border border-[#C5A059] transition-all">
                    <Zap size={13} className="text-[#292820] fill-current" />
                    <span>{isPasteExpanded ? 'MINIMIZAR' : 'MAXIMIZAR'}</span>
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1 rounded-full bg-white text-[#292820] border border-[#D4AF37]/50 text-[10.5px] font-mono font-bold shadow-2xs">
                    Total Iscas: {allRows.length}
                  </span>
                  <span className="px-3.5 py-1 rounded-full bg-white text-[#292820] border border-[#D4AF37]/50 text-[10.5px] font-mono font-bold shadow-2xs">
                    Filtros: {filteredRows.length}
                  </span>
                </div>
              </div>

              {isPasteExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2"
                >
                  <textarea
                    value={rawInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRawInput(val);
                      logDebouncedEdit('cobrancas_raw_input', {
                        action: val.trim() ? 'ADD' : 'DELETE',
                        module: 'Cobranças',
                        target: 'Planilha de Cobranças',
                        details: val.trim() ? 'Inseriu/atualizou dados colados da planilha de cobranças' : 'Esvaziou campo de colagem'
                      });
                    }}
                    rows={4}
                    placeholder="Cole aqui as informações copiadas da sua planilha (ID ISCA, DESTINO, STATUS, OBS 1, DATA STATUS, CARRETA, CAVALO, MOTORISTA, UNIDADE, DIAS AGUARD)..."
                    className="w-full bg-[#FAF7F0] border border-[#D4AF37]/60 rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono text-[#292820] focus:border-[#D92332] focus:ring-2 focus:ring-[#D4AF37]/25 outline-none transition-all shadow-inner resize-y placeholder:text-[#77736B]/70 select-text"
                  />
                </motion.div>
              )}
            </div>
          </div>

          {/* ================================================================= */}
          {/* 3. CINCO CARDS DE INDICADORES                                     */}
          {/* ================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1: Total de Iscas */}
            <div
              onClick={() => setSeverityFilter('ALL')}
              className={cn(
                "cp-panel bg-white border rounded-2xl p-4 text-left cursor-pointer transition-all shadow-[0_4px_16px_rgba(45,35,20,0.04)] hover:shadow-md flex flex-col justify-between relative overflow-hidden group",
                severityFilter === 'ALL' ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/20" : "border-[#E5DEC9]"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10.5px] font-black uppercase tracking-wider text-[#77736B]">
                  TOTAL DE ISCAS
                </span>
                <div className="w-8 h-8 rounded-full bg-white border border-[#D4AF37] flex items-center justify-center shadow-xs">
                  <BarChart3 size={15} className="text-[#B8860B]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-2xl sm:text-3xl font-black text-[#292820] tabular-nums">
                  {metrics.total}
                </span>
                <span className="text-[10px] font-bold text-[#77736B]">
                  da {allRows.length} registros totais
                </span>
              </div>
              <div className="w-full bg-[#F5F2EB] h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-[#D4AF37] h-full rounded-full transition-all duration-500" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Card 2: Crítico (≤ 15 dias) */}
            <div
              onClick={() => setSeverityFilter(severityFilter === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
              className={cn(
                "cp-panel bg-white border rounded-2xl p-4 text-left cursor-pointer transition-all shadow-[0_4px_16px_rgba(45,35,20,0.04)] hover:shadow-md flex flex-col justify-between relative overflow-hidden group",
                severityFilter === 'CRITICAL' ? "border-[#D92332] ring-2 ring-[#D92332]/20 bg-[#FFF5F5]" : "border-[#E5DEC9]"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10.5px] font-black uppercase tracking-wider text-[#D92332]">
                  CRÍTICO (≤ 15 DIAS)
                </span>
                <div className="w-8 h-8 rounded-full bg-white border border-[#D92332]/40 flex items-center justify-center shadow-xs">
                  <ShieldAlert size={15} className="text-[#D92332]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-2xl sm:text-3xl font-black text-[#D92332] tabular-nums">
                  {metrics.critical}
                </span>
                <span className="text-[10px] font-bold text-[#77736B]">
                  Clique para filtrar crítico
                </span>
              </div>
              <div className="w-full bg-[#F5F2EB] h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-[#D92332] h-full rounded-full transition-all duration-500"
                  style={{ width: `${metrics.total > 0 ? (metrics.critical / metrics.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Card 3: Alerta (10 a 14 dias) */}
            <div
              onClick={() => setSeverityFilter(severityFilter === 'WARNING' ? 'ALL' : 'WARNING')}
              className={cn(
                "cp-panel bg-white border rounded-2xl p-4 text-left cursor-pointer transition-all shadow-[0_4px_16px_rgba(45,35,20,0.04)] hover:shadow-md flex flex-col justify-between relative overflow-hidden group",
                severityFilter === 'WARNING' ? "border-amber-500 ring-2 ring-amber-500/20 bg-[#FFFDF5]" : "border-[#E5DEC9]"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10.5px] font-black uppercase tracking-wider text-[#292820]">
                  ALERTA (10 A 14 DIAS)
                </span>
                <div className="w-8 h-8 rounded-full bg-white border border-amber-300 flex items-center justify-center shadow-xs">
                  <Clock size={15} className="text-amber-600" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-2xl sm:text-3xl font-black text-[#292820] tabular-nums">
                  {metrics.warning}
                </span>
                <span className="text-[10px] font-bold text-[#77736B]">
                  Clique para filtrar 10 a 14 dias
                </span>
              </div>
              <div className="w-full bg-[#F5F2EB] h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${metrics.total > 0 ? (metrics.warning / metrics.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Card 4: Recente (≤ 10 dias) */}
            <div
              onClick={() => setSeverityFilter(severityFilter === 'NORMAL' ? 'ALL' : 'NORMAL')}
              className={cn(
                "cp-panel bg-white border rounded-2xl p-4 text-left cursor-pointer transition-all shadow-[0_4px_16px_rgba(45,35,20,0.04)] hover:shadow-md flex flex-col justify-between relative overflow-hidden group",
                severityFilter === 'NORMAL' ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-[#F0FFF4]" : "border-[#E5DEC9]"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10.5px] font-black uppercase tracking-wider text-[#292820]">
                  RECENTE (≤ 10 DIAS)
                </span>
                <div className="w-8 h-8 rounded-full bg-white border border-emerald-300 flex items-center justify-center shadow-xs">
                  <Calendar size={15} className="text-emerald-600" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-2xl sm:text-3xl font-black text-[#292820] tabular-nums">
                  {metrics.normal}
                </span>
                <span className="text-[10px] font-bold text-[#77736B]">
                  Clique para filtrar até 9 dias
                </span>
              </div>
              <div className="w-full bg-[#F5F2EB] h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${metrics.total > 0 ? (metrics.normal / metrics.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Card 5: Média / Pico Aguard. */}
            <div className="cp-panel bg-white border border-[#E5DEC9] rounded-2xl p-4 text-left flex flex-col justify-between shadow-[0_4px_16px_rgba(45,35,20,0.04)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10.5px] font-black uppercase tracking-wider text-[#292820]">
                  MÉDIA / PICO AGUARD.
                </span>
                <div className="w-8 h-8 rounded-full bg-white border border-[#D4AF37] flex items-center justify-center shadow-xs">
                  <Hourglass size={15} className="text-[#B8860B]" />
                </div>
              </div>
              <div className="flex items-baseline gap-3 my-1">
                <div>
                  <span className="text-xl sm:text-2xl font-black text-[#292820] tabular-nums">
                    {metrics.avgDias}d
                  </span>
                  <span className="text-[9px] font-bold text-[#77736B] block uppercase">Média Dias</span>
                </div>
                <div className="border-l border-[#E5DEC9] pl-3">
                  <span className="text-xl sm:text-2xl font-black text-[#D92332] tabular-nums">
                    {metrics.maxDias}d
                  </span>
                  <span className="text-[9px] font-bold text-[#77736B] block uppercase">Maior Atraso</span>
                </div>
              </div>
              <div className="w-full bg-[#F5F2EB] h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-[#D92332] h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* 4. TABELA DE COBRANÇAS DE ISCAS                                   */}
          {/* ================================================================= */}
          <div className="w-full rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(45,35,20,0.08)] bg-white border border-[#D4AF37]/60 tabular-nums">
            {/* Cabeçalho da Tabela */}
            <div className="px-5 py-4 border-b border-[#D4AF37]/50 bg-[#FAF7F0] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 text-left">
                <div className="w-10 h-10 rounded-2xl bg-[#141518] border border-[#D4AF37] flex items-center justify-center shrink-0 shadow-xs text-[#FFD700]">
                  <Filter size={20} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-[#292820] uppercase tracking-tight">
                    TABELA DE COBRANÇAS DE ISCAS
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#B8860B] block mt-0.5">
                    FILTRO INDIVIDUAL POR COLUNA
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 bg-white border border-[#D4AF37]/50 rounded-2xl px-4 py-2 shadow-2xs">
                <div className="w-6 h-6 rounded-full bg-[#FAF7F0] border border-[#D4AF37] flex items-center justify-center shrink-0">
                  <Info size={13} className="text-[#B8860B]" />
                </div>
                <span className="text-[11px] font-bold text-[#292820]">
                  Clique nas colunas para aplicar filtros rapidamente.
                </span>
              </div>
            </div>

            <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-[#D4AF37]/40">
              <table className="w-full border-collapse text-[12px] text-[#0F172A] min-w-[1380px] tabular-nums">
                <thead>
                  {/* Linha 1: Cabeçalhos com Preto Cromado / Fundo Dourado Suave e Ícones com Fundo Branco */}
                  <tr className="cp-chrome border-b border-[#D4AF37] text-white text-center font-black uppercase text-[11px] tracking-[0.05em] h-[44px]">
                    {COLUMNS.map((col, idx) => {
                      const Icon = col.icon;
                      const isColFiltered =
                        String(columnSearch[col.key] || '').trim() !== '' || columnExact[col.key] !== 'TODOS';
                      return (
                        <th
                          key={col.key}
                          className={cn(
                            "border-r border-white/10 px-2.5 py-2 align-middle text-center uppercase select-none",
                            col.width,
                            idx === COLUMNS.length - 1 && "border-r-0",
                            isColFiltered && "bg-[#20150A] text-[#FFD700]"
                          )}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="w-6 h-6 rounded-full bg-white border border-[#D4AF37] flex items-center justify-center shrink-0 shadow-2xs">
                              <Icon size={12} className="text-[#B8860B]" />
                            </span>
                            <span>{col.label}</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>

                  {/* Linha 2: Filtros Individuais de Cada Coluna */}
                  <tr className="cp-metal bg-[#FAF7F0] border-b-2 border-[#D4AF37]/60">
                    {COLUMNS.map((col, idx) => {
                      const options = uniqueColumnValues[col.key] || [];
                      return (
                        <th
                          key={`filter-${col.key}`}
                          className={cn(
                            "border-r border-[#D4AF37]/30 p-1.5 align-top",
                            idx === COLUMNS.length - 1 && "border-r-0"
                          )}
                        >
                          <div className="flex flex-col gap-1">
                            <select
                              value={columnExact[col.key]}
                              onChange={(e) =>
                                setColumnExact(prev => ({
                                  ...prev,
                                  [col.key]: e.target.value
                                }))
                              }
                              className={cn(
                                "w-full rounded-lg px-2 py-1 text-[10px] font-black uppercase outline-none cursor-pointer border transition-colors",
                                columnExact[col.key] !== 'TODOS'
                                  ? "bg-[#D92332] text-white border-[#D92332]"
                                  : "bg-white text-[#292820] border-[#D5C7AA] hover:border-[#D4AF37]"
                              )}
                            >
                              <option value="TODOS">TODOS ({options.length})</option>
                              {options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>

                            <div className="relative flex items-center">
                              <Search size={10} className="absolute left-2 text-[#77736B] pointer-events-none" />
                              <input
                                type="text"
                                value={columnSearch[col.key]}
                                onChange={(e) =>
                                  setColumnSearch(prev => ({
                                    ...prev,
                                    [col.key]: e.target.value
                                  }))
                                }
                                placeholder="FILTRAR..."
                                className={cn(
                                  "w-full rounded-lg pl-5 pr-2 py-1 text-[10px] font-black uppercase outline-none border transition-colors",
                                  String(columnSearch[col.key] || '').trim() !== ''
                                    ? "bg-[#FFF9ED] text-[#D92332] border-[#D92332]"
                                    : "bg-white text-[#292820] placeholder-[#77736B] border-[#D5C7AA] focus:border-[#D4AF37]"
                                )}
                              />
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={COLUMNS.length} className="py-12 px-4 text-center bg-white text-[#77736B]">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-[#D4AF37] flex items-center justify-center shadow-xs">
                            <FileSpreadsheet size={24} className="text-[#B8860B]" />
                          </div>
                          <p className="text-xs sm:text-sm font-black uppercase text-[#292820]">
                            {allRows.length === 0
                              ? 'Nenhuma informação colada ainda. Cole os dados da planilha no campo em branco acima.'
                              : 'Nenhum registro corresponde aos filtros selecionados nas colunas.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row, idx) => (
                      <tr
                        key={row.id}
                        className={cn(
                          "cp-row border-b border-[#E5DEC9] text-center text-[12px] h-[38px] hover:bg-[#FFF5D6] transition-colors",
                          idx % 2 === 0 ? "bg-white" : "bg-[#FBF8F1]"
                        )}
                      >
                        {/* ID ISCA */}
                        <td className="border-r border-[#E5DEC9] px-2.5 py-1.5 font-bold text-[#D92332] bg-[#FAF7F0] select-all uppercase">
                          {row.idIsca}
                        </td>
                        {/* DESTINO */}
                        <td className="border-r border-[#E5DEC9] px-2.5 py-1.5 font-semibold text-[#0F172A] uppercase select-all">
                          <div className="flex items-center justify-between gap-1">
                            <span className="mx-auto">{row.destino}</span>
                            <ChevronDown size={11} className="text-[#D4AF37] shrink-0" />
                          </div>
                        </td>
                        {/* STATUS */}
                        <td className="border-r border-[#E5DEC9] px-2.5 py-1.5 font-semibold uppercase select-all">
                          <div className="flex items-center justify-between gap-1">
                            <span className={cn(
                              "mx-auto flex items-center gap-1.5",
                              row.status.toUpperCase().includes('EXTRAVIADA') ? "text-[#D92332] font-black" : "text-[#0F172A]"
                            )}>
                              <span className={cn(
                                "w-2 h-2 rounded-full inline-block",
                                row.status.toUpperCase().includes('EXTRAVIADA') ? "bg-[#D92332]" : "bg-emerald-500"
                              )} />
                              {row.status}
                            </span>
                            <ChevronDown size={11} className="text-[#D4AF37] shrink-0" />
                          </div>
                        </td>
                        {/* CAVALO */}
                        <td className="border-r border-[#E5DEC9] px-2.5 py-1.5 font-semibold text-[#0F172A] uppercase select-all">
                          {row.cavalo}
                        </td>
                        {/* MOTORISTA */}
                        <td className="border-r border-[#E5DEC9] px-2.5 py-1.5 font-semibold text-[#0F172A] select-all">
                          {row.motorista}
                        </td>
                        {/* DIAS AGUARD */}
                        <td className="border-r border-[#E5DEC9] px-2.5 py-1.5 text-center select-all">
                          <span
                            className={cn(
                              "cp-days inline-block px-2.5 py-1 text-[11px] font-bold tabular-nums",
                              row.diasNum >= 15 ? "text-[#A82028]" : "text-[#292820]"
                            )}
                          >
                            {row.diasAguard}
                          </span>
                        </td>
                        {/* ULTIMA POSIÇÃO */}
                        <td className="border-r border-[#E5DEC9] px-2.5 py-1.5 font-semibold text-[#0F172A] select-all">
                          {row.ultimaPosicao}
                        </td>
                        {/* ENDEREÇO */}
                        <td className="px-2.5 py-1.5 font-semibold text-[#0F172A] text-left select-all">
                          {row.endereco}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================================================================= */}
          {/* 6. RODAPÉ DE GERENCIAMENTO DE RISCO                               */}
          {/* ================================================================= */}
          <div className="bg-[#FAF7F0] border border-[#E5DEC9] p-4 rounded-2xl text-left shadow-xs relative overflow-hidden">
            <div className="absolute right-0 bottom-0 top-0 w-48 bg-gradient-to-l from-[#141518]/10 to-transparent pointer-events-none" />
            <div className="flex items-center gap-2 mb-1.5 relative z-10">
              <div className="w-6 h-6 rounded-lg bg-white border border-[#D4AF37] flex items-center justify-center shadow-2xs">
                <Info size={13} className="text-[#B8860B]" />
              </div>
              <p className="text-[11px] font-black text-[#D92332] uppercase tracking-wide">
                GERENCIAMENTO DE RISCO • COBRANÇA DE RETORNO DE ISCAS
              </p>
            </div>
            <p className="text-[11px] text-[#292820] mb-1 font-medium leading-relaxed relative z-10">
              • Ressaltamos a importância de encaminhar todas as iscas regredidas para suas respectivas unidades de origem o mais breve possível.
            </p>
            <p className="text-[11px] text-[#292820] font-medium leading-relaxed relative z-10">
              • A devolução dos rastreadores móveis no prazo assegura a disponibilidade de equipamentos para os próximos embarques da operação 3 Corações.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
