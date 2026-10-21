import React, { useState } from 'react';
import { 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  LogOut, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { rtdb } from '../firebase';
import { ref, set } from 'firebase/database';
import goldMedalLogo from '../assets/images/gold_logo_medal_3c_1790406432555.jpg';

interface ChangePasswordModalProps {
  currentUser: {
    email: string;
    name: string;
    role: string;
    roleLabel?: string;
    allowedPages?: string[];
    mustChangePassword?: boolean;
  };
  onPasswordChanged: (newPassword: string) => void;
  onLogout: () => void;
}

export default function ChangePasswordModal({
  currentUser,
  onPasswordChanged,
  onLogout
}: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanNew) {
      setError('Por favor, informe a nova senha.');
      return;
    }

    if (cleanNew.length < 3) {
      setError('A nova senha deve ter no mínimo 3 caracteres.');
      return;
    }

    if (cleanNew === '123') {
      setError('A nova senha deve ser diferente da senha padrão temporária (123). Crie uma senha segura.');
      return;
    }

    if (cleanNew !== cleanConfirm) {
      setError('As senhas não coincidem. Digite a mesma senha nos dois campos.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Atualizar a lista de usuários em app_users no localStorage e Firebase RTDB
      const rawUsers = localStorage.getItem('app_users');
      let usersList: any[] = [];
      if (rawUsers) {
        try {
          usersList = JSON.parse(rawUsers);
        } catch {}
      }

      const myEmail = (currentUser.email || '').trim().toLowerCase();
      const myName = (currentUser.name || '').trim().toLowerCase();

      const userIndex = usersList.findIndex((u: any) => 
        String(u.name || '').trim().toLowerCase() === myName || 
        String(u.email || '').trim().toLowerCase() === myEmail
      );

      if (userIndex !== -1) {
        usersList[userIndex] = {
          ...usersList[userIndex],
          password: cleanNew,
          mustChangePassword: false,
          allowedPages: Array.isArray(usersList[userIndex].allowedPages) 
            ? usersList[userIndex].allowedPages 
            : (Array.isArray(currentUser.allowedPages) ? currentUser.allowedPages : [])
        };
      } else {
        // Se não encontrou por nome/email exato, adiciona ou atualiza pelo nome atual
        usersList.push({
          id: Date.now(),
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role === 'admin' ? 'Administrador' : 'Agente de Risco',
          password: cleanNew,
          mustChangePassword: false,
          allowedPages: Array.isArray(currentUser.allowedPages) ? currentUser.allowedPages : []
        });
      }

      // Sanitizar dados para o Firebase RTDB garantindo que não haja campos undefined
      const sanitizedUsers = usersList.map((u: any) => ({
        id: Number(u.id) || Date.now(),
        name: String(u.name || '').trim(),
        role: u.role === 'Administrador' ? 'Administrador' : 'Agente de Risco',
        email: String(u.email || '').trim(),
        password: String(u.password || cleanNew),
        mustChangePassword: Boolean(u.mustChangePassword),
        allowedPages: Array.isArray(u.allowedPages) ? u.allowedPages : []
      }));

      // Salvar no localStorage
      localStorage.setItem('app_users', JSON.stringify(sanitizedUsers));

      // Salvar no Firebase RTDB (sem nenhum undefined)
      try {
        set(ref(rtdb, 'app_users'), JSON.parse(JSON.stringify(sanitizedUsers)));
      } catch (err) {
        console.error('Erro ao sincronizar nova senha com Firebase:', err);
      }

      // 2. Atualizar o objeto logged_user no localStorage
      const updatedLoggedUser = {
        ...currentUser,
        mustChangePassword: false
      };
      localStorage.setItem('logged_user', JSON.stringify(updatedLoggedUser));

      // 3. Notificar o callback de conclusão
      onPasswordChanged(cleanNew);
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao salvar a nova senha. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050608]/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="w-full max-w-md bg-[#FFFCF6] border-2 border-[#D9C39B] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative animate-fade-in text-[#25231F]">
        
        {/* TOP BRANDING & BADGE */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d41a22] to-[#7f0b12] border-2 border-[#D9C39B] flex items-center justify-center text-white shadow-md mb-3">
            <KeyRound size={26} className="text-[#FAF5EB]" />
          </div>

          <span className="px-3 py-1 rounded-full bg-amber-100 text-[#8C6D28] border border-amber-300 text-[10px] font-mono font-black uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#C49A45]" />
            <span>Primeiro Acesso ao Sistema</span>
          </span>

          <h2 className="text-xl font-black uppercase tracking-tight text-[#25231F] mt-1">
            Cadastrar Nova Senha
          </h2>

          <p className="text-xs text-[#77736B] mt-2 leading-relaxed">
            Olá, <strong className="text-[#25231F] font-bold">{currentUser.name}</strong>! A sua conta foi criada com a senha temporária padrão <span className="font-mono font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">123</span>. Para sua segurança no primeiro login, cadastre a sua nova senha pessoal abaixo:
          </p>
        </div>

        {/* FEEDBACK ERROR */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 text-red-800 border border-red-300 text-xs font-bold flex items-start gap-2.5 shadow-xs">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* FORM - ONLY PASSWORD */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NOVA SENHA */}
          <div>
            <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-[#77736B] mb-1.5 flex items-center gap-1.5">
              <Lock size={13} className="text-[#C49A45]" />
              <span>Nova Senha</span>
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
                autoFocus
                className="w-full bg-white border border-[#E6D2A3] rounded-2xl pl-4 pr-11 py-3 text-xs font-mono font-bold text-[#25231F] placeholder:text-stone-400 focus:outline-none focus:border-[#C49A45] focus:ring-2 focus:ring-[#C49A45]/20 transition-all shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#25231F] cursor-pointer"
                title={showNewPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* CONFIRMAR NOVA SENHA */}
          <div>
            <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-[#77736B] mb-1.5 flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-[#C49A45]" />
              <span>Confirmar Nova Senha</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha para confirmar"
                className="w-full bg-white border border-[#E6D2A3] rounded-2xl pl-4 pr-11 py-3 text-xs font-mono font-bold text-[#25231F] placeholder:text-stone-400 focus:outline-none focus:border-[#C49A45] focus:ring-2 focus:ring-[#C49A45]/20 transition-all shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#25231F] cursor-pointer"
                title={showConfirmPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#D8B065] via-[#C59B48] to-[#AA7E2F] hover:brightness-105 active:scale-[0.99] text-white font-black uppercase text-xs tracking-wider shadow-[0_6px_20px_rgba(196,154,69,0.38)] flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#FFF5DB]/40"
            >
              <Check size={16} />
              <span>{isSubmitting ? 'Salvando Senha...' : 'Salvar Nova Senha & Acessar'}</span>
            </button>
          </div>
        </form>

        {/* LOGOUT OPTION */}
        <div className="pt-2 border-t border-[#E6D2A3]/60 text-center">
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-red-700 transition-colors cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sair e trocar mais tarde</span>
          </button>
        </div>

      </div>
    </div>
  );
}
