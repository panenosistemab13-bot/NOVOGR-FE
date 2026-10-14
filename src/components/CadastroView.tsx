import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import { rtdb } from '../firebase';
import { ref, onValue, set } from 'firebase/database';

export interface UserAccount {
  id: number;
  name: string;
  role: 'Administrador' | 'Funcionario';
  email: string;
  password: string;
}

export const FIXED_ADMIN_USER: UserAccount = {
  id: 1,
  name: 'jefferson',
  role: 'Administrador',
  email: 'jefferson@3coracoes.com.br',
  password: '#trescafe2029'
};

const DEFAULT_USERS: UserAccount[] = [
  FIXED_ADMIN_USER,
  { 
    id: 2, 
    name: 'Operador Logístico', 
    role: 'Funcionario', 
    email: 'operador@3coracoes.com.br', 
    password: 'password' 
  }
];

const sanitizeUsers = (userList: any[]): UserAccount[] => {
  if (!Array.isArray(userList)) return DEFAULT_USERS;
  // Filtrar usuários inválidos e remover login legado "jeff"
  const cleaned: UserAccount[] = userList.filter((u: any) => u && u.name && String(u.name).trim().toLowerCase() !== 'jeff');
  
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
      password: '#trescafe2029'
    };
  }

  return cleaned.length > 0 ? cleaned : DEFAULT_USERS;
};

interface CadastroViewProps {
  onBack?: () => void;
}

export default function CadastroView({ onBack }: CadastroViewProps) {
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

  const [selectedUserId, setSelectedUserId] = useState<number>(() => users[0]?.id || 1);
  const [showPassword, setShowPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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
        // Inicializar com usuários padrão no Firebase se vazio
        set(usersRef, users);
      }
    });

    return () => unsubscribe();
  }, []);

  const saveToStorageAndFirebase = (newUsers: UserAccount[]) => {
    const cleaned = sanitizeUsers(newUsers);
    setUsers(cleaned);
    localStorage.setItem('app_users', JSON.stringify(cleaned));
    try {
      set(ref(rtdb, 'app_users'), cleaned);
    } catch (e) {
      console.error('Erro ao sincronizar com Firebase:', e);
    }
  };

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0];

  const updateUserField = (field: keyof UserAccount, value: string) => {
    if (!selectedUser) return;
    const updated = users.map(u => u.id === selectedUserId ? { ...u, [field]: value } : u);
    saveToStorageAndFirebase(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAddUser = () => {
    const newUser: UserAccount = {
      id: Date.now(),
      name: `Novo Usuário ${users.length + 1}`,
      role: 'Funcionario',
      email: `usuario${users.length + 1}@3coracoes.com.br`,
      password: 'password'
    };
    const updated = [...users, newUser];
    saveToStorageAndFirebase(updated);
    setSelectedUserId(newUser.id);
    setFeedbackMsg({ text: 'Novo usuário adicionado. Configure os dados ao lado.', type: 'success' });
    setTimeout(() => setFeedbackMsg(null), 3000);
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

  return (
    <div className="min-h-full bg-[#F5F0E6] text-[#25231F] p-4 sm:p-6 lg:p-8 select-none font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER BAR */}
        <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#25231F] border border-[#E6D2A3] transition-colors"
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
                <h1 className="text-xl sm:text-2xl font-black text-[#25231F] tracking-tight font-heading">
                  CADASTRO DE USUÁRIOS
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-[#8C6D28] border border-amber-300 text-[10px] font-mono font-bold uppercase">
                  Controle de Acessos
                </span>
              </div>
              <p className="text-xs text-[#77736B] font-mono uppercase tracking-wider mt-0.5">
                Gerencie credenciais e senhas válidas para login no sistema
              </p>
            </div>
          </div>

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
        </div>

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

          {/* LEFT: USERS LIST */}
          <div className="md:col-span-5 bg-[#FFFCF6] border border-[#E6D2A3] rounded-3xl p-5 shadow-sm space-y-3 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6D2A3]">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-[#C49A45]" />
                <h2 className="text-xs font-black uppercase tracking-wider text-[#25231F]">
                  Usuários Autorizados ({users.length})
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#77736B] font-bold">
                Somente estes acessam
              </span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1">
              {users.map((u) => {
                const isSelected = selectedUserId === u.id;
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
                        <Users size={16} />
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
                            u.role === 'Administrador'
                              ? 'bg-amber-100 text-[#8C6D28] border border-amber-300'
                              : 'bg-stone-100 text-stone-700 border border-stone-200'
                          }`}>
                            {u.role}
                          </span>
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
              <Sparkles size={14} className="shrink-0 mt-0.5 text-amber-600" />
              <span>
                Usuário "jefferson" cadastrado como administrativo fixo do sistema.
              </span>
            </div>
          </div>

          {/* RIGHT: EDIT FORM */}
          <div className="md:col-span-7 bg-[#FFFCF6] border border-[#E6D2A3] rounded-3xl p-6 shadow-sm space-y-5">
            {selectedUser ? (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-[#E6D2A3]">
                  <div className="flex items-center gap-2.5">
                    <UserCheck size={18} className="text-[#C49A45]" />
                    <h2 className="text-sm font-black uppercase tracking-wider text-[#25231F]">
                      Editar Cadastro: {selectedUser.name}
                    </h2>
                  </div>
                  {saveSuccess && (
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-300 flex items-center gap-1">
                      <Check size={12} /> Salvo
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* NOME / LOGIN */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#77736B] mb-1.5">
                      Nome / Usuário de Login
                    </label>
                    <div className="relative">
                      <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        value={selectedUser.name}
                        onChange={(e) => updateUserField('name', e.target.value)}
                        placeholder="Ex: João Silva"
                        className="w-full bg-white border border-[#E6D2A3] rounded-xl pl-10 pr-3 py-2.5 text-xs font-bold text-[#25231F] focus:outline-none focus:border-[#C49A45]"
                      />
                    </div>
                  </div>

                  {/* CARGO / PERFIL */}
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#77736B] mb-1.5">
                      Perfil de Acesso
                    </label>
                    <select
                      value={selectedUser.role}
                      onChange={(e) => updateUserField('role', e.target.value)}
                      className="w-full bg-white border border-[#E6D2A3] rounded-xl px-3 py-2.5 text-xs font-bold text-[#25231F] focus:outline-none focus:border-[#C49A45]"
                    >
                      <option value="Administrador">Administrador</option>
                      <option value="Funcionario">Funcionário</option>
                    </select>
                  </div>

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
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#77736B] mb-1.5">
                      Senha de Acesso
                    </label>
                    <div className="relative">
                      <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={selectedUser.password}
                        onChange={(e) => updateUserField('password', e.target.value)}
                        placeholder="Digite a senha"
                        className="w-full bg-white border border-[#E6D2A3] rounded-xl pl-10 pr-10 py-2.5 text-xs font-mono font-bold text-[#25231F] focus:outline-none focus:border-[#C49A45]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#25231F]"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
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
                      className="px-5 py-2.5 rounded-xl bg-[#292820] hover:bg-black text-[#FAF7F0] border border-[#D9C39B] text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer"
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
    </div>
  );
}
