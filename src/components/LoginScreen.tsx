import React, { useState } from 'react';
import { 
  User, 
  Key, 
  ArrowRight, 
  AlertCircle,
  Eye,
  EyeOff,
  Globe
} from 'lucide-react';
import goldMedalLogo from '../assets/images/gold_logo_medal_3c_1790406432555.jpg';
import luxuryLounge360 from '../assets/images/tres_coracoes_luxury_lounge_360_1791988294363.jpg';
import Wallpaper360Viewer from './common/Wallpaper360Viewer';

import { rtdb } from '../firebase';
import { ref, onValue } from 'firebase/database';

interface LoginScreenProps {
  onLoginSuccess: (user: { email: string; name: string; role: string }) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWallpaperModal, setShowWallpaperModal] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('app_users');
      if (saved) {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remover login antigo "jeff"
          parsed = parsed.filter(u => String(u?.name || '').trim().toLowerCase() !== 'jeff');
          const hasJeff = parsed.some(u => String(u?.name || '').trim().toLowerCase() === 'jefferson');
          if (!hasJeff) {
            parsed.unshift({ id: 1, name: 'jefferson', role: 'Administrador', email: 'jefferson@3coracoes.com.br', password: '#trescafe2029' });
          } else {
            const idx = parsed.findIndex(u => String(u?.name || '').trim().toLowerCase() === 'jefferson');
            if (idx !== -1) {
              parsed[idx] = {
                ...parsed[idx],
                name: 'jefferson',
                role: 'Administrador',
                email: parsed[idx].email || 'jefferson@3coracoes.com.br',
                password: '#trescafe2029'
              };
            }
          }
          localStorage.setItem('app_users', JSON.stringify(parsed));
          return parsed;
        }
      }
    } catch {}
    return [
      { id: 1, name: 'jefferson', role: 'Administrador', email: 'jefferson@3coracoes.com.br', password: '#trescafe2029' }
    ];
  });

  // Sincronizar usuários autorizados em tempo real com Firebase RTDB
  React.useEffect(() => {
    const usersRef = ref(rtdb, 'app_users');
    const unsub = onValue(usersRef, (snapshot) => {
      const val = snapshot.val();
      if (val && Array.isArray(val)) {
        // Limpar qualquer "jeff" e garantir o admin fixo jefferson
        const filtered = val.filter(u => String(u?.name || '').trim().toLowerCase() !== 'jeff');
        const hasJeff = filtered.some(u => String(u?.name || '').trim().toLowerCase() === 'jefferson');
        const list = hasJeff 
          ? filtered.map(u => String(u?.name || '').trim().toLowerCase() === 'jefferson' 
              ? { ...u, name: 'jefferson', role: 'Administrador', password: '#trescafe2029' } 
              : u)
          : [{ id: 1, name: 'jefferson', role: 'Administrador', email: 'jefferson@3coracoes.com.br', password: '#trescafe2029' }, ...filtered];
        setRegisteredUsers(list);
        localStorage.setItem('app_users', JSON.stringify(list));
      }
    });
    return () => unsub();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const cleanUser = username.trim().toLowerCase();
      const cleanPass = password.trim();

      // Bloqueio explícito do login "jeff" antigo solicitado pelo usuário
      if (cleanUser === 'jeff') {
        setError('Login "jeff" foi desativado. Utilize o usuário fixo "jefferson" ou os usuários cadastrados.');
        setLoading(false);
        return;
      }

      // Verificação direta do usuário administrativo fixo jefferson
      if ((cleanUser === 'jefferson' || cleanUser === 'jefferson@3coracoes.com.br') && cleanPass === '#trescafe2029') {
        const adminData = {
          email: 'jefferson@3coracoes.com.br',
          name: 'jefferson',
          role: 'admin',
          roleLabel: 'Administrador'
        };
        localStorage.setItem('logged_user', JSON.stringify(adminData));
        localStorage.setItem('user_email', adminData.email);
        onLoginSuccess(adminData);
        return;
      }

      // Buscar na lista de usuários cadastrados
      const currentList = registeredUsers.length > 0 
        ? registeredUsers 
        : JSON.parse(localStorage.getItem('app_users') || '[]');

      const user = currentList.find((u: any) => {
        const uName = String(u.name || '').trim().toLowerCase();
        const uEmail = String(u.email || '').trim().toLowerCase();
        return (uName === cleanUser || uEmail === cleanUser) && u.password === cleanPass;
      });

      if (user) {
        const isUserAdmin = user.role === 'Administrador' || String(user.name).trim().toLowerCase() === 'jefferson';
        const requiresPasswordChange = isUserAdmin && String(user.name).trim().toLowerCase() === 'jefferson'
          ? false
          : (user.mustChangePassword === true || String(user.password).trim() === '123');

        const userData = {
          email: user.email || `${cleanUser}@3coracoes.com.br`,
          name: user.name,
          role: isUserAdmin ? 'admin' : 'agente_de_risco',
          roleLabel: isUserAdmin ? 'Administrador' : 'Agente de Risco',
          allowedPages: isUserAdmin ? undefined : (user.allowedPages || ['checklist', 'averbacao', 'sm_creator', 'iscas', 'controle', 'disponibilidade', 'escala']),
          mustChangePassword: requiresPasswordChange
        };
        localStorage.setItem('logged_user', JSON.stringify(userData));
        localStorage.setItem('user_email', userData.email);
        onLoginSuccess(userData);
      } else {
        setError('Usuário ou senha inválidos. Apenas usuários cadastrados no módulo Cadastro têm acesso.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050608] overflow-y-auto select-none font-sans"
      style={{
        backgroundImage: `linear-gradient(rgba(5, 6, 8, 0.85), rgba(5, 6, 8, 0.95)), url(${luxuryLounge360})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* 360° 8K Wallpaper Trigger Button (Top Right) */}
      <div className="absolute top-8 right-8 z-20">
        <button
          onClick={() => setShowWallpaperModal(true)}
          className="flex items-center gap-3 px-6 py-3 rounded-full bg-[#0a0c0f]/90 hover:bg-[#15181c] text-[#FAF7F0] border border-[#C5A059]/50 shadow-[0_4px_30px_rgba(0,0,0,0.7)] transition-all cursor-pointer backdrop-blur-xl text-sm font-sans font-semibold uppercase tracking-widest"
          title="Visualizar Papel de Parede 8K 360°"
        >
          <Globe size={18} className="text-[#C5A059]" />
          <span>Experiência 360°</span>
        </button>
      </div>

      <div className="w-full max-w-sm bg-[#0a0c0f]/80 border border-white/5 rounded-3xl shadow-[0_25px_50px_rgba(0,0,0,0.9)] p-10 md:p-12 relative z-10 text-[#F3F6F8] backdrop-blur-3xl">
        
        {/* Brand Header matching reference image */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full p-0.5 bg-[#172231] border border-[#D6A84F] flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-[#D6A84F]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <div className="text-left">
              <div className="text-xs font-serif italic text-[#D6A84F]">Café</div>
              <div className="text-xl font-serif font-bold text-[#F3F6F8] tracking-wide">Três Corações</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-950/80 border border-red-500/50 text-red-200 px-4 py-3 rounded-2xl text-xs font-mono flex items-start gap-3 shadow-md">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-bold">
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D6A84F]" />
              <input 
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuário"
                className="w-full bg-[#172231]/90 border border-[#D6A84F]/40 focus:border-[#D6A84F] rounded-xl pl-11 pr-4 py-3.5 text-xs font-mono text-[#F3F6F8] placeholder-[#94A3B8] focus:outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D6A84F]" />
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                className="w-full bg-[#172231]/90 border border-[#D6A84F]/40 focus:border-[#D6A84F] rounded-xl pl-11 pr-12 py-3.5 text-xs font-mono text-[#F3F6F8] placeholder-[#94A3B8] focus:outline-none transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#D6A84F] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#D6A84F] via-[#c5953e] to-[#b08030] hover:brightness-110 text-[#090a0c] font-black py-4 px-6 rounded-xl shadow-[0_4px_20px_rgba(214,168,79,0.4)] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs cursor-pointer disabled:opacity-50 mt-4"
          >
            {loading ? (
              <span className="flex items-center gap-2 font-mono">
                <span className="w-4 h-4 border-2 border-[#090a0c] border-t-transparent rounded-full animate-spin" />
                Autenticando...
              </span>
            ) : (
              <span>ENTRAR</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-white/10 text-center">
          <p className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider">
            Sistema de Logística e Telemetria
          </p>
        </div>

      </div>

      {/* 360° Immersive 8K Wallpaper Viewer Modal */}
      {showWallpaperModal && (
        <Wallpaper360Viewer
          imageUrl={luxuryLounge360}
          onClose={() => setShowWallpaperModal(false)}
        />
      )}
    </div>
  );
}
