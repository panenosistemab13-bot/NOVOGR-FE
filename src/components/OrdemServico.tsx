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
      className="w-full min-h-[calc(100vh-76px)] bg-white text-[#1E293B] p-4 sm:p-7 font-sans select-none overflow-y-auto"
      style={{ zoom: 0.88 }}
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-normal flex items-center gap-2.5 shadow-lg"
          >
            <Check size={14} className="text-emerald-600 shrink-0" />
            <span className="truncate max-w-xs sm:max-w-md">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* =================================================================== */}
        {/* CABEÇALHO LIMPO E ELEGANTE (FUNDO BRANCO)                           */}
        {/* =================================================================== */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-[0_2px_14px_rgba(15,23,42,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 text-[#B98321] shadow-2xs">
              <Wrench className="w-5 h-5 stroke-[1.8]" />
            </div>

            <div className="text-left">
              <span className="text-[11px] font-normal uppercase tracking-[0.14em] text-slate-400 block">
                CENTRAL GR • GESTÃO DE SERVIÇOS
              </span>
              <h1 className="text-lg sm:text-xl font-medium tracking-tight text-slate-900 mt-0.5">
                Ordem de Serviço — Sascar
              </h1>
              <p className="text-xs font-normal text-slate-500 mt-0.5">
                Credenciais de acesso e dados de endereço padronizados para abertura rápida de O.S.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <a
              href="https://sascar.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-normal tracking-wide transition-all flex items-center gap-2 shadow-2xs cursor-pointer active:scale-95"
            >
              <ExternalLink size={13} className="text-[#F5B82E]" />
              <span>Acessar Portal Sascar</span>
            </a>

            <button
              type="button"
              onClick={handleCopyAllCredentials}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-normal tracking-wide transition-all flex items-center gap-2 cursor-pointer border active:scale-95",
                copiedId === 'all_credentials'
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
              )}
            >
              {copiedId === 'all_credentials' ? (
                <Check size={13} />
              ) : (
                <Copy size={13} className="text-slate-500" />
              )}
              <span>{copiedId === 'all_credentials' ? 'Credenciais Copiadas' : 'Copiar Tudo'}</span>
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* SEÇÃO 1: CARDS DE CREDENCIAIS E IDENTIFICAÇÃO                       */}
        {/* =================================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="text-left">
              <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                Credenciais de Acesso &amp; Dados Principais
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {CREDENTIALS_ITEMS.map((item) => {
              const Icon = item.icon;
              const isCopied = copiedId === item.id;
              const isPasswordItem = Boolean(item.isPassword);
              const displayedValue = isPasswordItem && !showPassword ? '•••••••••••' : item.value;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "group relative rounded-2xl border p-4 transition-all duration-150 flex flex-col justify-between gap-3.5 bg-white",
                    isCopied
                      ? "border-emerald-400 bg-emerald-50/30 shadow-xs"
                      : "border-slate-200/90 hover:border-slate-300 shadow-[0_2px_10px_rgba(15,23,42,0.03)]"
                  )}
                >
                  {/* Topo do Card: Ícone + Label + subtítulo */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors border",
                          isCopied
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-slate-50 text-slate-600 border-slate-200/70"
                        )}
                      >
                        <Icon size={15} className="stroke-[1.8]" />
                      </div>
                      <div className="text-left min-w-0">
                        <span className="text-xs font-medium text-slate-800 block truncate">
                          {item.label}
                        </span>
                        <span className="text-[10.5px] font-normal text-slate-400 block truncate">
                          {item.subtitle}
                        </span>
                      </div>
                    </div>

                    {item.isLink && (
                      <a
                        href={item.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Abrir site em nova aba"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>

                  {/* Valor do Card */}
                  <div className="px-3 py-2 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between gap-2 min-h-[38px]">
                    <span
                      className={cn(
                        "text-[13px] font-normal text-slate-800 truncate",
                        isPasswordItem && !showPassword ? "tracking-[0.2em] text-slate-500 select-none" : "select-all"
                      )}
                      title={isPasswordItem && !showPassword ? 'Senha oculta' : item.value}
                    >
                      {displayedValue}
                    </span>

                    {isPasswordItem && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
                        title={showPassword ? 'Ocultar senha' : 'Visualizar senha'}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    )}
                  </div>

                  {/* Botões de Ação na Base do Card */}
                  <div className="flex items-center gap-2">
                    {isPasswordItem && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px] font-normal transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                        title={showPassword ? 'Ocultar senha' : 'Visualizar senha'}
                      >
                        {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                        <span>{showPassword ? 'Ocultar' : 'Ver'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => copyText(item.id, item.label, item.value, isPasswordItem)}
                      className={cn(
                        "flex-1 py-1.5 px-3 rounded-xl text-[11px] font-normal transition-all flex items-center justify-center gap-1.5 cursor-pointer border",
                        isCopied
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white hover:bg-slate-900 text-slate-700 hover:text-white border-slate-200 hover:border-slate-900"
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
        </div>

        {/* =================================================================== */}
        {/* SEÇÃO 2: DADOS DO ENDEREÇO E REFERÊNCIA DO FORMULÁRIO               */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Coluna Esquerda: Cards delicados dos campos de endereço */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-[0_2px_14px_rgba(15,23,42,0.035)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-100">
              <div className="text-left">
                <h3 className="text-sm font-medium text-slate-800">
                  Dados de Endereço para Abertura de O.S.
                </h3>
                <p className="text-xs font-normal text-slate-400 mt-0.5">
                  Clique em qualquer cartão abaixo para copiar o campo correspondente
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyAllAddress}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-normal flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border",
                  copiedId === 'all_address'
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-slate-50 hover:bg-slate-900 text-slate-700 hover:text-white border-slate-200"
                )}
              >
                {copiedId === 'all_address' ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedId === 'all_address' ? 'Endereço Copiado' : 'Copiar Endereço Completo'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {ADDRESS_FIELDS.map((field) => {
                const Icon = field.icon;
                const isCopied = copiedId === field.id;

                return (
                  <div
                    key={field.id}
                    onClick={() => copyText(field.id, field.label, field.value)}
                    className={cn(
                      "group rounded-xl border p-3.5 transition-all cursor-pointer flex items-center justify-between gap-3",
                      field.colSpan || '',
                      isCopied
                        ? "bg-emerald-50/50 border-emerald-400"
                        : "bg-slate-50/50 hover:bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-2xs"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                          isCopied
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-slate-500 border-slate-200/80"
                        )}
                      >
                        <Icon size={14} className="stroke-[1.75]" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-normal text-slate-400 block truncate">
                          {field.label}
                        </span>
                        <span className="text-[13px] font-normal text-slate-800 block truncate select-all mt-0.5">
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
                        "px-2.5 py-1 rounded-lg text-[11px] font-normal flex items-center gap-1 transition-all shrink-0 border",
                        isCopied
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white group-hover:bg-slate-900 text-slate-600 group-hover:text-white border-slate-200 group-hover:border-slate-900"
                      )}
                    >
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{isCopied ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coluna Direita: Imagem de Referência do Formulário */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_2px_14px_rgba(15,23,42,0.035)] space-y-3.5 text-left">
            <div className="pb-3 border-b border-slate-100">
              <span className="text-[10.5px] font-normal uppercase tracking-[0.12em] text-slate-400 block">
                Referência Visual
              </span>
              <h3 className="text-sm font-medium text-slate-800 mt-0.5">
                Espelho do Formulário Sascar
              </h3>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-200/80 bg-slate-50/50 p-2">
              <img
                src="/assets/aistudio/image_a06dbe91.png"
                alt="Referência de preenchimento Ordem de Serviço Sascar"
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
