import React, { useState } from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  Globe,
  User,
  KeyRound,
  Building2,
  MapPin,
  Wrench,
  FileText,
  Navigation,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface OrdemServicoProps {
  onBack?: () => void;
}

interface CopyItem {
  id: string;
  label: string;
  value: string;
  helper?: string;
  icon: React.ElementType;
  isLink?: boolean;
}

const CREDENTIALS_ITEMS: CopyItem[] = [
  {
    id: 'site',
    label: 'SITE',
    value: 'https://sascar.com.br/',
    helper: 'Portal Oficial Sascar',
    icon: Globe,
    isLink: true
  },
  {
    id: 'login',
    label: 'LOGIN',
    value: 'SCLARA',
    helper: 'Usuário de acesso',
    icon: User
  },
  {
    id: 'senha',
    label: 'SENHA',
    value: 'SASCAR@741#',
    helper: 'Credencial de acesso',
    icon: KeyRound
  },
  {
    id: 'cnpj',
    label: 'CNPJ',
    value: '63310411000101',
    helper: 'Cadastro Nacional de Pessoa Jurídica',
    icon: Building2
  },
  {
    id: 'cep',
    label: 'CEP',
    value: '34.735-010',
    helper: 'Código de Endereçamento Postal',
    icon: MapPin
  }
];

const ADDRESS_FORM_ITEMS: CopyItem[] = [
  {
    id: 'pais',
    label: 'País',
    value: 'Brasil',
    icon: Globe
  },
  {
    id: 'cep_form',
    label: 'Cep',
    value: '34.735-010',
    icon: MapPin
  },
  {
    id: 'estado',
    label: 'Estado*',
    value: 'MG',
    icon: MapPin
  },
  {
    id: 'cidade',
    label: 'Cidade*',
    value: 'SABARA',
    icon: Building2
  },
  {
    id: 'bairro',
    label: 'Bairro*',
    value: 'DISTRITO INDUSTRIAL SIMAO DA CUNHA',
    icon: Navigation
  },
  {
    id: 'logradouro',
    label: 'Logradouro* (mínimo três letras para a autopesquisa)',
    value: 'RODOVIA BR-381',
    icon: Navigation
  },
  {
    id: 'numero',
    label: 'Número*',
    value: '33',
    icon: FileText
  },
  {
    id: 'referencia',
    label: 'Ponto de Referência*',
    value: 'SUPERMERCADO REDE MANIA',
    icon: MapPin
  }
];

export default function OrdemServico({ onBack: _onBack }: OrdemServicoProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const copyText = async (id: string, label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setCopiedId(id);
    setToastMessage(`${label} copiado: ${value}`);
    setTimeout(() => {
      setCopiedId(prev => (prev === id ? null : prev));
    }, 2000);
    setTimeout(() => {
      setToastMessage(null);
    }, 2600);
  };

  const handleCopyAllCredentials = () => {
    const fullText = [
      'Site: https://sascar.com.br/',
      '',
      'login: SCLARA',
      'senha: SASCAR@741#',
      '',
      'cnpj: 63310411000101',
      'cep: 34.735-010'
    ].join('\n');

    copyText('all_credentials', 'Todas as credenciais', fullText);
  };

  const handleCopyAllAddress = () => {
    const fullAddress = [
      'País: Brasil',
      'CEP: 34.735-010',
      'Estado: MG',
      'Cidade: SABARA',
      'Bairro: DISTRITO INDUSTRIAL SIMAO DA CUNHA',
      'Logradouro: RODOVIA BR-381',
      'Número: 33',
      'Ponto de Referência: SUPERMERCADO REDE MANIA'
    ].join('\n');

    copyText('all_address', 'Endereço completo', fullAddress);
  };

  return (
    <div
      className="w-full min-h-[calc(100vh-76px)] bg-[#FAF6EF] text-[#181715] p-4 sm:p-6 font-sans select-none overflow-y-auto"
      style={{ zoom: 0.88 }}
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.96 }}
            className="fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl bg-[#F0FFF4] text-emerald-900 border border-emerald-300 text-xs font-medium flex items-center gap-2.5 shadow-xl"
          >
            <Check size={15} className="text-emerald-600 shrink-0" />
            <span className="truncate max-w-xs sm:max-w-md">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto space-y-5">
        {/* =================================================================== */}
        {/* CABEÇALHO PRINCIPAL - ORDEM DE SERVIÇO                              */}
        {/* =================================================================== */}
        <div className="bg-gradient-to-r from-[#1E1D1A] via-[#282621] to-[#1E1D1A] rounded-3xl p-5 sm:p-6 text-white border border-[#D4AF37]/40 shadow-[0_10px_30px_rgba(0,0,0,0.12)] relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-[#D4AF37]/10 blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#F7DE88] via-[#D89E28] to-[#9E690E] p-[1.5px] shadow-lg shrink-0">
                <div className="w-full h-full rounded-[14px] bg-[#1E1D1A] flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-[#F5C242]" />
                </div>
              </div>

              <div className="text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F7DE88] text-[10px] uppercase tracking-widest mb-1">
                  <ShieldCheck size={12} />
                  <span>CENTRAL GR • GESTÃO TÉCNICA</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white uppercase">
                  ORDEM DE SERVIÇO — SASCAR
                </h1>
                <p className="text-xs text-[#C9C4B8] mt-0.5">
                  Acesso rápido às credenciais, CNPJ, CEP e endereço padrão para abertura de O.S.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <a
                href="https://sascar.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-full bg-[#F5B82E] hover:bg-[#E5A81E] text-[#181715] text-xs font-medium uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
              >
                <ExternalLink size={14} />
                <span>Abrir Site Sascar</span>
              </a>

              <button
                type="button"
                onClick={handleCopyAllCredentials}
                className={cn(
                  "px-4 py-2.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border active:scale-95",
                  copiedId === 'all_credentials'
                    ? "bg-emerald-600 text-white border-emerald-500"
                    : "bg-white/10 hover:bg-white/15 text-white border-white/20"
                )}
              >
                {copiedId === 'all_credentials' ? <Check size={14} /> : <Copy size={14} className="text-[#F5B82E]" />}
                <span>{copiedId === 'all_credentials' ? 'Tudo Copiado!' : 'Copiar Todos os Dados'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* BLOCO 1: CREDENCIAIS E DADOS PRINCIPAIS PARA COPIAR                 */}
        {/* =================================================================== */}
        <div className="bg-[#FFFDF9] border border-[#EDE3CE] rounded-3xl p-5 sm:p-6 shadow-[0_4px_18px_rgba(0,0,0,0.035)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EFE7D6]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#24231E] text-[#F5B82E] flex items-center justify-center shrink-0">
                <Sparkles size={16} />
              </div>
              <div className="text-left">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#181715]">
                  DADOS DE ACESSO E IDENTIFICAÇÃO
                </h2>
                <p className="text-[11px] text-[#7A7469]">
                  Clique em qualquer cartão ou no botão copiar para transferir o dado imediatamente
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {CREDENTIALS_ITEMS.map((item) => {
              const Icon = item.icon;
              const isCopied = copiedId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => copyText(item.id, item.label, item.value)}
                  className={cn(
                    "group relative rounded-2xl border p-4 transition-all duration-150 cursor-pointer flex flex-col justify-between gap-3",
                    isCopied
                      ? "bg-emerald-50/90 border-emerald-400 shadow-xs"
                      : "bg-white hover:bg-[#FFFDF9] border-[#E7DEC8] hover:border-[#D4AF37] shadow-[0_2px_10px_rgba(0,0,0,0.025)]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                          isCopied
                            ? "bg-emerald-600 text-white"
                            : "bg-[#FAF6EE] text-[#B8821E] border border-[#EDE3CE]"
                        )}
                      >
                        <Icon size={17} />
                      </div>
                      <div className="text-left min-w-0">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-[#7A7469] block">
                          {item.label}
                        </span>
                        {item.helper && (
                          <span className="text-[10px] text-[#9A9386] truncate block">
                            {item.helper}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyText(item.id, item.label, item.value);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 cursor-pointer",
                        isCopied
                          ? "bg-emerald-600 text-white"
                          : "bg-[#FAF6EE] group-hover:bg-[#24231E] text-[#181715] group-hover:text-white border border-[#E5D8BC]"
                      )}
                    >
                      {isCopied ? <Check size={13} /> : <Copy size={13} className="text-[#C8922A] group-hover:text-[#F5B82E]" />}
                      <span>{isCopied ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-[#F4EFE4] flex items-center justify-between gap-2">
                    <span className="text-sm sm:text-[15px] font-medium text-[#181715] select-all break-all">
                      {item.value}
                    </span>

                    {item.isLink && (
                      <a
                        href={item.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] text-[#2563EB] hover:underline flex items-center gap-1 shrink-0"
                        title="Abrir link em nova guia"
                      >
                        <span>Abrir</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =================================================================== */}
        {/* BLOCO 2: ENDEREÇO E CAMPOS DO FORMULÁRIO (CONFORME IMAGEM ANEXA)    */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Coluna Esquerda: Campos estilo formulário Sascar clicáveis para copiar */}
          <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-6 shadow-[0_4px_18px_rgba(0,0,0,0.035)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="text-left">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#181715]">
                  CAMPOS DE ENDEREÇO (CADASTRO O.S.)
                </h3>
                <p className="text-[11px] text-[#6B7280]">
                  Clique em qualquer campo abaixo para copiar o valor exato do formulário
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyAllAddress}
                className={cn(
                  "px-3.5 py-2 rounded-full text-[11px] font-medium uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border",
                  copiedId === 'all_address'
                    ? "bg-emerald-600 text-white border-emerald-500"
                    : "bg-[#FAF6EE] hover:bg-[#24231E] text-[#181715] hover:text-white border-[#E5D8BC]"
                )}
              >
                {copiedId === 'all_address' ? <Check size={13} /> : <Copy size={13} className="text-[#C8922A]" />}
                <span>{copiedId === 'all_address' ? 'Endereço Copiado!' : 'Copiar Endereço'}</span>
              </button>
            </div>

            {/* Grid reproduzindo fielmente a disposição do formulário da imagem */}
            <div className="space-y-3.5 text-left">
              {/* Linha 1: País e Cep */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {ADDRESS_FORM_ITEMS.slice(0, 2).map((field) => {
                  const isCopied = copiedId === field.id;
                  return (
                    <div key={field.id} className="space-y-1">
                      <label className="text-xs font-medium text-[#4B5563] block">
                        {field.label}
                      </label>
                      <button
                        type="button"
                        onClick={() => copyText(field.id, field.label, field.value)}
                        className={cn(
                          "w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-left transition-all cursor-pointer",
                          isCopied
                            ? "bg-emerald-50 border-emerald-400 text-emerald-950"
                            : "bg-[#E8F0FE] hover:bg-[#DCE7FE] border-[#CBD5E1] text-[#111827]"
                        )}
                      >
                        <span className="text-xs sm:text-[13px] font-normal select-all">{field.value}</span>
                        {isCopied ? (
                          <Check size={14} className="text-emerald-600 shrink-0" />
                        ) : (
                          <Copy size={14} className="text-[#4B5563] shrink-0" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Linha 2: Estado* e Cidade* */}
              <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-3.5">
                {ADDRESS_FORM_ITEMS.slice(2, 4).map((field) => {
                  const isCopied = copiedId === field.id;
                  return (
                    <div key={field.id} className="space-y-1">
                      <label className="text-xs font-medium text-[#4B5563] block">
                        {field.label}
                      </label>
                      <button
                        type="button"
                        onClick={() => copyText(field.id, field.label, field.value)}
                        className={cn(
                          "w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-left transition-all cursor-pointer",
                          isCopied
                            ? "bg-emerald-50 border-emerald-400 text-emerald-950"
                            : field.id === 'estado'
                            ? "bg-[#E8F0FE] hover:bg-[#DCE7FE] border-[#CBD5E1] text-[#111827]"
                            : "bg-[#F9FAFB] hover:bg-[#F3F4F6] border-[#E5E7EB] text-[#4B5563]"
                        )}
                      >
                        <span className="text-xs sm:text-[13px] font-normal select-all">{field.value}</span>
                        {isCopied ? (
                          <Check size={14} className="text-emerald-600 shrink-0" />
                        ) : (
                          <Copy size={14} className="text-[#6B7280] shrink-0" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Linha 3: Bairro* */}
              {ADDRESS_FORM_ITEMS.slice(4, 5).map((field) => {
                const isCopied = copiedId === field.id;
                return (
                  <div key={field.id} className="space-y-1">
                    <label className="text-xs font-medium text-[#4B5563] block">
                      {field.label}
                    </label>
                    <button
                      type="button"
                      onClick={() => copyText(field.id, field.label, field.value)}
                      className={cn(
                        "w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-left transition-all cursor-pointer",
                        isCopied
                          ? "bg-emerald-50 border-emerald-400 text-emerald-950"
                          : "bg-[#E8F0FE] hover:bg-[#DCE7FE] border-[#CBD5E1] text-[#111827]"
                      )}
                    >
                      <span className="text-xs sm:text-[13px] font-normal select-all">{field.value}</span>
                      {isCopied ? (
                        <Check size={14} className="text-emerald-600 shrink-0" />
                      ) : (
                        <Copy size={14} className="text-[#4B5563] shrink-0" />
                      )}
                    </button>
                  </div>
                );
              })}

              {/* Linha 4: Logradouro* */}
              {ADDRESS_FORM_ITEMS.slice(5, 6).map((field) => {
                const isCopied = copiedId === field.id;
                return (
                  <div key={field.id} className="space-y-1">
                    <label className="text-xs font-medium text-[#4B5563] block">
                      {field.label}
                    </label>
                    <button
                      type="button"
                      onClick={() => copyText(field.id, field.label, field.value)}
                      className={cn(
                        "w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-left transition-all cursor-pointer",
                        isCopied
                          ? "bg-emerald-50 border-emerald-400 text-emerald-950"
                          : "bg-[#F3F4F6] hover:bg-[#E5E7EB] border-[#E5E7EB] text-[#4B5563]"
                      )}
                    >
                      <span className="text-xs sm:text-[13px] font-normal select-all">{field.value}</span>
                      {isCopied ? (
                        <Check size={14} className="text-emerald-600 shrink-0" />
                      ) : (
                        <Copy size={14} className="text-[#6B7280] shrink-0" />
                      )}
                    </button>
                  </div>
                );
              })}

              {/* Linha 5: Número* */}
              {ADDRESS_FORM_ITEMS.slice(6, 7).map((field) => {
                const isCopied = copiedId === field.id;
                return (
                  <div key={field.id} className="space-y-1 max-w-xs">
                    <label className="text-xs font-medium text-[#4B5563] block">
                      {field.label}
                    </label>
                    <button
                      type="button"
                      onClick={() => copyText(field.id, field.label, field.value)}
                      className={cn(
                        "w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-left transition-all cursor-pointer",
                        isCopied
                          ? "bg-emerald-50 border-emerald-400 text-emerald-950"
                          : "bg-[#E8F0FE] hover:bg-[#DCE7FE] border-[#CBD5E1] text-[#111827]"
                      )}
                    >
                      <span className="text-xs sm:text-[13px] font-normal select-all">{field.value}</span>
                      {isCopied ? (
                        <Check size={14} className="text-emerald-600 shrink-0" />
                      ) : (
                        <Copy size={14} className="text-[#4B5563] shrink-0" />
                      )}
                    </button>
                  </div>
                );
              })}

              {/* Linha 6: Ponto de Referência* */}
              {ADDRESS_FORM_ITEMS.slice(7, 8).map((field) => {
                const isCopied = copiedId === field.id;
                return (
                  <div key={field.id} className="space-y-1">
                    <label className="text-xs font-medium text-[#4B5563] block">
                      {field.label}
                    </label>
                    <button
                      type="button"
                      onClick={() => copyText(field.id, field.label, field.value)}
                      className={cn(
                        "w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-left transition-all cursor-pointer",
                        isCopied
                          ? "bg-emerald-50 border-emerald-400 text-emerald-950"
                          : "bg-[#E8F0FE] hover:bg-[#DCE7FE] border-[#CBD5E1] text-[#111827]"
                      )}
                    >
                      <span className="text-xs sm:text-[13px] font-normal select-all">{field.value}</span>
                      {isCopied ? (
                        <Check size={14} className="text-emerald-600 shrink-0" />
                      ) : (
                        <Copy size={14} className="text-[#4B5563] shrink-0" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coluna Direita: Imagem de Referência Anexada */}
          <div className="lg:col-span-5 bg-[#FFFDF9] border border-[#EDE3CE] rounded-3xl p-5 shadow-[0_4px_18px_rgba(0,0,0,0.035)] space-y-3 text-left">
            <div className="pb-2 border-b border-[#EFE7D6]">
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#B8821E] block">
                MODELO DE PREENCHIMENTO
              </span>
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-[#181715]">
                REFERÊNCIA VISUAL DO FORMULÁRIO
              </h3>
            </div>

            <div className="rounded-2xl overflow-hidden border border-[#E5E7EB] bg-white p-2 shadow-2xs">
              <img
                src="/assets/aistudio/image_a06dbe91.png"
                alt="Referência de preenchimento Ordem de Serviço Sascar"
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>

            <div className="bg-[#FAF6EE] border border-[#EDE3CE] rounded-2xl p-3.5 text-xs space-y-1 text-[#4A463F]">
              <p><strong>Site:</strong> https://sascar.com.br/</p>
              <p><strong>Login:</strong> SCLARA</p>
              <p><strong>Senha:</strong> SASCAR@741#</p>
              <p><strong>CNPJ:</strong> 63310411000101</p>
              <p><strong>CEP:</strong> 34.735-010</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
