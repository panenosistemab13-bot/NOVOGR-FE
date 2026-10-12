import React, { useState, useEffect } from "react";
import { rtdb as db } from '../firebase';
import { ref, onValue } from 'firebase/database';

type Isca = {
  id: string;
  destino: string;
  status: string;
};

export default function Inicio() {
  const [iscas, setIscas] = useState<Isca[]>([]);

  useEffect(() => {
    const iscasRef = ref(db, 'iscas_data');
    onValue(iscasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Firebase might store it as an object if it was saved with push() or as a map
        // If it's an array, it's fine. If it's an object, we need to convert to array.
        const iscasArray = Array.isArray(data) ? data : Object.values(data);
        setIscas(iscasArray);
      }
    });
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#F5F0E6] p-6 text-[#25231F]">
        <h1 className="text-2xl font-black text-[#292820] mb-6">RESUMO DE ISCAS (PAINEL CENTRAL)</h1>
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
                {iscas.map((r, i) => (
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
