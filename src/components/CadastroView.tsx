import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Save, 
  Trash2, 
  Shield, 
  Eye, 
  EyeOff, 
  Plus, 
  Lock, 
  Mail, 
  UserCheck, 
  Check, 
  AlertCircle,
  ArrowLeft,
  KeyRound,
  Sparkles,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  Layers,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb } from '../firebase';
import { ref, onValue, set } from 'firebase/database';
import { getAllAvailablePages, PageDefinition, ICON_MAP } from '../data/pagesConfig';

export interface UserAccount {
  id: number;
  name: string;
  role: 'Administrador' | 'Agente de Risco' | 'Funcionario';
  allowedPages: string[];
  email: string;
  password: string;
  mustChangePassword: boolean;
}

export const DEFAULT_AGENT_PAGES = [
  'checklist', 
  'averbacao', 
  'sm_creator', 
  'iscas', 
  'controle', 
  'disponibilidade', 
  'escala'
];

export const ALL_ADMIN_PAGES = [
  'checklist', 
  'averbacao', 
  'sm_creator', 
  'iscas', 
  'controle', 
  'disponibilidade', 
  'escala', 
  'presence', 
  'rotas',
  'calendario',
  'settings',
  'cadastro'
];

export const FIXED_ADMIN_USER: UserAccount = {
  id: 1,
  name: 'jefferson',
  role: 'Administrador',
  email: 'jefferson@3coracoes.com.br',
  password: '#trescafe2029',
  mustChangePassword: false,
  allowedPages: [...ALL_ADMIN_PAGES]
};

const DEFAULT_USERS: UserAccount[] = [
  FIXED_ADMIN_USER,
  { 
    id: 2, 
    name: 'Operador Logístico', 
    role: 'Agente de Risco', 
    allowedPages: [...DEFAULT_AGENT_PAGES],
    email: 'operador@3coracoes.com.br', 
    password: '123',
    mustChangePassword: true
  }
];

export const sanitizeUsers = (userList: any[]): UserAccount[] => {
  if (!Array.isArray(userList)) return DEFAULT_USERS;
  // Filtrar usuários inválidos e remover login legado "jeff"
  const cleaned: UserAccount[] = userList
    .filter((u: any) => u && u.name && String(u.name).trim().toLowerCase() !== 'jeff')
    .map((u: any) => {
      // Normalizar 'Funcionario' para 'Agente de Risco'
      const role: 'Administrador' | 'Agente de Risco' = 
        u.role === 'Administrador' ? 'Administrador' : 'Agente de Risco';
      
      let allowedPages: string[] = [];
      if (role === 'Agente de Risco') {
        if (Array.isArray(u.allowedPages) && u.allowedPages.length > 0) {
          allowedPages = u.allowedPages.filter((p: any) => typeof p === 'string' && p.trim().length > 0);
        } else {
          allowedPages = [...DEFAULT_AGENT_PAGES];
        }
      } else {
        // Administrador tem acesso amplo - garantido como array, nunca undefined
        allowedPages = Array.isArray(u.allowedPages) && u.allowedPages.length > 0
          ? u.allowedPages
          : [...ALL_ADMIN_PAGES];
      }

      const pass = String(u.password ?? '123');
      const mustChange = u.mustChangePassword !== undefined ? Boolean(u.mustChangePassword) : (pass === '123');

      return {
        id: Number(u.id) || Date.now(),
        name: String(u.name || '').trim(),
        role,
        allowedPages,
        email: u.email || `${String(u.name || 'usuario').toLowerCase().replace(/\s+/g, '')}@3coracoes.com.br`,
        password: pass,
        mustChangePassword: mustChange
      };
    });
  
  // Garantir que o usuário administrativo fixo jefferson sempre exista com os dados definidos
  const idx = cleaned.findIndex(u => String(u.name).trim().toLowerCase() === 'jefferson');
  if (idx === -1) {
    cleaned.unshift(FIXED_ADMIN_USER);
  } else {
    // Garantir que a senha (#trescafe2029) e perfil do admin fixo estejam sempre corretos
    cleaned[idx] = {
      ...cleaned[idx],
      name: 'jefferson',
      role: 'Administrador',
      email: cleaned[idx].email || 'jefferson@3coracoes.com.br',
      password: '#trescafe2029',
      mustChangePassword: false,
      allowedPages: [...ALL_ADMIN_PAGES]
    };
  }

  return cleaned.length > 0 ? cleaned : DEFAULT_USERS;
};

export const cleanUsersForFirebase = (userList: any[]): UserAccount[] => {
  const sanitized = sanitizeUsers(userList);
  return sanitized.map(u => ({
    id: Number(u.id) || Date.now(),
    name: String(u.name || '').trim(),
    role: u.role === 'Administrador' ? 'Administrador' : 'Agente de Risco',
    allowedPages: Array.isArray(u.allowedPages) ? u.allowedPages : [],
    email: String(u.email || '').trim(),
    password: String(u.password || '123'),
    mustChangePassword: Boolean(u.mustChangePassword)
  }));
};

export interface CadastroViewProps {
  onBack?: () => void;
  currentUser?: { email: string; name: string; role: string; allowedPages?: string[] } | null;
  embedded?: boolean;
}

export default function CadastroView({ onBack, currentUser, embedded = false }: CadastroViewProps) {
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'Administrador' || currentUser?.name?.toLowerCase() === 'jefferson';

  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('app_users');
      if (saved) {
        return sanitizeUsers(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_USERS;
  });

  // If not admin, the "selected user" is always themselves
  const [selectedUserId, setSelectedUserId] = useState<number>(() => {
    if (!isAdmin && currentUser) {
      const self = users.find(u => u.email === currentUser.email || u.name === currentUser.name);
      return self?.id || users[0]?.id || 1;
    }
    return users[0]?.id || 1;
  });

  const [showPassword, setShowPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Lista de páginas disponíveis para seleção de permissões
  const availablePagesList = useMemo(() => {
    return getAllAvailablePages().filter(p => p.id !== 'cadastro');
  }, []);

  // Sincronização em tempo real com Firebase RTDB (app_users)
  useEffect(() => {
    const usersRef = ref(rtdb, 'app_users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Array.isArray(data)) {
        const cleaned = sanitizeUsers(data);
        setUsers(cleaned);
        localStorage.setItem('app_users', JSON.stringify(cleaned));
      } else if (!data) {
        // Inicializar com usuários padrão no Firebase se vazio (sem undefined)
        const initialPayload = cleanUsersForFirebase(DEFAULT_USERS);
        set(usersRef, initialPayload);
      }
    });

    return () => unsubscribe();
  }, []);

  const saveToStorageAndFirebase = (newUsers: UserAccount[]) => {
    const cleaned = sanitizeUsers(newUsers);
    setUsers(cleaned);
    localStorage.setItem('app_users', JSON.stringify(cleaned));
    try {
      const payload = cleanUsersForFirebase(cleaned);
      set(ref(rtdb, 'app_users'), payload);
    } catch (e) {
      console.error('Erro ao sincronizar com Firebase:', e);
    }

    // Se o usuário atual foi editado, sincroniza também seu logged_user no localStorage
    if (currentUser) {
      const selfUpdated = cleaned.find(u => u.email === currentUser.email || u.name === currentUser.name);
      if (selfUpdated) {
        const updatedLogged = {
          email: selfUpdated.email,
          name: selfUpdated.name,
          role: selfUpdated.role === 'Administrador' ? 'admin' : 'agente_de_risco',
          roleLabel: selfUpdated.role,
          allowedPages: selfUpdated.allowedPages,
          mustChangePassword: Boolean(selfUpdated.mustChangePassword)
        };
        localStorage.setItem('logged_user', JSON.stringify(updatedLogged));
      }
    }
  };

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0];
  const isSelectedUserFixedAdmin = selectedUser?.name?.toLowerCase() === 'jefferson';

  const updateUserField = (field: keyof UserAccount, value: any) => {
    if (!selectedUser) return;
    
    // Se mudou de Administrador para Agente de Risco, garante páginas padrão
    let newAllowedPages = selectedUser.allowedPages;
    if (field === 'role') {
      if (value === 'Agente de Risco' && (!newAllowedPages || newAllowedPages.length === 0)) {
        newAllowedPages = [...DEFAULT_AGENT_PAGES];
      } else if (value === 'Administrador') {
        newAllowedPages = [...ALL_ADMIN_PAGES];
      }
    }

    const updated = users.map(u => {
      if (u.id === selectedUserId) {
        return { 
          ...u, 
          [field]: value,
          ...(field === 'role' ? { allowedPages: newAllowedPages } : {})
        };
      }
      return u;
    });

    saveToStorageAndFirebase(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const togglePagePermission = (pageId: string) => {
    if (!selectedUser || selectedUser.role === 'Administrador') return;
    const currentAllowed = selectedUser.allowedPages || [];
    const exists = currentAllowed.includes(pageId);
    const updatedPages = exists
      ? currentAllowed.filter(id => id !== pageId)
      : [...currentAllowed, pageId];

    const updated = users.map(u => u.id === selectedUserId ? { ...u, allowedPages: updatedPages } : u);
    saveToStorageAndFirebase(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSelectAllPages = () => {
    if (!selectedUser || selectedUser.role === 'Administrador') return;
    const allPageIds = availablePagesList.map(p => p.id);
    const updated = users.map(u => u.id === selectedUserId ? { ...u, allowedPages: allPageIds } : u);
    saveToStorageAndFirebase(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleClearAllPages = () => {
    if (!selectedUser || selectedUser.role === 'Administrador') return;
    const updated = users.map(u => u.id === selectedUserId ? { ...u, allowedPages: [] } : u);
    saveToStorageAndFirebase(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAddUser = () => {
    const newUser: UserAccount = {
      id: Date.now(),
      name: `Novo Usuário ${users.length + 1}`,
      role: 'Agente de Risco',
      allowedPages: [...DEFAULT_AGENT_PAGES],
      email: `usuario${users.length + 1}@3coracoes.com.br`,
      password: '123',
      mustChangePassword: true
    };
    const updated = [...users, newUser];
    saveToStorageAndFirebase(updated);
    setSelectedUserId(newUser.id);
    setFeedbackMsg({ text: 'Novo usuário criado com senha padrão "123". Será solicitada a alteração no primeiro login.', type: 'success' });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleResetPasswordTo123 = () => {
    if (!selectedUser || isSelectedUserFixedAdmin) return;
    const updated = users.map(u => u.id === selectedUserId ? { ...u, password: '123', mustChangePassword: true } : u);
    saveToStorageAndFirebase(updated);
    setFeedbackMsg({ text: `Senha de ${selectedUser.name} redefinida para "123". Será exigida a alteração no próximo login.`, type: 'success' });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleDeleteUser = (id: number) => {
    const targetUser = users.find(u => u.id === id);
    if (targetUser && targetUser.name.toLowerCase() === 'jefferson') {
      setFeedbackMsg({ text: 'O usuário jefferson é o administrativo fixo do sistema e não pode ser excluído.', type: 'error' });
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }
    if (users.length <= 1) {
      setFeedbackMsg({ text: 'Não é possível excluir o único usuário do sistema.', type: 'error' });
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }
    const updated = users.filter(u => u.id !== id);
    saveToStorageAndFirebase(updated);
    if (selectedUserId === id) {
      setSelectedUserId(updated[0]?.id || 1);
    }
    setFeedbackMsg({ text: 'Usuário removido com sucesso.', type: 'success' });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const content = (
    <div className="space-y-6">
      {/* HEADER BAR (if not embedded) */}
      {!embedded && (
        <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#25231F] border border-[#E6D2A3] transition-colors cursor-pointer"
                title="Voltar"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d41a22] to-[#7f0b12] border-2 border-[#D9C39B] flex items-center justify-center text-white shadow-sm">
              <Users size={22} className="text-[#F5EFE4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#25231F] tracking-tight font-heading uppercase">
                  {isAdmin ? 'CADASTRO DE USUÁRIOS' : 'MEU PERFIL / SEGURANÇA'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-[#8C6D28] border border-amber-300 text-[10px] font-mono font-bold uppercase">
                  {isAdmin ? 'Controle de Acessos & Funções' : 'Dados da Conta'}
                </span>
              </div>
              <p className="text-xs text-[#77736B] font-mono uppercase tracking-wider mt-0.5">
                {isAdmin ? 'Gerencie credenciais, função de acesso (Administrador ou Agente de Risco) e permissões de páginas' : 'Mantenha seus dados de acesso e senha atualizados'}
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleAddUser}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#292820] hover:bg-black text-[#FAF7F0] border border-[#D9C39B] text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <UserPlus size={16} className="text-[#C5A059]" />
                <span>Novo Usuário</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* EMBEDDED TOP ACTION BAR */}
      {embedded && isAdmin && (
        <div className="flex items-center justify-between bg-white border border-[#E6D2A3] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F5F0E6] text-[#8C6D28] border border-[#E6D2A3] flex items-center justify-center">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-[#25231F]">
                Cadastro de Usuários & Níveis de Acesso
              </h2>
              <p className="text-[11px] text-[#77736B] font-mono">
                Defina a função de cada usuário: Administrador (acesso total) ou Agente de Risco (acesso customizado por páginas)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddUser}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#292820] hover:bg-black text-[#FAF7F0] border border-[#D9C39B] text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <UserPlus size={15} className="text-[#C5A059]" />
            <span>Novo Usuário</span>
          </button>
        </div>
      )}

      {/* FEEDBACK TOAST */}
      {feedbackMsg && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 border transition-all ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
            : 'bg-red-50 text-red-800 border-red-300'
        }`}>
          {feedbackMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* MAIN 2-COLUMN MANAGEMENT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* LEFT: USERS LIST - ONLY FOR ADMINS */}
        {isAdmin && (
          <div className="md:col-span-5 bg-[#FFFCF6] border border-[#E6D2A3] rounded-3xl p-5 shadow-sm space-y-3 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6D2A3]">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-[#C49A45]" />
                <h2 className="text-xs font-black uppercase tracking-wider text-[#25231F]">
                  Usuários Autorizados ({users.length})
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#77736B] font-bold">
                Controle de Acessos
              </span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[560px] pr-1">
              {users.map((u) => {
                const isSelected = selectedUserId === u.id;
                const isUserAdmin = u.role === 'Administrador';
                const allowedCount = (u.allowedPages || []).length;

                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#F5F0E6] border-[#C49A45] shadow-sm ring-1 ring-[#C49A45]/30'
                        : 'bg-white border-[#EDE2CE] hover:border-[#D9C39B] hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isSelected 
                          ? 'bg-[#292820] text-[#C49A45] border-[#C49A45]' 
                          : 'bg-stone-100 text-[#77736B] border-stone-200'
                      }`}>
                        {isUserAdmin ? <ShieldCheck size={16} /> : <Sliders size={16} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-[#25231F] truncate leading-tight">
                          {u.name}
                        </p>
                        <p className="text-[11px] text-[#77736B] font-mono truncate">
                          {u.email || 'Sem e-mail'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase ${
                            isUserAdmin
                              ? 'bg-amber-100 text-[#8C6D28] border border-amber-300'
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}>
                            {u.role === 'Administrador' ? '1. Administrador' : '2. Agente de Risco'}
                          </span>
                          {!isUserAdmin && (
                            <span className="text-[9px] font-mono text-[#8C7B63] bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                              {allowedCount} pág.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUser(u.id);
                      }}
                      className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Excluir usuário"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-[11px] text-[#8C6D28] font-mono flex items-start gap-2 mt-auto">
              <Lock size={14} className="shrink-0 mt-0.5 text-amber-600" />
              <span>
                Administrador gerencia o acesso total ou por páginas de cada Agente de Risco.
              </span>
            </div>
          </div>
        )}

        {/* RIGHT: EDIT FORM */}
        <div className={cn("bg-[#FFFCF6] border border-[#E6D2A3] rounded-3xl p-6 shadow-sm space-y-5", isAdmin ? "md:col-span-7" : "md:col-span-12 max-w-2xl mx-auto w-full")}>
          {selectedUser ? (
            <>
              <div className="flex items-center justify-between pb-4 border-b border-[#E6D2A3]">
                <div className="flex items-center gap-2.5">
                  <UserCheck size={18} className="text-[#C49A45]" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-[#25231F]">
                    {isAdmin ? `Editar Cadastro: ${selectedUser.name}` : 'Meus Dados de Acesso'}
                  </h2>
                </div>
                {saveSuccess && (
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-300 flex items-center gap-1">
                    <Check size={12} /> Salvo Automaticamente
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* NOME / LOGIN */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#77736B] mb-1.5">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      disabled={!isAdmin || isSelectedUserFixedAdmin}
                      value={selectedUser.name}
                      onChange={(e) => updateUserField('name', e.target.value)}
                      placeholder="Ex: João Silva"
                      className={cn(
                        "w-full border rounded-xl pl-10 pr-3 py-2.5 text-xs font-bold focus:outline-none",
                        !isAdmin || isSelectedUserFixedAdmin ? "bg-stone-50 border-stone-200 text-stone-500 cursor-not-allowed" : "bg-white border-[#E6D2A3] text-[#25231F] focus:border-[#C49A45]"
                      )}
                    />
                  </div>
                </div>

                {/* FUNÇÃO - MENU SUSPENSO (1. Administrador / 2. Agente de Risco) */}
                <div className="sm:col-span-2">
                  <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-[#77736B] mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Shield size={14} className="text-[#C49A45]" />
                      <span>Função</span>
                    </span>
                    <span className="text-[9.5px] text-[#8C6D28] font-bold">
                      {selectedUser.role === 'Administrador' ? 'Acesso Total' : 'Acesso Restrito a Páginas'}
                    </span>
                  </label>
                  <div className="relative">
                    <Shield size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <select
                      disabled={!isAdmin || isSelectedUserFixedAdmin}
                      value={selectedUser.role}
                      onChange={(e) => updateUserField('role', (e.target.value as 'Administrador' | 'Agente de Risco'))}
                      className={cn(
                        "w-full border rounded-xl pl-10 pr-3 py-2.5 text-xs font-bold focus:outline-none cursor-pointer",
                        !isAdmin || isSelectedUserFixedAdmin 
                          ? "bg-stone-50 border-stone-200 text-stone-500 cursor-not-allowed" 
                          : "bg-white border-[#E6D2A3] text-[#25231F] focus:border-[#C49A45]"
                      )}
                    >
                      <option value="Administrador">1. Administrador</option>
                      <option value="Agente de Risco">2. Agente de Risco</option>
                    </select>
                  </div>

                  {/* Descrição contextual da Função selecionada */}
                  <div className="mt-2.5">
                    {selectedUser.role === 'Administrador' ? (
                      <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 flex items-start gap-2.5 text-xs">
                        <ShieldCheck size={18} className="text-emerald-700 shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                          <strong className="font-black uppercase text-emerald-800">1. Administrador:</strong> Consegue acessar, utilizar e visualizar todas as páginas operacionais, telas de configuração, cadastro e gerenciamento geral sem nenhuma restrição.
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 flex items-start gap-2.5 text-xs">
                        <Sliders size={18} className="text-amber-700 shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                          <strong className="font-black uppercase text-amber-800">2. Agente de Risco:</strong> O administrador irá mostrar e marcar abaixo exatamente quais páginas este usuário poderá usar e visualizar no sistema.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* PÁGINAS PERMITIDAS PARA O AGENTE DE RISCO                                 */}
                {/* ========================================================================= */}
                {selectedUser.role === 'Agente de Risco' && (
                  <div className="sm:col-span-2 space-y-3 pt-2 border-t border-[#E6D2A3]/70">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-[#25231F] flex items-center gap-1.5">
                          <Sliders size={14} className="text-[#C49A45]" />
                          <span>Páginas Autorizadas para este Agente de Risco</span>
                        </h3>
                        <p className="text-[10px] text-[#77736B] font-mono mt-0.5">
                          Marque as páginas que este usuário poderá visualizar e utilizar:
                        </p>
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSelectAllPages}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Marcar Todas
                          </button>
                          <button
                            type="button"
                            onClick={handleClearAllPages}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Desmarcar Todas
                          </button>
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-[#8C6D28] border border-amber-300 text-[10px] font-mono font-bold">
                            {(selectedUser.allowedPages || []).length} de {availablePagesList.length}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Grade de Páginas Disponíveis */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                      {availablePagesList.map((page) => {
                        const isAllowed = (selectedUser.allowedPages || []).includes(page.id);
                        const IconComp = ICON_MAP[page.iconName] || Sliders;

                        return (
                          <div
                            key={page.id}
                            onClick={() => {
                              if (isAdmin && !isSelectedUserFixedAdmin) {
                                togglePagePermission(page.id);
                              }
                            }}
                            className={cn(
                              "p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 select-none",
                              isAdmin && !isSelectedUserFixedAdmin ? "cursor-pointer" : "cursor-default",
                              isAllowed
                                ? "bg-white border-emerald-400 shadow-xs ring-1 ring-emerald-400/30"
                                : "bg-stone-50 border-stone-200 opacity-60 hover:opacity-100 hover:border-stone-300"
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border",
                                isAllowed
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                  : "bg-stone-100 text-stone-400 border-stone-200"
                              )}>
                                <IconComp size={15} />
                              </div>
                              <div className="min-w-0">
                                <p className={cn("text-xs font-black truncate leading-tight", isAllowed ? "text-[#25231F]" : "text-stone-500")}>
                                  {page.label}
                                </p>
                                <p className="text-[9px] text-[#77736B] font-mono truncate">
                                  {page.category}
                                </p>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center">
                              {isAllowed ? (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[8.5px] font-mono font-bold border border-emerald-300">
                                  <Check size={10} />
                                  <span>AUTORIZADA</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-stone-200 text-stone-600 text-[8.5px] font-mono font-bold border border-stone-300">
                                  <Lock size={10} />
                                  <span>BLOQUEADA</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* E-MAIL */}
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#77736B] mb-1.5">
                    E-mail Institucional
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      value={selectedUser.email}
                      onChange={(e) => updateUserField('email', e.target.value)}
                      placeholder="usuario@3coracoes.com.br"
                      className="w-full bg-white border border-[#E6D2A3] rounded-xl pl-10 pr-3 py-2.5 text-xs font-mono text-[#25231F] focus:outline-none focus:border-[#C49A45]"
                    />
                  </div>
                </div>

                {/* SENHA */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#77736B]">
                      Senha de Acesso
                    </label>
                    {(selectedUser.mustChangePassword || selectedUser.password === '123') && (
                      <span className="text-[9px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                        Senha padrão 123 (obriga troca no 1º login)
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={selectedUser.password}
                      onChange={(e) => {
                        const val = e.target.value;
                        const mustChange = val === '123';
                        const updated = users.map(u => u.id === selectedUserId ? { ...u, password: val, mustChangePassword: mustChange } : u);
                        saveToStorageAndFirebase(updated);
                        setSaveSuccess(true);
                        setTimeout(() => setSaveSuccess(false), 2000);
                      }}
                      placeholder="Digite a senha"
                      className="w-full bg-white border border-[#E6D2A3] rounded-xl pl-10 pr-10 py-2.5 text-xs font-mono font-bold text-[#25231F] focus:outline-none focus:border-[#C49A45]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#25231F] cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {isAdmin && !isSelectedUserFixedAdmin && (
                    <div className="mt-1.5 flex items-center justify-between text-[10px]">
                      <span className="text-[#77736B]">
                        {selectedUser.mustChangePassword || selectedUser.password === '123' 
                          ? 'O usuário precisará criar uma nova senha pessoal após o 1º login.' 
                          : 'Senha já alterada pelo usuário.'}
                      </span>
                      <button
                        type="button"
                        onClick={handleResetPasswordTo123}
                        className="text-[#8C6D28] hover:text-[#25231F] font-bold underline cursor-pointer"
                      >
                        Redefinir para 123
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E6D2A3] flex items-center justify-between">
                <div className="text-[11px] font-mono text-[#77736B]">
                  ID Cadastral: #{selectedUser.id}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      saveToStorageAndFirebase(users);
                      setFeedbackMsg({ text: 'Alterações gravadas com sucesso no sistema e Firebase!', type: 'success' });
                      setTimeout(() => setFeedbackMsg(null), 3000);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#292820] hover:bg-black text-[#FAF7F0] border border-[#D9C39B] text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Save size={15} className="text-[#C49A45]" />
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-[#77736B]">
              <Users size={32} className="mx-auto mb-2 text-stone-300" />
              <p className="text-sm font-bold">Nenhum usuário selecionado</p>
              <p className="text-xs">Selecione um usuário à esquerda ou clique em "Novo Usuário".</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="min-h-full bg-[#F5F0E6] text-[#25231F] p-4 sm:p-6 lg:p-8 select-none font-sans">
      <div className="max-w-6xl mx-auto">
        {content}
      </div>
    </div>
  );
}
