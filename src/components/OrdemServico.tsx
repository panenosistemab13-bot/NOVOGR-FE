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
  FileText,
  Navigation,
  Eye,
  EyeOff
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
  subtitle: string;
  icon: React.ElementType;
  isLink?: boolean;
  isPassword?: boolean;
}

const CREDENTIALS_ITEMS: CopyItem[] = [
  {
    id: 'site',
    label: 'Site Oficial',
    value: 'https://sascar.com.br/',
    subtitle: 'Portal Web Sascar',
    icon: Globe,
    isLink: true
  },
  {
    id: 'login',
    label: 'Login',
    value: 'SCLARA',
    subtitle: 'Usuário do Portal',
    icon: User
  },
  {
    id: 'senha',
    label: 'Senha',
    value: 'SASCAR@741#',
    subtitle: 'Credencial de Segurança',
    icon: KeyRound,
    isPassword: true
  },
  {
    id: 'cnpj',
    label: 'CNPJ',
    value: '63310411000101',
    subtitle: 'Documento da Empresa',
    icon: Building2
  },
  {
    id: 'cep',
    label: 'CEP',
    value: '34.735-010',
    subtitle: 'Código Postal Padrão',
    icon: MapPin
  }
];

interface AddressField {
  id: string;
  label: string;
  value: string;
  icon: React.ElementType;
  colSpan?: string;
}

const ADDRESS_FIELDS: AddressField[] = [
  {
    id: 'pais',
    label: 'País',
    value: 'Brasil',
    icon: Globe
  },
  {
    id: 'cep_form',
    label: 'CEP',
    value: '34.735-010',
    icon: MapPin
  },
  {
    id: 'estado',
    label: 'Estado*',
    value: 'MG',
    icon: Building2
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
    icon: Navigation,
    colSpan: 'sm:col-span-2'
  },
  {
    id: 'logradouro',
    label: 'Logradouro* (mínimo três letras para a autopesquisa)',
    value: 'RODOVIA BR-381',
    icon: Navigation,
    colSpan: 'sm:col-span-2'
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

function CardCornerFlourish() {
  return (
    <svg
      viewBox="0 0 84 44"
      fill="none"
      aria-hidden="true"
      className="pointer-events-none select-none absolute bottom-0 right-0 w-20 h-11 opacity-90"
    >
      <path
        d="M84 44 L84 4 C66 26 42 36 8 44 Z"
        fill="url(#osCornerCrimson)"
      />
      <path
        d="M84 14 C64 31 44 39 14 44 C46 37 67 27 84 6 Z"
        fill="url(#osCornerGold)"
      />
      <defs>
        <linearGradient id="osCornerCrimson" x1="8" y1="44" x2="84" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B0E17" />
          <stop offset="55%" stopColor="#C11924" />
          <stop offset="100%" stopColor="#7C0B13" />
        </linearGradient>
        <linearGradient id="osCornerGold" x1="14" y1="44" x2="84" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D4A646" />
          <stop offset="50%" stopColor="#F9DF8B" />
          <stop offset="100%" stopColor="#B88322" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function OrdemServico({ onBack: _onBack }: OrdemServicoProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const copyText = async (id: string, label: string, value: string, isSecret = false) => {
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
    setToastMessage(isSecret ? `${label} copiada para a área de transferência!` : `${label} copiado: ${value}`);
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

    copyText('all_credentials', 'Todas as credenciais', fullText, true);
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

    copyText('all_address', 'Endereço completo', fullAddress, true);
  };

  return (
    <div
      className="relative w-full min-h-[calc(100vh-76px)] bg-[#F9F8F6] text-[#1D1E22] p-4 sm:p-7 select-none overflow-x-hidden overflow-y-auto"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif" }}
    >
      {/* Decoração de fundo elegante nos cantos (Carmesim & Dourado 3 Corações) */}
      <svg
        viewBox="0 0 360 220"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none select-none absolute top-0 left-0 w-72 sm:w-96 h-auto opacity-85 z-0"
      >
        <path d="M0 0 L220 0 C150 62 78 96 0 132 Z" fill="url(#bgTopCrimson)" />
        <path d="M0 118 C82 86 154 52 224 0 L248 0 C172 64 96 102 0 144 Z" fill="url(#bgTopGold)" />
        <defs>
          <linearGradient id="bgTopCrimson" x1="0" y1="0" x2="220" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7C0A12" />
            <stop offset="60%" stopColor="#C11924" />
            <stop offset="100%" stopColor="#9B0F19" />
          </linearGradient>
          <linearGradient id="bgTopGold" x1="0" y1="140" x2="248" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#BA8523" />
            <stop offset="50%" stopColor="#F8DE8A" />
            <stop offset="100%" stopColor="#CFA03E" />
          </linearGradient>
        </defs>
      </svg>

      <svg
        viewBox="0 0 420 200"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none select-none absolute bottom-0 right-0 w-80 sm:w-[440px] h-auto opacity-90 z-0"
      >
        <path d="M420 200 L140 200 C245 152 336 106 420 42 Z" fill="url(#bgBotCrimson)" />
        <path d="M108 200 C226 148 326 98 420 26 L420 48 C332 114 238 160 148 200 Z" fill="url(#bgBotGold)" />
        <defs>
          <linearGradient id="bgBotCrimson" x1="140" y1="200" x2="420" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7D0911" />
            <stop offset="55%" stopColor="#C41B26" />
            <stop offset="100%" stopColor="#8E0E17" />
          </linearGradient>
          <linearGradient id="bgBotGold" x1="108" y1="200" x2="420" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C48F2A" />
            <stop offset="50%" stopColor="#FAE18E" />
            <stop offset="100%" stopColor="#BA8523" />
          </linearGradient>
        </defs>
      </svg>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-medium flex items-center gap-2.5 shadow-lg"
          >
            <Check size={14} className="text-emerald-600 shrink-0" />
            <span className="truncate max-w-xs sm:max-w-md">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* =================================================================== */}
        {/* CABEÇALHO PRINCIPAL 3D PREMIUM                                      */}
        {/* =================================================================== */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-white via-[#FCFBF9] to-[#F7F3EC] border border-[#E5D7B8] shadow-[0_6px_22px_rgba(30,25,18,0.07),inset_0_1px_0_#ffffff] px-5 sm:px-7 py-4 sm:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardCornerFlourish />

          <div className="relative z-10 flex items-center gap-4">
            {/* Medalhão Circular Carmesim + Borda Dourada Metálica */}
            <div className="w-14 h-14 rounded-full p-[3px] bg-gradient-to-br from-[#F9DF8B] via-[#CFA03E] to-[#9E6E1A] shadow-[0_4px_14px_rgba(162,24,33,0.28)] shrink-0">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#E12531] via-[#B4111C] to-[#7D0810] flex items-center justify-center text-[#FFF6D6] shadow-[inset_0_2px_4px_rgba(255,255,255,0.35)]">
                <KeyRound className="w-6 h-6 stroke-[2]" />
              </div>
            </div>

            <div className="text-left">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 block">
                CENTRAL GR • GESTÃO DE SERVIÇOS
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#17191E] mt-0.5">
                Ordem de Serviço — <span className="text-[#B8141F]">Sascar</span>
              </h1>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Credenciais de acesso e dados de endereço padronizados para abertura rápida da O.S.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3 flex-wrap shrink-0">
            <a
              href="https://sascar.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-b from-[#DF2330] via-[#B8131E] to-[#860A12] hover:brightness-110 text-white text-xs font-bold tracking-wide transition-all flex items-center gap-2 shadow-[0_4px_12px_rgba(165,16,26,0.32),inset_0_1px_1px_rgba(255,255,255,0.3)] border border-[#7C0B12] whitespace-nowrap shrink-0 cursor-pointer active:translate-y-px"
            >
              <ExternalLink size={14} className="text-[#FFE8A3]" />
              <span>Acessar Portal Sascar</span>
            </a>

            <button
              type="button"
              onClick={handleCopyAllCredentials}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2 cursor-pointer border whitespace-nowrap shrink-0 active:translate-y-px",
                copiedId === 'all_credentials'
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-gradient-to-b from-[#FFFFFF] to-[#F7F1E5] hover:to-[#EFE6D4] text-[#26231D] border-[#DFCFA8] shadow-[0_2px_8px_rgba(30,25,18,0.06),inset_0_1px_0_#ffffff]"
              )}
            >
              {copiedId === 'all_credentials' ? (
                <Check size={14} />
              ) : (
                <Copy size={14} className="text-[#9E1620]" />
              )}
              <span>{copiedId === 'all_credentials' ? 'Credenciais Copiadas' : 'Copiar Tudo'}</span>
            </button>
          </div>
        </header>

        {/* =================================================================== */}
        {/* SEÇÃO 1: CREDENCIAIS DE ACESSO & DADOS PRINCIPAIS                   */}
        {/* =================================================================== */}
        <section className="space-y-3.5">
          <div className="flex items-center gap-3 px-1">
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-[#DF2330] to-[#8D0C14]" />
              <h2 className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#1D1E22]">
                CREDENCIAIS DE ACESSO &amp; DADOS PRINCIPAIS
              </h2>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-[#DFCFA8] via-[#E8DEC7] to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {CREDENTIALS_ITEMS.map((item) => {
              const Icon = item.icon;
              const isCopied = copiedId === item.id;
              const isPasswordItem = Boolean(item.isPassword);
              const displayedValue = isPasswordItem && !showPassword ? '•••••••••••' : item.value;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border p-4 transition-all duration-150 flex flex-col justify-between gap-3.5 bg-gradient-to-b from-white to-[#FAF8F4]",
                    isCopied
                      ? "border-emerald-400 shadow-[0_6px_18px_rgba(16,185,129,0.12)]"
                      : "border-[#E6D7B7] hover:border-[#D4B475] shadow-[0_4px_14px_rgba(25,20,14,0.055),inset_0_1px_0_#ffffff]"
                  )}
                >
                  <CardCornerFlourish />

                  {/* Topo do Card: Medalhão Carmesim + Título + Subtítulo */}
                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors border shadow-[0_3px_8px_rgba(162,24,33,0.22),inset_0_1px_1px_rgba(255,255,255,0.35)]",
                          isCopied
                            ? "bg-emerald-600 text-white border-emerald-500"
                            : "bg-gradient-to-br from-[#DC2626] via-[#B4111C] to-[#7F0B13] text-white border-[#F3D27A]/60"
                        )}
                      >
                        <Icon size={16} className="stroke-[2]" />
                      </div>
                      <div className="text-left min-w-0">
                        <span className="text-xs font-extrabold text-[#17191E] block truncate">
                          {item.label}
                        </span>
                        <span className="text-[10.5px] font-medium text-slate-500 block truncate">
                          {item.subtitle}
                        </span>
                      </div>
                    </div>

                    {item.isLink && (
                      <a
                        href={item.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-[#B86E14] hover:text-[#9E1620] hover:bg-[#FAF1DC] transition-colors shrink-0"
                        title="Abrir site em nova aba"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>

                  {/* Cápsula de Valor */}
                  <div className="relative z-10 px-3.5 py-2 rounded-full bg-[#F2F3F5] border border-slate-200/90 shadow-[inset_0_1px_2px_rgba(15,23,42,0.06)] flex items-center justify-between gap-2 min-h-[38px]">
                    <span
                      className={cn(
                        "text-[13px] font-bold text-[#17191E] truncate tabular-nums",
                        isPasswordItem && !showPassword ? "tracking-[0.18em] text-slate-600 select-none" : "select-all"
                      )}
                      style={{ fontFamily: isPasswordItem && !showPassword ? undefined : "'JetBrains Mono', monospace" }}
                      title={isPasswordItem && !showPassword ? 'Senha oculta' : item.value}
                    >
                      {displayedValue}
                    </span>

                    {isPasswordItem && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="p-1 rounded-full text-[#8C6D28] hover:text-[#17191E] hover:bg-white transition-colors cursor-pointer shrink-0"
                        title={showPassword ? 'Ocultar senha' : 'Visualizar senha'}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    )}
                  </div>

                  {/* Botões de Ação */}
                  <div className="relative z-10 flex items-center gap-2">
                    {isPasswordItem && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-b from-white to-[#F7F3EA] hover:to-[#EFE6D4] border border-[#DFCFA8] text-[#3B2F22] text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
                        title={showPassword ? 'Ocultar senha' : 'Visualizar senha'}
                      >
                        {showPassword ? <EyeOff size={12} className="text-[#9E1620]" /> : <Eye size={12} className="text-[#9E1620]" />}
                        <span>{showPassword ? 'Ocultar' : 'Ver'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => copyText(item.id, item.label, item.value, isPasswordItem)}
                      className={cn(
                        "flex-1 py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border shadow-2xs",
                        isCopied
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-gradient-to-b from-white to-[#F7F3EA] hover:from-[#1D1E22] hover:to-[#111216] text-[#1D1E22] hover:text-white border-[#DFCFA8] hover:border-[#1D1E22]"
                      )}
                    >
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =================================================================== */}
        {/* SEÇÃO 2: DADOS DO ENDEREÇO & REFERÊNCIA DO FORMULÁRIO               */}
        {/* =================================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Coluna Esquerda: Dados de Endereço */}
          <div className="lg:col-span-7 relative overflow-hidden rounded-2xl bg-gradient-to-b from-white to-[#FAF8F4] border border-[#E6D7B7] p-5 sm:p-6 shadow-[0_6px_20px_rgba(25,20,14,0.06),inset_0_1px_0_#ffffff] space-y-4">
            <CardCornerFlourish />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#EFE6D4]">
              <div className="flex items-start gap-2.5 text-left">
                <span className="w-1 h-9 rounded-full bg-gradient-to-b from-[#DF2330] to-[#8D0C14] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#17191E]">
                    Dados de Endereço para Abertura de O.S.
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    Clique em qualquer cartão abaixo para copiar o campo correspondente
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyAllAddress}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border whitespace-nowrap shadow-2xs",
                  copiedId === 'all_address'
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-gradient-to-b from-white to-[#F7F3EA] hover:from-[#1D1E22] hover:to-[#111216] text-[#1D1E22] hover:text-white border-[#DFCFA8] hover:border-[#1D1E22]"
                )}
              >
                {copiedId === 'all_address' ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedId === 'all_address' ? 'Endereço Copiado' : 'Copiar Endereço Completo'}</span>
              </button>
            </div>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {ADDRESS_FIELDS.map((field) => {
                const Icon = field.icon;
                const isCopied = copiedId === field.id;

                return (
                  <div
                    key={field.id}
                    onClick={() => copyText(field.id, field.label, field.value)}
                    className={cn(
                      "group rounded-2xl border p-3.5 transition-all cursor-pointer flex items-center justify-between gap-3",
                      field.colSpan || '',
                      isCopied
                        ? "bg-emerald-50/70 border-emerald-400"
                        : "bg-[#FAF8F4] hover:bg-white border-[#EAE0CB] hover:border-[#D4B475] shadow-[0_2px_6px_rgba(25,20,14,0.03)]"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-colors",
                          isCopied
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-gradient-to-b from-[#FFFDF8] to-[#F3E9D2] text-[#A3131D] border-[#DFCFA8] shadow-2xs"
                        )}
                      >
                        <Icon size={15} className="stroke-[2]" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-medium text-slate-500 block truncate">
                          {field.label}
                        </span>
                        <span className="text-[13px] font-extrabold text-[#17191E] block truncate select-all mt-0.5">
                          {field.value}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyText(field.id, field.label, field.value);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all shrink-0 border shadow-2xs cursor-pointer",
                        isCopied
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white group-hover:bg-[#1D1E22] text-[#2B2620] group-hover:text-white border-[#DFCFA8] group-hover:border-[#1D1E22]"
                      )}
                    >
                      {isCopied ? <Check size={12} /> : <Copy size={12} className="text-[#A3131D] group-hover:text-[#F5C542]" />}
                      <span>{isCopied ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coluna Direita: Espelho do Formulário Sascar */}
          <div className="lg:col-span-5 relative overflow-hidden rounded-2xl bg-gradient-to-b from-white to-[#FAF8F4] border border-[#E6D7B7] p-5 shadow-[0_6px_20px_rgba(25,20,14,0.06),inset_0_1px_0_#ffffff] space-y-3.5 text-left">
            <CardCornerFlourish />

            <div className="relative z-10 flex items-start gap-2.5 pb-3 border-b border-[#EFE6D4]">
              <span className="w-1 h-8 rounded-full bg-gradient-to-b from-[#DF2330] to-[#8D0C14] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-500 block">
                  REFERÊNCIA VISUAL
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-[#17191E] mt-0.5">
                  Espelho do Formulário Sascar
                </h3>
              </div>
            </div>

            <div className="relative z-10 rounded-xl overflow-hidden border border-[#E5D7B8] bg-white p-2 shadow-inner">
              <img
                src="/assets/aistudio/image_a06dbe91.png"
                alt="Referência de preenchimento Ordem de Serviço Sascar"
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
