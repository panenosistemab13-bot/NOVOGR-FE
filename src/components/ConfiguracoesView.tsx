import React, { useState } from 'react';
import {
  Settings,
  Building,
  User,
  Sliders,
  CheckCircle2,
  Save,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';

interface ConfiguracoesViewProps {
  user?: UserProfile;
}

export default function ConfiguracoesView({
  user = {
    name: 'Jefferson Augusto',
    role: 'Sistema Web',
    site: '3 COR - BH',
    email: 'jefferson@3coracoes.com.br'
  }
}: ConfiguracoesViewProps) {
  const [activeSite, setActiveSite] = useState(user.site);
  const [telemetryAutoSync, setTelemetryAutoSync] = useState(true);
  const [cinematicMode, setCinematicMode] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Top Banner */}
      <div className="bg-[#FFF9EF] rounded-3xl p-6 border border-[#D9C39B] shadow-[0_15px_35px_rgba(198,154,69,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#33291B] p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full rounded-2xl bg-[#DDB76B] flex items-center justify-center text-[#33291B]">
              <Settings size={24} />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-[#33291B]">
              Configurações & Preferências
            </h2>
            <p className="text-xs text-[#857662]">
              Personalize unidades, telemetria e integrações institucionais.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#33291B] hover:bg-[#12181b] text-[#DDB76B] border border-[#DDB76B] font-black text-xs shadow-md transition-all active:scale-98"
        >
          <Save size={15} />
          SALVAR ALTERAÇÕES
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-[#EEE2CD] border border-[#C69A45] rounded-2xl text-[#33291B] font-black text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={18} className="text-[#91651F]" />
          Configurações sincronizadas com sucesso.
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Box 1: Unidade Operacional & Site */}
        <div className="bg-[#FFF9EF] rounded-3xl p-6 border border-[#D9C39B] shadow-[0_15px_35px_rgba(198,154,69,0.1)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D9C39B]">
            <Building className="text-[#91651F]" size={20} />
            <h3 className="text-base font-black text-[#33291B]">Unidade / Site Operacional</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-black text-[#857662] block mb-1">Site Principal Conectado</label>
              <select
                value={activeSite}
                onChange={(e) => setActiveSite(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#F5EFE4] border border-[#D9C39B] font-black text-[#33291B] focus:outline-none focus:border-[#C69A45]"
              >
                <option value="3 COR - BH">3 COR - BH (Belo Horizonte - Minas Gerais)</option>
                <option value="Matriz - São Paulo">Matriz - São Paulo (CD Central)</option>
                <option value="CD Varginha - Sul de Minas">CD Varginha - Sul de Minas (Armazém Geral)</option>
                <option value="Porto de Santos - Exportação">Porto de Santos - Terminal de Exportação</option>
                <option value="Unidade Manhuaçu - Matas de Minas">Unidade Manhuaçu - Matas de Minas</option>
              </select>
            </div>

            <div className="p-3 bg-[#EEE2CD] rounded-xl border border-[#D9C39B]">
              <span className="text-[11px] text-[#33291B] font-bold block">
                As consultas serão filtradas prioritariamente por esta unidade.
              </span>
            </div>
          </div>
        </div>

        {/* Box 2: Perfil do Usuário */}
        <div className="bg-[#FFF9EF] rounded-3xl p-6 border border-[#D9C39B] shadow-[0_15px_35px_rgba(198,154,69,0.1)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D9C39B]">
            <User className="text-[#91651F]" size={20} />
            <h3 className="text-base font-black text-[#33291B]">Perfil de Acesso</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-black text-[#857662] block mb-1">Nome do Operador</label>
              <input
                type="text"
                defaultValue={user.name}
                className="w-full p-2.5 rounded-xl bg-[#F5EFE4] border border-[#D9C39B] font-black text-[#33291B]"
              />
            </div>
            <div>
              <label className="font-black text-[#857662] block mb-1">E-mail Corporativo</label>
              <input
                type="email"
                defaultValue={user.email}
                className="w-full p-2.5 rounded-xl bg-[#F5EFE4] border border-[#D9C39B] font-mono text-[#33291B]"
              />
            </div>
          </div>
        </div>

        {/* Box 3: Experiência Visual 3D 4K */}
        <div className="bg-[#FFF9EF] rounded-3xl p-6 border border-[#D9C39B] shadow-[0_15px_35px_rgba(198,154,69,0.1)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D9C39B]">
            <Sparkles className="text-[#91651F]" size={20} />
            <h3 className="text-base font-black text-[#33291B]">Motor de Renderização Tridimensional</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#F5EFE4] border border-[#D9C39B] cursor-pointer">
              <div>
                <strong className="block text-[#33291B] font-black">Gráficos Volumétricos 3D</strong>
                <span className="text-[11px] text-[#857662] font-semibold">Habilita sombreamento, cilindros e radar 3D</span>
              </div>
              <input 
                type="checkbox" 
                checked={cinematicMode} 
                onChange={(e) => setCinematicMode(e.target.checked)}
                className="w-5 h-5 accent-[#C69A45]"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
