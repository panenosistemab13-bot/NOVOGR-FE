import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Save, 
  Trash2, 
  Shield, 
  Lock, 
  Mail,
  Check,
  AlertCircle,
  ArrowLeft,
  Sliders,
  ShieldCheck,
  User,
  Edit3,
  Info,
  Ban,
  ChevronDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb } from '../firebase';
import { ref, onValue, set } from '../utils/rtdbWithUndo';
import { getAllAvailablePages, ICON_MAP } from '../data/pagesConfig';
import { logAuditAction, logDebouncedEdit } from '../utils/auditHistory';

export interface UserAccount {
  id: number;
  name: string;
  role: 'Administrador' | 'Agente de Risco' | 'Funcionario';
  allowedPages: string[];
  hasCustomPermissions?: boolean;
  email: string;
}

export const DEFAULT_AGENT_PAGES = [
  'checklist', 
  'averbacao', 
  'sm_creator', 
  'lancamento', 
  'controle', 
  'disponibilidade', 
  'escala',
  'lista_emails',
  'historico'
];

export const ALL_ADMIN_PAGES = [
  'checklist', 
  'averbacao', 
  'sm_creator', 
  'lancamento', 
  'controle', 
  'disponibilidade', 
  'escala',
  'ordem_servico',
  'cobrancas',
  'lista_emails',
  'presence', 
  'rotas',
  'calendario',
  'historico',
  'settings',
  'cadastro'
];

export const FIXED_ADMIN_USER: UserAccount = {
  id: 1,
  name: 'Administrador Principal',
  role: 'Administrador',
  email: 'panenosistemab13@gmail.com',
  allowedPages: [...ALL_ADMIN_PAGES]
};

const DEFAULT_USERS: UserAccount[] = [
  FIXED_ADMIN_USER,
  {
    id: 2,
    name: 'jefferson',
    role: 'Administrador',
    email: 'jefferson@3coracoes.com.br',
    allowedPages: [...ALL_ADMIN_PAGES]
  },
  { 
    id: 3, 
    name: 'Operador Logístico', 
    role: 'Agente de Risco', 
    allowedPages: [...DEFAULT_AGENT_PAGES],
    email: 'operador@3coracoes.com.br'
  }
];

export const sanitizeUsers = (userList: any): UserAccount[] => {
  const rawArray = Array.isArray(userList)
    ? userList
    : (userList && typeof userList === 'object' ? Object.values(userList) : null);
  if (!rawArray) return DEFAULT_USERS;

  const cleaned: UserAccount[] = rawArray
    .filter((u: any) => u && typeof u === 'object' && String(u.name || '').trim().toLowerCase() !== 'jeff')
    .map((u: any) => {
      const role: 'Administrador' | 'Agente de Risco' = 
        u.role === 'Administrador' ? 'Administrador' : 'Agente de Risco';
      
      let allowedPages: string[] = [];
      let hasCustomPermissions = Boolean(u.hasCustomPermissions);
      if (role === 'Agente de Risco') {
        if (Array.isArray(u.allowedPages)) {
          allowedPages = u.allowedPages.filter((p: any) => typeof p === 'string' && p.trim().length > 0);
          hasCustomPermissions = true;
        } else if (u.hasCustomPermissions) {
          allowedPages = [];
          hasCustomPermissions = true;
        } else {
          allowedPages = [...DEFAULT_AGENT_PAGES];
        }
      } else {
        allowedPages = Array.isArray(u.allowedPages) && u.allowedPages.length > 0
          ? u.allowedPages
          : [...ALL_ADMIN_PAGES];
      }

      return {
        id: Number(u.id) || Date.now(),
        name: String(u.name ?? ''),
        role,
        allowedPages,
        ...(role === 'Agente de Risco' && hasCustomPermissions ? { hasCustomPermissions: true } : {}),
        email: String(u.email ?? '') || `${String(u.name || 'usuario').toLowerCase().replace(/\s+/g, '')}@3coracoes.com.br`
      };
    });
  
  const rootIdx = cleaned.findIndex(
    u => String(u.email || '').trim().toLowerCase() === FIXED_ADMIN_USER.email.toLowerCase()
  );
  if (rootIdx === -1) {
    cleaned.unshift({ ...FIXED_ADMIN_USER });
  }

  const idx = cleaned.findIndex(u => String(u.name).trim().toLowerCase() === 'jefferson');
  if (idx === -1) {
    cleaned.push({
      id: 2,
      name: 'jefferson',
      role: 'Administrador',
      email: 'jefferson@3coracoes.com.br',
      allowedPages: [...ALL_ADMIN_PAGES]
    });
  } else {
    cleaned[idx] = {
      ...cleaned[idx],
      name: 'jefferson',
      role: 'Administrador',
      email: cleaned[idx].email || 'jefferson@3coracoes.com.br',
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
    ...(u.role !== 'Administrador' && u.hasCustomPermissions ? { hasCustomPermissions: true } : {}),
    email: String(u.email || '').trim()
  }));
};

export interface CadastroViewProps {
  onBack?: () => void;
  currentUser?: { email: string; name: string; role: string; allowedPages?: string[] } | null;
  embedded?: boolean;
}

export default function CadastroView({ onBack, currentUser, embedded = false }: CadastroViewProps) {
  const isAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.role === 'Administrador' ||
    currentUser?.name?.toLowerCase() === 'jefferson' ||
    currentUser?.email?.trim().toLowerCase() === 'panenosistemab13@gmail.com' ||
    currentUser?.email?.trim().toLowerCase() === 'jefferson@3coracoes.com.br';

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

  const findSelfUser = (userList: UserAccount[]) => {
    if (!currentUser) return null;
    const cleanEmail = (currentUser.email || '').trim().toLowerCase();
    const cleanName = (currentUser.name || '').trim().toLowerCase();
    return userList.find(u => {
      const uEmail = (u.email || '').trim().toLowerCase();
      const uName = (u.name || '').trim().toLowerCase();
      return (cleanEmail && uEmail === cleanEmail) || (cleanName && uName === cleanName);
    });
  };

  const [selectedUserId, setSelectedUserId] = useState<number>(() => {
    if (!isAdmin && currentUser) {
      const self = findSelfUser(users);
      return self?.id || users[0]?.id || 1;
    }
    return users[0]?.id || 1;
  });

  useEffect(() => {
    if (!isAdmin && currentUser && users.length > 0) {
      const self = findSelfUser(users);
      if (self && self.id !== selectedUserId) {
        setSelectedUserId(self.id);
      }
    }
  }, [users, currentUser, isAdmin, selectedUserId]);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedButton, setSavedButton] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const availablePagesList = useMemo(() => {
    const base = getAllAvailablePages().filter(p => p.id !== 'cadastro');
    if (!base.some(p => p.id === 'historico')) {
      base.push({
        id: 'historico',
        label: 'Histórico (Configurações)',
        buttonLabel: 'Histórico',
        category: 'Auditoria & Controle',
        iconName: 'History',
        description: 'Acesso à aba Histórico dentro de Configurações.',
        isDefaultVisible: true,
        isRestrictedByDefault: false
      });
    }
    return base;
  }, []);

  useEffect(() => {
    const usersRef = ref(rtdb, 'app_users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const rawList = Array.isArray(data)
        ? data
        : (data && typeof data === 'object' ? Object.values(data) : null);
      if (rawList && rawList.length > 0) {
        const cleaned = sanitizeUsers(rawList);
        setUsers(cleaned);
        localStorage.setItem('app_users', JSON.stringify(cleaned));
      } else if (!data) {
        const initialPayload = cleanUsersForFirebase(DEFAULT_USERS);
        set(usersRef, initialPayload);
      }
    });

    return () => unsubscribe();
  }, []);

  const saveToStorageAndFirebase = async (newUsers: UserAccount[]): Promise<boolean> => {
    const cleaned = sanitizeUsers(newUsers);
    setUsers(cleaned);
    localStorage.setItem('app_users', JSON.stringify(cleaned));

    if (currentUser) {
      const myEmail = (currentUser.email || '').trim().toLowerCase();
      const myName = (currentUser.name || '').trim().toLowerCase();
      const selfUpdated =
        cleaned.find(u => myEmail && u.email.trim().toLowerCase() === myEmail) ||
        cleaned.find(u => myName && u.name.trim().toLowerCase() === myName);
      if (selfUpdated) {
        const updatedLogged = {
          email: selfUpdated.email,
          name: selfUpdated.name,
          role: selfUpdated.role === 'Administrador' ? 'admin' : 'agente_de_risco',
          roleLabel: selfUpdated.role,
          allowedPages: selfUpdated.allowedPages
        };
        localStorage.setItem('logged_user', JSON.stringify(updatedLogged));
      }
    }

    try {
      const payload = cleanUsersForFirebase(cleaned);
      await set(ref(rtdb, 'app_users'), payload);
      return true;
    } catch (e) {
      console.error('Erro ao sincronizar com Firebase:', e);
      return false;
    }
  };

  const handleSaveChanges = async () => {
    if (isSaving) return;
    setIsSaving(true);

    const normalizedUsers = users.map((u) => ({
      ...u,
      name: String(u.name || '').trim(),
      email: String(u.email || '').trim()
    }));

    const ok = await saveToStorageAndFirebase(normalizedUsers);
    setIsSaving(false);

    if (ok) {
      setSaveSuccess(true);
      setSavedButton(true);
      setFeedbackMsg({ text: 'Alterações salvas com sucesso!', type: 'success' });
      setTimeout(() => setSaveSuccess(false), 2500);
      setTimeout(() => setSavedButton(false), 3000);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } else {
      setFeedbackMsg({
        text: 'Erro ao salvar no banco de dados. Verifique sua conexão e tente novamente.',
        type: 'error'
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0];
  const isSelectedUserFixedAdmin = selectedUser?.name?.toLowerCase() === 'jefferson';

  const updateUserField = (field: keyof UserAccount, value: any) => {
    if (!selectedUser) return;
    
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
    if (field === 'role') {
      logAuditAction({
        action: 'EDIT',
        module: 'Cadastro',
        target: `Função de ${selectedUser.name}`,
        details: `Alterou função de "${selectedUser.role}" para "${String(value)}"`
      });
    } else {
      logDebouncedEdit(`cadastro_user_${selectedUser.id}_${String(field)}`, {
        action: 'EDIT',
        module: 'Cadastro',
        target: `Usuário ${selectedUser.name}`,
        details: `Editou campo "${String(field)}" para "${String(value)}"`
      });
    }
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

    const updated = users.map(u =>
      u.id === selectedUserId
        ? { ...u, allowedPages: updatedPages, hasCustomPermissions: true }
        : u
    );
    saveToStorageAndFirebase(updated);
    const pageLabel = availablePagesList.find(p => p.id === pageId)?.label || pageId;
    logAuditAction({
      action: 'EDIT',
      module: 'Cadastro',
      target: `Permissões de ${selectedUser.name}`,
      details: `${exists ? 'Removeu' : 'Liberou'} acesso à página "${pageLabel}"`
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSelectAllPages = () => {
    if (!selectedUser || selectedUser.role === 'Administrador') return;
    const allPageIds = availablePagesList.map(p => p.id);
    const updated = users.map(u =>
      u.id === selectedUserId
        ? { ...u, allowedPages: allPageIds, hasCustomPermissions: true }
        : u
    );
    saveToStorageAndFirebase(updated);
    logAuditAction({
      action: 'EDIT',
      module: 'Cadastro',
      target: `Permissões de ${selectedUser.name}`,
      details: `Liberou todas as páginas (${allPageIds.length})`
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleClearAllPages = () => {
    if (!selectedUser || selectedUser.role === 'Administrador') return;
    const updated = users.map(u =>
      u.id === selectedUserId
        ? { ...u, allowedPages: [], hasCustomPermissions: true }
        : u
    );
    saveToStorageAndFirebase(updated);
    logAuditAction({
      action: 'EDIT',
      module: 'Cadastro',
      target: `Permissões de ${selectedUser.name}`,
      details: 'Removeu todas as permissões de páginas'
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAddUser = () => {
    const newUser: UserAccount = {
      id: Date.now(),
      name: `Novo Usuário ${users.length + 1}`,
      role: 'Agente de Risco',
      allowedPages: [...DEFAULT_AGENT_PAGES],
      email: `usuario${users.length + 1}@3coracoes.com.br`
    };
    const updated = [...users, newUser];
    saveToStorageAndFirebase(updated);
    setSelectedUserId(newUser.id);
    logAuditAction({
      action: 'ADD',
      module: 'Cadastro',
      target: newUser.name,
      details: `Criou usuário (${newUser.email}) com função ${newUser.role}`
    });
    setFeedbackMsg({ text: 'Novo usuário criado com sucesso.', type: 'success' });
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
    if (targetUser) {
      logAuditAction({
        action: 'DELETE',
        module: 'Cadastro',
        target: targetUser.name,
        details: `Excluiu usuário (${targetUser.email})`
      });
    }
    setFeedbackMsg({ text: 'Usuário removido com sucesso.', type: 'success' });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const content = (
    <div className="space-y-4">
      {/* HEADER BAR (if not embedded) */}
      {!embedded && (
        <div className="bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF9] to-[#FAF1DC] border border-[#DFC078] rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-10 h-10 rounded-full bg-gradient-to-b from-white to-[#FAF0DA] hover:brightness-95 text-[#17191E] border border-[#DFC078] transition-colors cursor-pointer flex items-center justify-center shadow-xs"
                title="Voltar"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#D41F29] via-[#9E0E17] to-[#63050A] border-2 border-[#E7C46D] flex items-center justify-center text-white shadow-sm">
              <Users size={22} className="text-[#FFF5D6]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#17191E] tracking-tight uppercase">
                  CADASTRO DE USUÁRIOS
                </h1>
                <span className="px-3 py-0.5 rounded-full bg-gradient-to-b from-[#FCE79D] to-[#DFB042] text-[#292012] border border-[#DFB042] text-[10px] font-extrabold uppercase">
                  Google Auth &amp; Acessos
                </span>
              </div>
              <p className="text-xs text-[#6B665D] mt-0.5">
                Gerencie nome, e-mail Google e função (Administrador ou Agente de Risco)
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleAddUser}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-b from-[#D2212B] via-[#9E0E17] to-[#68060B] hover:brightness-110 text-white border-2 border-[#E7C46D] text-xs font-extrabold shadow-md transition-all cursor-pointer active:scale-95"
              >
                <UserPlus size={16} className="text-[#FCE79D]" />
                <span>Novo Usuário</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* EMBEDDED TOP ACTION BAR */}
      {embedded && isAdmin && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF8] to-[#FAF1DC] border border-[#DFC078] rounded-3xl px-5 py-3.5 shadow-[0_8px_22px_-12px_rgba(92,58,12,0.18)]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[#FCE79D] via-[#E5BB54] to-[#B98321] border border-[#DFC078] text-[#59090F] flex items-center justify-center shadow-xs shrink-0">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wide text-[#17191E]">
                Cadastro de Usuários &amp; Níveis de Acesso
              </h2>
              <p className="text-[11px] text-[#6B665D]">
                Defina o nome, e-mail Google e a <strong className="font-bold text-[#292012]">função</strong> de cada usuário
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddUser}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-b from-[#D2212B] via-[#9E0E17] to-[#68060B] hover:brightness-110 text-white border-2 border-[#E7C46D] text-xs font-extrabold shadow-[0_6px_16px_-4px_rgba(142,14,23,0.45),inset_0_1px_0_rgba(255,255,255,0.28)] transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <UserPlus size={15} className="text-[#FCE79D]" />
            <span>Novo Usuário</span>
          </button>
        </div>
      )}

      {/* FEEDBACK TOAST */}
      {feedbackMsg && (
        <div className={cn(
          'p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 border transition-all',
          feedbackMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
            : 'bg-red-50 text-red-800 border-red-300'
        )}>
          {feedbackMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* MAIN 2-COLUMN MANAGEMENT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* LEFT: USERS LIST - ONLY FOR ADMINS */}
        {isAdmin && (
          <div className="md:col-span-5 bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF8] to-[#FAF2DF] border border-[#DFC078] rounded-3xl p-5 shadow-[0_12px_28px_-14px_rgba(92,16,22,0.18)] space-y-3.5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6D2A3]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#FCE79D] via-[#E5BB54] to-[#B98321] border border-[#DFC078] flex items-center justify-center text-[#59090F] shadow-2xs shrink-0">
                  <Users size={15} />
                </div>
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-wide text-[#17191E]">
                  Usuários Autorizados ({users.length})
                </h2>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#E6D2A3] shadow-2xs">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.68-.22-2.47H12v4.67h6.46a5.52 5.52 0 0 1-2.39 3.62v3.01h3.87c2.26-2.08 3.58-5.15 3.58-8.83Z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.87-3.01c-1.07.72-2.44 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.95H1.28v3.1A12 12 0 0 0 12 24Z" />
                  <path fill="#FBBC05" d="M5.28 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.28a12 12 0 0 0 0 10.78l4-3.1Z" />
                  <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.61l4 3.1C6.23 6.86 8.88 4.75 12 4.75Z" />
                </svg>
                <span className="text-[10.5px] font-bold text-[#292012]">Google Auth</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-2xs" />
              </div>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[580px] pr-1">
              {users.map((u) => {
                const isSelected = selectedUserId === u.id;
                const isUserAdmin = u.role === 'Administrador';
                const allowedCount = (u.allowedPages || []).length;

                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={cn(
                      'p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3',
                      isSelected
                        ? 'bg-gradient-to-r from-[#FFF1F2] via-[#FFE6E9] to-[#FFF5F5] border-[1.5px] border-[#C81B24]/70 shadow-[0_6px_16px_-6px_rgba(142,14,23,0.22)]'
                        : 'bg-white border-[#E6D2A3] hover:border-[#C59B38] hover:bg-[#FFFDF8] shadow-2xs'
                    )}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#D2212B] via-[#9E0E17] to-[#68060B] border-2 border-[#E7C46D] shadow-sm flex items-center justify-center text-white shrink-0">
                        <User size={19} className="text-[#FFF6DD]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-[#17191E] truncate leading-tight">
                          {u.name || 'Sem nome'}
                        </p>
                        <p className="text-[11px] text-[#5A564E] truncate mt-0.5">
                          {u.email || 'Sem e-mail'}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span
                            className={cn(
                              'px-3 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wide border shadow-2xs',
                              isUserAdmin
                                ? 'bg-gradient-to-b from-[#FCE79D] via-[#E6BB55] to-[#C28D24] text-[#292012] border-[#DFB042]'
                                : 'bg-gradient-to-b from-[#C81B24] to-[#8E0E17] text-white border-[#E7C46D]/60'
                            )}
                          >
                            {isUserAdmin ? 'ADMINISTRADOR' : 'AGENTE DE RISCO'}
                          </span>
                          {!isUserAdmin && (
                            <span className="text-[9.5px] font-bold text-[#292012] bg-white px-2.5 py-0.5 rounded-full border border-[#DFC078] shadow-2xs tabular-nums">
                              {allowedCount} Pág.
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
                      className="w-8 h-8 rounded-xl bg-[#FAF6EC] hover:bg-rose-50 border border-[#E6D2A3] hover:border-rose-300 text-[#6B665D] hover:text-rose-600 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                      title="Excluir usuário"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-2xl bg-gradient-to-r from-[#FFF7DF] to-[#FAF0D4] border border-[#DFC078] text-[11px] text-[#6B4E12] flex items-start gap-2 mt-auto">
              <Lock size={14} className="shrink-0 mt-0.5 text-[#9E0E17]" />
              <span>
                O acesso ao aplicativo é feito inteiramente via Conta Google correspondente ao e-mail cadastrado.
              </span>
            </div>
          </div>
        )}

        {/* RIGHT: EDIT FORM */}
        <div
          className={cn(
            'bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF8] to-[#FAF2DF] border border-[#DFC078] rounded-3xl p-5 sm:p-6 shadow-[0_12px_28px_-14px_rgba(92,16,22,0.18)] space-y-5',
            isAdmin ? 'md:col-span-7' : 'md:col-span-12 max-w-2xl mx-auto w-full'
          )}
        >
          {selectedUser ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-[#E6D2A3]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-[#FCE79D] via-[#E5BB54] to-[#B98321] border border-[#DFC078] flex items-center justify-center text-[#59090F] shadow-2xs shrink-0">
                    <Edit3 size={15} />
                  </div>
                  <h2 className="text-sm sm:text-base font-black uppercase tracking-wide text-[#17191E]">
                    EDITAR CADASTRO: {selectedUser.name || 'USUÁRIO'}
                  </h2>
                </div>
                {saveSuccess && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1 shadow-2xs">
                    <Check size={12} /> Salvo Automaticamente
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {/* 1. NOME DO USUÁRIO */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#292012] mb-1.5">
                    1. Nome do Usuário
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-2 w-7 h-7 rounded-full bg-[#FCF4E0] border border-[#E6D2A3] flex items-center justify-center text-[#8C6D28] pointer-events-none">
                      <User size={14} />
                    </div>
                    <input
                      type="text"
                      disabled={!isAdmin || isSelectedUserFixedAdmin}
                      value={selectedUser.name}
                      onChange={(e) => updateUserField('name', e.target.value)}
                      placeholder="Ex: Vinicius"
                      className={cn(
                        'w-full border rounded-full pl-11 pr-4 py-2.5 text-xs font-bold focus:outline-none transition-all',
                        !isAdmin || isSelectedUserFixedAdmin
                          ? 'bg-stone-50 border-stone-200 text-stone-500 cursor-not-allowed'
                          : 'bg-white border-[#DFC078] text-[#17191E] focus:border-[#9E0E17] focus:ring-2 focus:ring-[#9E0E17]/15 shadow-inner'
                      )}
                    />
                  </div>
                </div>

                {/* 2. EMAIL GOOGLE */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#292012] mb-1.5">
                    2. E-mail Google
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-2 w-7 h-7 rounded-full bg-[#FCF4E0] border border-[#E6D2A3] flex items-center justify-center text-[#8C6D28] pointer-events-none">
                      <Mail size={14} />
                    </div>
                    <input
                      type="email"
                      disabled={!isAdmin && !embedded}
                      value={selectedUser.email}
                      onChange={(e) => updateUserField('email', e.target.value)}
                      placeholder="usuario@gmail.com ou corporativo"
                      className={cn(
                        'w-full border rounded-full pl-11 pr-4 py-2.5 text-xs font-bold focus:outline-none transition-all',
                        !isAdmin
                          ? 'bg-stone-50 border-stone-200 text-stone-600 cursor-not-allowed'
                          : 'bg-white border-[#DFC078] text-[#17191E] focus:border-[#9E0E17] focus:ring-2 focus:ring-[#9E0E17]/15 shadow-inner'
                      )}
                    />
                  </div>
                  <p className="text-[11px] text-[#6B665D] mt-1.5 flex items-center gap-1.5">
                    <Info size={13} className="text-[#8C6D28] shrink-0" />
                    <span>Este deve ser o e-mail exato da Conta Google utilizada no login.</span>
                  </p>
                </div>

                {/* 3. FUNÇÃO (ADMINISTRADOR, AGENTE DE RISCO) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#292012] flex items-center gap-1.5">
                      <Shield size={13} className="text-[#B98321]" />
                      <span>3. Função</span>
                    </label>
                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-[#5B4720] flex items-center gap-1">
                      <span>{selectedUser.role === 'Administrador' ? 'Acesso Total' : 'Acesso Restrito a Páginas'}</span>
                      <Info size={12} className="text-[#8C6D28]" />
                    </span>
                  </div>

                  <div className="relative flex items-center">
                    <div className="absolute left-2 w-7 h-7 rounded-full bg-[#FCF4E0] border border-[#E6D2A3] flex items-center justify-center text-[#8C6D28] pointer-events-none">
                      <Shield size={14} />
                    </div>
                    <select
                      disabled={!isAdmin || isSelectedUserFixedAdmin}
                      value={selectedUser.role}
                      onChange={(e) => updateUserField('role', e.target.value as 'Administrador' | 'Agente de Risco')}
                      className={cn(
                        'w-full appearance-none border rounded-full pl-11 pr-10 py-2.5 text-xs font-extrabold focus:outline-none transition-all',
                        !isAdmin || isSelectedUserFixedAdmin
                          ? 'bg-stone-50 border-stone-200 text-stone-500 cursor-not-allowed'
                          : 'bg-white border-[#DFC078] text-[#17191E] focus:border-[#9E0E17] cursor-pointer shadow-inner'
                      )}
                    >
                      <option value="Administrador">Administrador</option>
                      <option value="Agente de Risco">Agente de Risco</option>
                    </select>
                    <ChevronDown size={15} className="absolute right-4 text-[#5B4720] pointer-events-none" />
                  </div>

                  <div className="mt-2.5">
                    {selectedUser.role === 'Administrador' ? (
                      <div className="p-3 rounded-2xl bg-emerald-50/90 border border-emerald-300 text-emerald-950 flex items-center gap-3 text-xs">
                        <div className="w-7 h-7 rounded-full bg-emerald-600 border border-emerald-200 text-white flex items-center justify-center shrink-0">
                          <ShieldCheck size={15} />
                        </div>
                        <div className="leading-snug">
                          <strong className="font-black uppercase text-emerald-800">Administrador:</strong> Acesso total a todas as páginas e configurações do sistema.
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-[#FFF5D9] via-[#FCEAC0] to-[#FFF5D9] border border-[#DFB042] text-[#292012] flex items-center gap-3 text-xs shadow-2xs">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-b from-[#D2212B] to-[#8E0E17] border border-[#E7C46D] text-white flex items-center justify-center shrink-0 shadow-2xs">
                          <Shield size={14} />
                        </div>
                        <div className="leading-snug">
                          <strong className="font-black uppercase text-[#7E0B13]">Agente de Risco:</strong> Acesso customizado estritamente às páginas marcadas abaixo.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* PÁGINAS PERMITIDAS PARA O AGENTE DE RISCO */}
                {selectedUser.role === 'Agente de Risco' && (
                  <div className="relative overflow-hidden rounded-3xl border border-[#DFC078] bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF8] to-[#FAF1DC] p-4 sm:p-5 shadow-[0_10px_26px_-12px_rgba(92,16,22,0.16)]">
                    {/* Detalhes sutis carmesim e dourado nos cantos */}
                    <svg
                      className="pointer-events-none absolute top-0 left-0 w-24 h-12 opacity-90"
                      viewBox="0 0 120 60"
                      fill="none"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient id="authSecTopRed" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#6E060C" />
                          <stop offset="100%" stopColor="#C81B24" />
                        </linearGradient>
                        <linearGradient id="authSecGold" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#E4BE5E" />
                          <stop offset="50%" stopColor="#FCE79D" />
                          <stop offset="100%" stopColor="#B98321" />
                        </linearGradient>
                      </defs>
                      <path d="M0 0H102C68 18 36 32 0 54V0Z" fill="url(#authSecTopRed)" />
                      <path d="M0 54C36 32 68 18 102 0H114C76 22 42 38 0 60V54Z" fill="url(#authSecGold)" />
                    </svg>

                    <svg
                      className="pointer-events-none absolute bottom-0 right-0 w-28 h-12 opacity-90"
                      viewBox="0 0 140 60"
                      fill="none"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path d="M140 60V12C104 38 66 50 18 60H140Z" fill="url(#authSecTopRed)" />
                      <path d="M140 12C104 38 66 50 18 60H4C58 46 98 30 140 2V12Z" fill="url(#authSecGold)" />
                    </svg>

                    {/* Cabeçalho */}
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#D2212B] via-[#9E0E17] to-[#68060B] border-2 border-[#E7C46D] shadow-[0_6px_14px_-4px_rgba(142,14,23,0.45),inset_0_1px_0_rgba(255,255,255,0.3)] flex items-center justify-center text-[#FCE79D] shrink-0">
                          <Shield size={20} />
                        </div>
                        <div className="w-1 h-8 rounded-full bg-gradient-to-b from-[#D2212B] to-[#7B080F] shrink-0" />
                        <div>
                          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide text-[#17191E]">
                            Páginas Autorizadas para este Agente de Risco
                          </h3>
                          <p className="text-[11px] text-[#5A564E] mt-0.5">
                            Marque as páginas que este usuário poderá visualizar e utilizar:
                          </p>
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={handleSelectAllPages}
                            className="px-4 py-2 rounded-full bg-gradient-to-b from-[#C81B24] via-[#8E0E17] to-[#560409] hover:brightness-110 text-white border-2 border-[#E7C46D] text-[11px] font-extrabold flex items-center gap-1.5 shadow-[0_5px_14px_-4px_rgba(142,14,23,0.45)] transition-all cursor-pointer active:scale-95"
                          >
                            <Check size={13} strokeWidth={2.8} />
                            <span>Marcar Todas</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleClearAllPages}
                            className="px-4 py-2 rounded-full bg-gradient-to-b from-[#FFFFFF] via-[#FFF9EC] to-[#F7E7C4] hover:brightness-98 text-[#292012] border border-[#DFC078] text-[11px] font-extrabold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
                          >
                            <Ban size={13} className="text-[#8E0E17]" />
                            <span>Desmarcar Todas</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Linha divisória metálica dourada */}
                    <div className="relative z-10 h-[1px] w-full bg-gradient-to-r from-[#DFB042]/30 via-[#DFB042] to-[#DFB042]/30 my-3.5" />

                    {(() => {
                      const allowedSet = new Set(selectedUser.allowedPages || []);
                      const authorizedPages = availablePagesList.filter((p) => allowedSet.has(p.id));
                      const blockedPages = availablePagesList.filter((p) => !allowedSet.has(p.id));

                      const renderPagePill = (page: typeof availablePagesList[number], isAllowed: boolean) => {
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
                              'px-2.5 py-2 rounded-full border transition-all flex items-center justify-between gap-2.5 select-none',
                              isAdmin && !isSelectedUserFixedAdmin ? 'cursor-pointer' : 'cursor-default',
                              isAllowed
                                ? 'border-[1.5px] border-[#C81B24]/80 bg-gradient-to-r from-[#FFF6F6] via-[#FFEBEB] to-[#FFF6F6] shadow-[0_4px_12px_-6px_rgba(142,14,23,0.28)] hover:border-[#9E0E17]'
                                : 'border-[#D4D6DC] bg-gradient-to-b from-[#FFFFFF] via-[#F7F8FA] to-[#ECEEF2] shadow-[0_2px_8px_-4px_rgba(15,23,42,0.12)] hover:border-[#B98321]/60'
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-xs',
                                  isAllowed
                                    ? 'bg-gradient-to-b from-[#D2212B] via-[#9E0E17] to-[#68060B] border-2 border-[#E7C46D] text-white'
                                    : 'bg-gradient-to-b from-[#FFFFFF] via-[#E9ECEF] to-[#CFD4DC] border-[#B8BFC9] text-[#5A606B]'
                                )}
                              >
                                <IconComp size={14} />
                              </div>
                              <p
                                className={cn(
                                  'text-xs truncate leading-tight',
                                  isAllowed ? 'font-extrabold text-[#17191E]' : 'font-bold text-[#2F333B]'
                                )}
                              >
                                {page.label}
                              </p>
                            </div>

                            <span
                              className={cn(
                                'px-3 py-1 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider border shrink-0 flex items-center gap-1 shadow-2xs',
                                isAllowed
                                  ? 'bg-gradient-to-b from-[#C81B24] via-[#8E0E17] to-[#5E050A] border-[#E7C46D]/70 text-white'
                                  : 'bg-gradient-to-b from-[#E9ECEF] to-[#D6DBE2] border-[#C4C9D2] text-[#4E545F]'
                              )}
                            >
                              {isAllowed ? (
                                <>
                                  <Check size={10} strokeWidth={3} />
                                  <span>AUTORIZADA</span>
                                </>
                              ) : (
                                <>
                                  <Lock size={10} />
                                  <span>BLOQUEADA</span>
                                </>
                              )}
                            </span>
                          </div>
                        );
                      };

                      return (
                        <div className="relative z-10 space-y-3.5">
                          {/* GRUPO 1: TODAS AS AUTORIZADAS AGRUPADAS */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2 px-1">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#B81620]" />
                                <span className="text-[10.5px] font-black uppercase tracking-wider text-[#7E0B13]">
                                  Autorizadas para {selectedUser.name || 'este usuário'} ({authorizedPages.length})
                                </span>
                              </div>
                              {isAdmin && authorizedPages.length > 0 && (
                                <span className="text-[10px] font-semibold text-[#6B665D]">
                                  Clique para bloquear
                                </span>
                              )}
                            </div>

                            {authorizedPages.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {authorizedPages.map((page) => renderPagePill(page, true))}
                              </div>
                            ) : (
                              <p className="text-xs text-[#6B665D] font-medium px-2 py-1">
                                Nenhuma página autorizada ainda. Selecione abaixo para liberar.
                              </p>
                            )}
                          </div>

                          {/* GRUPO 2: BLOQUEADAS */}
                          <div className="space-y-2 pt-2 border-t border-[#E6D2A3]/70">
                            <div className="flex items-center justify-between gap-2 px-1">
                              <div className="flex items-center gap-2">
                                <Lock size={11} className="text-[#6B665D]" />
                                <span className="text-[10.5px] font-black uppercase tracking-wider text-[#5A564E]">
                                  Bloqueadas / Disponíveis ({blockedPages.length})
                                </span>
                              </div>
                              {isAdmin && blockedPages.length > 0 && (
                                <span className="text-[10px] font-semibold text-[#6B665D]">
                                  Clique para autorizar
                                </span>
                              )}
                            </div>

                            {blockedPages.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {blockedPages.map((page) => renderPagePill(page, false))}
                              </div>
                            ) : (
                              <p className="text-xs text-[#6B665D] font-medium px-2 py-1">
                                Todas as páginas disponíveis já estão autorizadas para este usuário.
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#E6D2A3] flex items-center justify-between">
                <div className="text-[11px] font-mono font-semibold text-[#6B665D]">
                  ID Cadastral: #{selectedUser.id}
                </div>
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className={cn(
                    'px-5 py-2.5 rounded-full text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95 border-2 disabled:opacity-75',
                    savedButton
                      ? 'bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700 text-white border-emerald-300 shadow-[0_8px_20px_-6px_rgba(16,185,129,0.55)]'
                      : 'bg-gradient-to-b from-[#D2212B] via-[#9E0E17] to-[#68060B] hover:brightness-110 text-white border-[#E7C46D]'
                  )}
                >
                  {savedButton ? (
                    <>
                      <Check size={15} className="text-white stroke-[2.5]" />
                      <span>Salvo</span>
                    </>
                  ) : (
                    <>
                      <Save size={15} className="text-[#FCE79D]" />
                      <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-[#6B665D]">
              <Users size={32} className="mx-auto mb-2 text-stone-300" />
              <p className="text-sm font-bold">Nenhum usuário selecionado</p>
              <p className="text-xs">Selecione um usuário à esquerda ou clique em "Novo Usuário".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!isAdmin) {
    return (
      <div className="min-h-full bg-[#F9F8F6] text-[#17191E] p-8 flex items-center justify-center select-none font-sans">
        <div className="max-w-md w-full bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF8] to-[#FAF1DC] border border-[#DFC078] rounded-3xl p-8 shadow-sm text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#D2212B] via-[#9E0E17] to-[#68060B] border-2 border-[#E7C46D] text-[#FFF5D6] flex items-center justify-center mb-4 shadow-sm">
            <Lock size={28} />
          </div>
          <h2 className="text-lg font-black text-[#17191E] uppercase mb-2">Acesso Restrito ao Administrador</h2>
          <p className="text-xs text-[#6B665D] leading-relaxed mb-6">
            Somente o Administrador pode visualizar informações relacionadas a páginas, e-mails e funções.
          </p>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-full bg-gradient-to-b from-[#C81B24] via-[#8E0E17] to-[#560409] text-white text-xs font-extrabold uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer border-2 border-[#E7C46D]"
            >
              Voltar ao Início
            </button>
          )}
        </div>
      </div>
    );
  }

  if (embedded) {
    return content;
  }

  return (
    <div className="min-h-full bg-[#F9F8F6] text-[#17191E] p-4 sm:p-6 lg:p-8 select-none font-sans">
      <div className="max-w-7xl mx-auto">
        {content}
      </div>
    </div>
  );
}
