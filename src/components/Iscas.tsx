import React, { useState } from 'react';
import { Clipboard, Zap } from 'lucide-react';
import { rtdb as db } from '../firebase';
import { ref, set } from 'firebase/database';

export default function Iscas({ onBack }: { onBack?: () => void }) {
  const [tsvInput, setTsvInput] = useState('');
  const [rows, setRows] = useState<any[]>([]);

  const handleProcessTsv = () => {
    const parsed = tsvInput.split('\n').filter(line => line.trim()).map(line => {
      const parts = line.split('\t');
      return {
        id: parts[0],
        destino: parts[1],
        status: parts[2],
        obs1: parts[3],
        data: parts[4],
        carreta: parts[5],
        cavalo: parts[6],
        motorista: parts[7],
        unidade: parts[8]
      };
    });
    setRows(parsed);
    set(ref(db, 'iscas_data'), parsed);
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F0E6] p-6 text-[#25231F]">
      <h1 className="text-2xl font-black text-[#292820] mb-6">GERENCIAMENTO DE ISCAS</h1>
      
      <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
          <Clipboard size={17} className="text-[#C49A45]" />
          COLE AS INFORMAÇÕES DAS ISCAS (PLANILHA)
        </h3>
        <textarea
          rows={6}
          value={tsvInput}
          onChange={(e) => setTsvInput(e.target.value)}
          placeholder="Cole aqui os dados da planilha..."
          className="w-full bg-[#FFFFFF] border border-[#E6D2A3] rounded-xl p-4 font-mono text-xs outline-none"
        />
        <button
          onClick={handleProcessTsv}
          className="mt-4 px-6 py-2 bg-[#C49A45] text-white rounded-xl font-black uppercase text-xs"
        >
          <Zap size={14} className="inline mr-2" />
          PROCESSAR
        </button>
      </div>

      <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full border-collapse text-xs font-mono">
          <thead className="bg-[#292820] text-[#FFFCF6]">
            <tr>
              <th className="p-3">ID ISCA</th>
              <th className="p-3">DESTINO</th>
              <th className="p-3">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-slate-200 text-center">
                <td className="p-3">{r.id}</td>
                <td className="p-3">{r.destino}</td>
                <td className="p-3">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
