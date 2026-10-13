import React, { useState, useEffect } from 'react';
import { 
  Clipboard, 
  Zap, 
  Trash2, 
  Search, 
  ArrowLeft, 
  Radio, 
  ShieldCheck, 
  MapPin, 
  Package, 
  Check, 
  Activity 
} from 'lucide-react';
import { rtdb as db } from '../firebase';
import { ref, onValue, set } from 'firebase/database';
import { cn } from '../lib/utils';

export interface IscaItem {
  id: string;
  destino: string;
  status: string;
  obs1?: string;
  data?: string;
  carreta?: string;
  cavalo?: string;
  motorista?: string;
  unidade?: string;
}

export default function Iscas({ onBack }: { onBack?: () => void }) {
  const [tsvInput, setTsvInput] = useState('');
  const [rows, setRows] = useState<IscaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Load existing data from Firebase RTDB & localStorage
  useEffect(() => {
    const iscasRef = ref(db, 'iscas_data');
    const unsubscribe = onValue(iscasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Array.isArray(data) ? data : Object.values(data);
        setRows(arr);
        try { localStorage.setItem('iscas_data', JSON.stringify(arr)); } catch {}
      } else {
        try {
          const cached = localStorage.getItem('iscas_data');
          if (cached) setRows(JSON.parse(cached));
        } catch {}
      }
    });

    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleProcessTsv = () => {
    if (!tsvInput.trim()) {
      showToast('Cole o conteúdo da planilha antes de processar.');
      return;
    }

    const lines = tsvInput.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    // Detect delimiter: tab or semicolon or comma
    const delimiter = lines[0].includes('\t') ? '\t' : (lines[0].includes(';') ? ';' : ',');

    // Header check
    let startIdx = 0;
    const firstLower = lines[0].toLowerCase();
    if (firstLower.includes('isca') || firstLower.includes('destino') || firstLower.includes('status') || firstLower.includes('id')) {
      startIdx = 1;
    }

    const parsed: IscaItem[] = [];
    for (let i = startIdx; i < lines.length; i++) {
      const parts = lines[i].split(delimiter).map(p => p.trim());
      if (parts.length === 0 || parts.every(p => !p)) continue;

      // Map based on strict column order: 0:ID, 1:DESTINO, 2:STATUS, 3:OBS, 4:DATA, 5:CARRETA, 6:CAVALO, 7:MOTORISTA, 8:UNIDADE
      let iscaId = parts[0] || '';
      let destino = parts[1] || 'A DEFINIR';
      let status = parts[2] || 'EM MONITORAMENTO';
      let obs1 = parts[3] || '';
      let data = parts[4] || '';
      let carreta = parts[5] || '';
      let cavalo = parts[6] || '';
      let motorista = parts[7] || '';
      let unidade = parts[8] || 'NÃO INFORMADA';

      parsed.push({
        id: iscaId || `ISCA-${i + 1}`,
        destino: destino,
        status: status,
        obs1,
        data,
        carreta,
        cavalo,
        motorista,
        unidade
      });
    }

    if (parsed.length > 0) {
      setRows(parsed);
      set(ref(db, 'iscas_data'), parsed);
      try { localStorage.setItem('iscas_data', JSON.stringify(parsed)); } catch {}
      setTsvInput('');
      showToast(`${parsed.length} isca(s) importada(s) com sucesso!`);
    } else {
      showToast('Nenhuma linha válida identificada.');
    }
  };

  const handleClear = () => {
    if (window.confirm('Deseja limpar todos os registros de iscas?')) {
      setRows([]);
      set(ref(db, 'iscas_data'), null);
      try { localStorage.removeItem('iscas_data'); } catch {}
      showToast('Registros limpos com sucesso.');
    }
  };

  const getStatusBadge = (status: string) => {
    const up = (status || '').toUpperCase();
    if (up.includes('IDA')) {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }
    if (up.includes('VOLTA')) {
      return 'bg-purple-100 text-purple-800 border-purple-300';
    }
    if (up.includes('DESTINO')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
    if (up.includes('PREPARA')) {
      return 'bg-amber-100 text-amber-800 border-amber-300';
    }
    return 'bg-[#EEE2CD] text-[#91651F] border-[#D9C39B]';
  };

  const filtered = rows.filter(r => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.id.toLowerCase().includes(term) ||
      r.destino.toLowerCase().includes(term) ||
      r.status.toLowerCase().includes(term) ||
      (r.motorista && r.motorista.toLowerCase().includes(term))
    );
  });

  return (
    <div className="w-full min-h-screen bg-[#F5EFE4] p-4 sm:p-6 text-[#33291B] font-sans text-left">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-[#33291B] text-[#FFF9EF] border border-[#DDB76B] text-xs font-mono font-bold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check size={14} className="text-[#DDB76B]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#D9C39B] gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded-xl bg-[#FFF9EF] hover:bg-[#EEE2CD] text-[#33291B] border border-[#D9C39B] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowLeft size={14} />
              <span>Voltar ao Menu</span>
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <Package size={22} className="text-[#C69A45]" />
              <h1 className="text-xl sm:text-2xl font-black text-[#33291B] tracking-tight uppercase">
                GERENCIAMENTO DE ISCAS
              </h1>
            </div>
            <p className="text-xs text-[#857662] mt-0.5">
              Rastreamento tático, status de rota (Ida / Volta / Destino / Preparação) e integração em tempo real.
            </p>
          </div>
        </div>

        {/* Counter Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-xl bg-[#FFF9EF] border border-[#D9C39B] text-xs font-mono font-bold text-[#33291B]">
            TOTAL: <strong className="text-[#91651F]">{rows.length}</strong>
          </span>
          {rows.length > 0 && (
            <button
              onClick={handleClear}
              className="px-3 py-1 rounded-xl bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Trash2 size={13} />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Distribution Summary Card */}
      <div className="bg-[#FFF9EF] border border-[#D9C39B] rounded-2xl p-4 sm:p-5 shadow-sm mb-6">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#91651F] mb-3">DISTRIBUIÇÃO: DESTINO/UNIDADE</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(rows.reduce((acc, row) => {
            if (row.destino && row.destino !== 'A DEFINIR' && row.destino !== 'NÃO INFORMADO') {
              const dest = row.destino.toUpperCase();
              acc[dest] = (acc[dest] || 0) + 1;
            }
            if (row.unidade && row.unidade !== 'NÃO INFORMADA' && row.unidade !== 'A DEFINIR') {
              const unit = row.unidade.toUpperCase();
              acc[unit] = (acc[unit] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>)).sort((a, b) => Number(b[1]) - Number(a[1])).map(([loc, count]) => (
            <div key={loc} className="bg-white border border-[#D9C39B]/30 rounded-xl p-3 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase">{loc}</span>
              <span className="text-sm font-black text-[#33291B]">{count} iscas</span>
            </div>
          ))}
        </div>
      </div>

      {/* Input & Paste Card */}
      <div className="bg-[#FFF9EF] border border-[#D9C39B] rounded-2xl p-4 sm:p-5 shadow-sm mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#91651F] flex items-center gap-2">
            <Clipboard size={15} className="text-[#C69A45]" />
            COLE AS INFORMAÇÕES DAS ISCAS (PLANILHA EXCEL / GOOGLE SHEETS)
          </h3>
          <span className="text-[10px] font-mono text-[#857662]">
            Copie as colunas (ID, Destino, Status) e aperte Ctrl+V
          </span>
        </div>

        <textarea
          rows={5}
          value={tsvInput}
          onChange={(e) => setTsvInput(e.target.value)}
          placeholder="Cole aqui os dados da planilha (ex: ID ISCA [tab] DESTINO [tab] STATUS [tab] ...)..."
          className="w-full bg-[#FAF6EE] text-[#33291B] border border-[#D9C39B] rounded-xl p-3.5 font-mono text-xs outline-none focus:border-[#C69A45] focus:bg-white transition-all shadow-inner placeholder:text-stone-400"
        />

        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] text-[#857662] font-semibold">
            {tsvInput.trim() ? `${tsvInput.trim().split('\n').length} linha(s) pronta(s) para importar` : 'Aguardando dados...'}
          </span>

          <button
            onClick={handleProcessTsv}
            className="px-5 py-2.5 bg-gradient-to-r from-[#C69A45] via-[#DDB76B] to-[#91651F] hover:brightness-105 text-[#33291B] font-black uppercase text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2 transition-all active:scale-98"
          >
            <Zap size={14} />
            <span>PROCESSAR E SALVAR</span>
          </button>
        </div>
      </div>

      {/* Search and Table Card */}
      <div className="bg-[#FFF9EF] border border-[#D9C39B] rounded-2xl shadow-sm overflow-hidden p-4 sm:p-5 space-y-3">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#D9C39B]">
          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#857662]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por ID, destino ou status..."
              className="w-full bg-[#FAF6EE] text-[#33291B] border border-[#D9C39B] rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold outline-none focus:border-[#C69A45] focus:bg-white"
            />
          </div>

          <span className="text-xs text-[#857662] font-mono">
            Exibindo <strong>{filtered.length}</strong> de <strong>{rows.length}</strong> iscas
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-12 text-[#857662] space-y-2">
            <Package size={36} className="mx-auto text-[#C69A45] opacity-60" />
            <p className="font-bold text-sm text-[#33291B]">Nenhuma isca cadastrada ainda.</p>
            <p className="text-xs">Cole as informações da planilha no campo acima e clique em "PROCESSAR".</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#D9C39B]">
            <table className="w-full border-collapse text-xs font-sans text-center">
              <thead className="bg-[#33291B] text-[#FFF9EF] text-[10.5px] uppercase font-black tracking-wider">
                <tr>
                  <th className="p-3 border-r border-stone-700 w-12">#</th>
                  <th className="p-3 border-r border-stone-700">ID ISCA</th>
                  <th className="p-3 border-r border-stone-700">DESTINO</th>
                  <th className="p-3 border-r border-stone-700">STATUS</th>
                  <th className="p-3 border-r border-stone-700">CARRETA / CAVALO</th>
                  <th className="p-3">CONDUTOR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9C39B]/60 bg-white">
                {filtered.map((r, i) => (
                  <tr key={r.id + i} className="hover:bg-[#FFF9EF]/80 transition-colors">
                    <td className="p-2.5 font-mono font-bold text-stone-500 border-r border-[#D9C39B]/40">
                      {i + 1}
                    </td>
                    <td className="p-2.5 font-mono font-black text-[#91651F] border-r border-[#D9C39B]/40">
                      {r.id}
                    </td>
                    <td className="p-2.5 font-bold uppercase text-[#33291B] border-r border-[#D9C39B]/40">
                      {r.destino}
                    </td>
                    <td className="p-2.5 border-r border-[#D9C39B]/40">
                      <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-mono font-black border uppercase tracking-wider inline-block", getStatusBadge(r.status))}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-stone-700 border-r border-[#D9C39B]/40">
                      {r.carreta || r.cavalo ? `${r.carreta || '-'} / ${r.cavalo || '-'}` : '-'}
                    </td>
                    <td className="p-2.5 uppercase font-medium text-stone-700">
                      {r.motorista || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
