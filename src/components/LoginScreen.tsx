import React, { useState } from 'react';
import { 
  User, 
  Key, 
  ArrowRight, 
  AlertCircle,
  Eye,
  EyeOff,
  Globe,
  Mail,
  Lock,
  ShieldCheck
} from 'lucide-react';
import luxuryLounge360 from '../assets/images/tres_coracoes_luxury_lounge_360_1791988294363.jpg';
import Wallpaper360Viewer from './common/Wallpaper360Viewer';

import { auth, rtdb } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { ref, onValue, set } from 'firebase/database';

interface LoginScreenProps {
  onLoginSuccess: (user: { email: string; name: string; role: string }) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWallpaperModal, setShowWallpaperModal] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('app_users');
      if (saved) {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {}
    return [
      { id: 1, name: 'Administrador Principal', role: 'Administrador', email: 'panenosistemab13@gmail.com' },
      { id: 2, name: 'jefferson', role: 'Administrador', email: 'jefferson@3coracoes.com.br' },
      { id: 3, name: 'Operador Logístico', role: 'Agente de Risco', email: 'operador@3coracoes.com.br' }
    ];
  });

  React.useEffect(() => {
    const usersRef = ref(rtdb, 'app_users');
    const unsub = onValue(usersRef, (snapshot) => {
      const val = snapshot.val();
      if (val && Array.isArray(val)) {
        setRegisteredUsers(val);
        localStorage.setItem('app_users', JSON.stringify(val));
      }
    });
    return () => unsub();
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      const googleEmail = (googleUser.email || '').trim().toLowerCase();
      const googleName = googleUser.displayName || googleEmail.split('@')[0] || 'Usuário';

      if (!googleEmail) {
        setError('Não foi possível obter o e-mail da sua conta Google.');
        setLoading(false);
        return;
      }

      const currentList = registeredUsers.length > 0 
        ? registeredUsers 
        : JSON.parse(localStorage.getItem('app_users') || '[]');

      let matchedUser = currentList.find((u: any) => {
        const uEmail = String(u.email || '').trim().toLowerCase();
        return uEmail === googleEmail;
      });

      // Se o usuário não estiver na lista, auto-registramos como Administrador se for panenosistemab13 ou jefferson, ou como Agente de Risco / Administrador
      const isRootAdmin = googleEmail === 'panenosistemab13@gmail.com' || googleEmail === 'jefferson@3coracoes.com.br';

      if (!matchedUser) {
        const newUser = {
          id: Date.now(),
          name: googleName,
          role: isRootAdmin ? 'Administrador' : 'Agente de Risco',
          email: googleEmail,
          allowedPages: isRootAdmin ? [] : ['checklist', 'averbacao', 'sm_creator', 'iscas', 'controle', 'disponibilidade', 'escala']
        };
        const updatedList = [...currentList, newUser];
        setRegisteredUsers(updatedList);
        localStorage.setItem('app_users', JSON.stringify(updatedList));
        try {
          set(ref(rtdb, 'app_users'), updatedList);
        } catch (e) {
          console.error(e);
        }
        matchedUser = newUser;
      }

      const roleStr = matchedUser?.role || (isRootAdmin ? 'Administrador' : 'Agente de Risco');
      const isUserAdmin = roleStr === 'Administrador' || isRootAdmin;

      const userData = {
        email: googleEmail,
        name: matchedUser?.name || googleName,
        role: isUserAdmin ? 'admin' : 'agente_de_risco',
        roleLabel: isUserAdmin ? 'Administrador' : 'Agente de Risco',
        allowedPages: Array.isArray(matchedUser?.allowedPages) ? matchedUser.allowedPages : []
      };

      localStorage.setItem('logged_user', JSON.stringify(userData));
      localStorage.setItem('user_email', userData.email);
      onLoginSuccess(userData);
    } catch (e: any) {
      if (e.code === 'auth/popup-closed-by-user') {
        setError('Login com Google cancelado pelo usuário.');
      } else {
        setError('Erro ao autenticar com a Conta Google. Tente novamente.');
      }
      setLoading(false);
    }
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

      <div className="w-full max-w-md bg-[#0a0c0f]/85 border border-[#C5A059]/30 rounded-3xl shadow-[0_25px_50px_rgba(0,0,0,0.9)] p-10 md:p-12 relative z-10 text-[#F3F6F8] backdrop-blur-3xl text-center">
        
        {/* Brand Header */}
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
          <p className="text-xs text-stone-400 font-mono mt-1">
            Autenticação Segura via Conta Google
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-950/80 border border-red-500/50 text-red-200 px-4 py-3 rounded-2xl text-xs font-mono flex items-start gap-3 shadow-md text-left">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-bold">
              {error}
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-[#172231]/60 border border-[#D6A84F]/30 text-xs text-stone-300 font-mono text-left space-y-2">
            <div className="flex items-center gap-2 text-[#D6A84F] font-bold">
              <ShieldCheck size={16} />
              <span>Acesso Verificado por E-mail</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              O sistema identifica automaticamente o seu acesso utilizando a mesma conta Google. Se o e-mail não estiver cadastrado, ele será registrado automaticamente.
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#D6A84F] via-[#c5953e] to-[#b08030] hover:brightness-110 text-[#090a0c] font-black py-4 px-6 rounded-xl shadow-[0_4px_20px_rgba(214,168,79,0.4)] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs cursor-pointer disabled:opacity-50 active:scale-[0.99]"
          >
            {loading ? (
              <span className="flex items-center gap-2 font-mono">
                <span className="w-4 h-4 border-2 border-[#090a0c] border-t-transparent rounded-full animate-spin" />
                Autenticando com Google...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Entrar com Conta Google</span>
              </>
            )}
          </button>
        </div>

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
