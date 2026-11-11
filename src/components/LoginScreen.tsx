import React, { useState } from 'react';
import { 
  AlertCircle,
  ArrowRight,
  Lock
} from 'lucide-react';
import brazilIntelligenceBg from '../assets/images/brazil_intelligence_bg_1794359792078.jpg';

import { auth, rtdb } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';

interface LoginScreenProps {
  onLoginSuccess: (user: { email: string; name: string; role: string }) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
        await signOut(auth);
        setError('Não foi possível obter o e-mail da sua conta Google.');
        setLoading(false);
        return;
      }

      const currentList = registeredUsers.length > 0 
        ? registeredUsers 
        : JSON.parse(localStorage.getItem('app_users') || '[]');

      const matchedUser = currentList.find((u: any) => {
        const uEmail = String(u.email || '').trim().toLowerCase();
        return uEmail === googleEmail;
      });

      const isRootAdmin = googleEmail === 'panenosistemab13@gmail.com' || googleEmail === 'jefferson@3coracoes.com.br';

      // REQUISITO DE SEGURANÇA: Bloquear rigorosamente usuários não cadastrados
      if (!matchedUser && !isRootAdmin) {
        await signOut(auth);
        setError(`Acesso negado: O e-mail "${googleEmail}" não está cadastrado na aba Cadastro do sistema. Usuários não cadastrados não possuem autorização para acessar o aplicativo.`);
        setLoading(false);
        return;
      }

      const roleStr = matchedUser?.role || (isRootAdmin ? 'Administrador' : 'Agente de Risco');
      const isUserAdmin = roleStr === 'Administrador' || isRootAdmin;

      const userData = {
        email: googleEmail,
        name: matchedUser?.name || googleName,
        role: isUserAdmin ? 'admin' : 'agente_de_risco',
        roleLabel: isUserAdmin ? 'Administrador' : 'Agente de Risco',
        allowedPages: Array.isArray(matchedUser?.allowedPages) ? matchedUser.allowedPages : (isUserAdmin ? [] : ['checklist', 'averbacao', 'sm_creator', 'iscas', 'controle', 'disponibilidade', 'escala'])
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
      className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden font-sans select-none"
      style={{
        background: '#05080C',
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(16, 25, 35, 0.4) 0%, rgba(5, 8, 12, 0.88) 100%), url(${brazilIntelligenceBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Tactical HUD Glows & Overlay Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,194,71,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,194,71,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#FFC247]/15 via-transparent to-transparent blur-[140px] pointer-events-none" />

      {/* Central Glassmorphism Intelligence Card */}
      <div className="relative z-10 w-full max-w-[460px] p-[44px_42px] bg-[#05080C]/90 border border-[#FFC247]/35 rounded-[26px] shadow-[0_30px_90px_rgba(0,0,0,0.9)] text-[#F5F5F5] backdrop-blur-2xl ring-1 ring-[#C8102E]/30">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-3 w-full">
            {/* Official Logo Emblem with SVG precision */}
            <div className="w-[88px] h-[88px] rounded-full bg-gradient-to-br from-[#C8102E] via-[#aa0c24] to-[#7f091c] border-2 border-[#FFC247] flex items-center justify-center shadow-[0_0_35px_rgba(255,194,71,0.5)] shrink-0 ring-2 ring-[#FFC247]/30 relative overflow-hidden p-1.5">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <path id="textPath" d="M 15 72 A 38 38 0 0 0 85 72" />
                </defs>
                {/* 3 Golden Hearts / Circles */}
                <circle cx="38" cy="35" r="13" fill="#FFC247" />
                <text x="38" y="39" fontSize="10" textAnchor="middle" fill="#05080C" fontWeight="bold">♥</text>
                
                <circle cx="62" cy="35" r="13" fill="#FFC247" />
                <text x="62" y="39" fontSize="10" textAnchor="middle" fill="#05080C" fontWeight="bold">♥</text>
                
                <circle cx="50" cy="55" r="13" fill="#FFC247" />
                <text x="50" y="59" fontSize="10" textAnchor="middle" fill="#05080C" fontWeight="bold">♥</text>

                {/* Curved Text 3 CORAÇÕES */}
                <text fontSize="11.5" fontWeight="bold" fill="#FFFFFF" letterSpacing="1.5">
                  <textPath href="#textPath" startOffset="50%" textAnchor="middle">
                    3 CORAÇÕES
                  </textPath>
                </text>
              </svg>
            </div>

            <div className="h-12 w-px bg-gradient-to-b from-transparent via-[#FFC247]/60 to-transparent mx-1" />

            <div className="text-left flex flex-col justify-center">
              <div className="text-[13px] font-serif italic text-[#FFC247] font-medium">Café</div>
              <div className="text-2xl font-serif font-extrabold text-[#F5F5F5] tracking-wide leading-tight">Três Corações</div>
            </div>
          </div>

          <p className="text-[#8994A3] text-[11px] uppercase font-mono tracking-[1.5px] mt-2 border-b border-[#C8102E]/30 pb-2.5 w-full">
            SEGURANÇA AVANÇADA • ACESSO RESTRITO
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
          {/* Security Notice Panel */}
          <div className="p-[22px_20px] border border-[#FFC247]/35 rounded-[18px] bg-[#101923]/95 space-y-3 relative overflow-hidden shadow-inner ring-1 ring-[#C8102E]/20">
            <div className="absolute top-0 right-0 w-28 h-28 bg-[#C8102E]/10 rounded-bl-full pointer-events-none" />
            
            <div className="flex items-center gap-2.5 text-[#FFC247]">
              <div className="w-9 h-9 rounded-xl bg-[#FFC247]/10 border border-[#FFC247]/30 flex items-center justify-center text-[#FFC247] shadow-xs">
                <Lock size={17} />
              </div>
              <h3 className="text-sm font-bold text-[#FFC247] tracking-wide m-0 font-heading">
                Controle de Acesso Restrito
              </h3>
            </div>

            <p className="text-[#8994A3] text-[13px] leading-[1.7] m-0">
              Apenas <strong className="text-[#FFC247] font-semibold">usuários cadastrados</strong> possuem autorização para acessar o sistema.
            </p>
          </div>

          {/* Luminous Gold Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full min-h-[56px] border border-[#FFC247]/50 rounded-xl bg-gradient-to-r from-[#FFC247] via-[#D99A25] to-[#B87C17] hover:brightness-110 text-[#05080C] font-extrabold text-[13px] tracking-[0.9px] uppercase cursor-pointer shadow-[0_8px_30px_rgba(255,194,71,0.3)] hover:shadow-[0_12px_38px_rgba(255,194,71,0.5)] transition-all flex items-center justify-between px-5 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <span className="w-full flex items-center justify-center gap-2 font-mono text-xs">
                <span className="w-4 h-4 border-2 border-[#05080C] border-t-transparent rounded-full animate-spin" />
                Autenticando com Google...
              </span>
            ) : (
              <>
                <div className="flex items-center gap-3.5">
                  <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                  </div>
                  <span>ENTRAR COM CONTA GOOGLE</span>
                </div>
                <ArrowRight size={18} className="text-[#05080C]" />
              </>
            )}
          </button>
        </div>

        {/* Footer inside card */}
        <div className="border-t border-[#FFC247]/20 mt-[31px] pt-[20px] text-center text-[#8994A3] text-[10px] tracking-[1.6px] uppercase font-mono">
          SISTEMA DE LOGÍSTICA E TELEMETRIA
        </div>

      </div>
    </div>
  );
}
