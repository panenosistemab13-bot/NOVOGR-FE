import React, { useState } from 'react';
import { 
  AlertCircle,
  Lock,
  RotateCw,
  ShieldCheck
} from 'lucide-react';
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
        const parsed = JSON.parse(saved);
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
        allowedPages: Array.isArray(matchedUser?.allowedPages) ? matchedUser.allowedPages : (isUserAdmin ? [] : ['checklist', 'averbacao', 'sm_creator', 'lancamento', 'controle', 'disponibilidade', 'escala'])
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
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans select-none bg-[#FAF8F4]"
      style={{
        backgroundImage: `url('/assets/aistudio/Login_corporativo_de_log_stica_global_3da2ca9d.png')`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Máscara central sólida para cobrir 100% o card estático da imagem de fundo sem criar borda dupla */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: '26%',
          right: '26%',
          top: '11%',
          bottom: '10%',
          background: 'radial-gradient(ellipse 85% 85% at 50% 50%, #FAF8F4 78%, rgba(250,248,244,0) 100%)',
          filter: 'blur(12px)'
        }}
      />

      {/* Cartão Central Corporativo com Zoom Reduzido e Proporcional */}
      <div className="relative z-10 w-full max-w-[385px] rounded-[26px] p-[1.5px] bg-gradient-to-b from-[#DFBD69] via-[#EED68A] to-[#B38228] shadow-[0_20px_55px_rgba(166,124,30,0.22)]">
        <div className="w-full h-full rounded-[24.5px] bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF9] to-[#FCF9F2] px-6 sm:px-7 py-6 sm:py-7 text-[#181818]">
          
          {/* Cabeçalho da Marca: Logo 3 Corações + Café Três Corações */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-4 sm:gap-5 w-full">
              {/* Emblema Circular Vermelho e Dourado 3 Corações */}
              <div className="w-[74px] h-[74px] sm:w-[82px] sm:h-[82px] rounded-full bg-gradient-to-b from-[#E31837] via-[#C8102E] to-[#9E0B22] p-1 shadow-[0_6px_16px_rgba(200,16,46,0.28)] shrink-0 flex items-center justify-center relative">
                <div className="w-full h-full rounded-full border-[1.2px] border-white/85 flex items-center justify-center p-0.5">
                  <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                    <defs>
                      <path id="loginLogoArc" d="M 14 66 A 38 38 0 0 0 86 66" />
                      <linearGradient id="goldHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFE066" />
                        <stop offset="50%" stopColor="#F5B82E" />
                        <stop offset="100%" stopColor="#C98A14" />
                      </linearGradient>
                    </defs>

                    {/* 3 Corações Estilizados Dourados no Centro */}
                    <circle cx="38" cy="34" r="11.5" fill="url(#goldHeartGrad)" />
                    <path
                      d="M38 38.2 C38 38.2 33.2 35 33.2 32.3 C33.2 30.8 34.4 29.8 35.7 29.8 C36.7 29.8 37.5 30.4 38 31.2 C38.5 30.4 39.3 29.8 40.3 29.8 C41.6 29.8 42.8 30.8 42.8 32.3 C42.8 35 38 38.2 38 38.2 Z"
                      fill="#9E0B22"
                    />

                    <circle cx="62" cy="34" r="11.5" fill="url(#goldHeartGrad)" />
                    <path
                      d="M62 38.2 C62 38.2 57.2 35 57.2 32.3 C57.2 30.8 58.4 29.8 59.7 29.8 C60.7 29.8 61.5 30.4 62 31.2 C62.5 30.4 63.3 29.8 64.3 29.8 C65.6 29.8 66.8 30.8 66.8 32.3 C66.8 35 62 38.2 62 38.2 Z"
                      fill="#9E0B22"
                    />

                    <circle cx="50" cy="52" r="11.5" fill="url(#goldHeartGrad)" />
                    <path
                      d="M50 56.2 C50 56.2 45.2 53 45.2 50.3 C45.2 48.8 46.4 47.8 47.7 47.8 C48.7 47.8 49.5 48.4 50 49.2 C50.5 48.4 51.3 47.8 52.3 47.8 C53.6 47.8 54.8 48.8 54.8 50.3 C54.8 53 50 56.2 50 56.2 Z"
                      fill="#9E0B22"
                    />

                    <text
                      fontSize="13.5"
                      fontWeight="800"
                      fill="#FFFFFF"
                      letterSpacing="0.6"
                      style={{ fontFamily: 'system-ui, sans-serif' }}
                    >
                      <textPath href="#loginLogoArc" startOffset="50%" textAnchor="middle">
                        3 Corações
                      </textPath>
                    </text>
                  </svg>
                </div>
              </div>

              {/* Divisória Vertical Dourada */}
              <div className="w-[2px] h-14 sm:h-16 bg-gradient-to-b from-transparent via-[#B8861B] to-transparent rounded-full shrink-0" />

              {/* Tipografia Café Três Corações */}
              <div className="text-left flex flex-col justify-center">
                <span className="text-base sm:text-[17px] italic font-bold text-[#B8861B] leading-tight">
                  Café
                </span>
                <h1 className="text-xl sm:text-[24px] font-extrabold text-[#181818] tracking-tight leading-none mt-0.5">
                  Três Corações
                </h1>
              </div>
            </div>

            {/* Subtítulo de Segurança */}
            <div className="w-full mt-4 mb-3.5">
              <p className="text-center text-[#5A5A5A] text-[9.5px] sm:text-[10px] font-semibold uppercase tracking-[0.2em]">
                SEGURANÇA AVANÇADA <span className="text-[#C8962E] mx-1">•</span> ACESSO RESTRITO
              </p>
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#DFC278] to-transparent mt-2.5" />
            </div>
          </div>

          {/* Alerta de Erro caso ocorra */}
          {error && (
            <div className="mb-3.5 bg-[#FFF5F5] border border-red-300 text-[#C91F2D] px-3.5 py-2.5 rounded-xl text-[11px] font-medium flex items-start gap-2 shadow-xs text-left">
              <AlertCircle size={14} className="text-[#C91F2D] shrink-0 mt-0.5" />
              <div className="leading-snug font-semibold">
                {error}
              </div>
            </div>
          )}

          {/* Bloco Escuro: Controle de Acesso Restrito */}
          <div className="relative overflow-hidden rounded-[18px] bg-gradient-to-br from-[#26282B] via-[#1B1D20] to-[#121417] px-4 py-4 shadow-[0_8px_20px_rgba(0,0,0,0.2)] border border-[#3E3829] mb-3.5">
            {/* Detalhe de Arco Dourado Luminoso no Canto Direito */}
            <div
              className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 rounded-full border-[1.5px] border-[#F5B82E]/50"
              style={{
                background: 'radial-gradient(circle, rgba(245,184,46,0.22) 0%, rgba(184,134,27,0.05) 60%, transparent 75%)'
              }}
            />

            <div className="relative z-10 flex items-center gap-3.5 text-left">
              {/* Ícone de Cadeado Dourado Circular */}
              <div className="w-10 h-10 rounded-full border border-[#D4A537]/80 bg-[#D4A537]/10 flex items-center justify-center text-[#F5C242] shrink-0 shadow-[0_0_12px_rgba(245,194,66,0.16)]">
                <Lock size={17} className="stroke-[2]" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xs sm:text-[13.5px] font-extrabold text-white tracking-tight leading-snug">
                  Controle de Acesso Restrito
                </h2>
                <p className="text-[#D0D3D8] text-[11px] sm:text-[11.5px] leading-relaxed">
                  Apenas <strong className="text-[#F5B82E] font-bold">usuários cadastrados</strong> possuem autorização para acessar o sistema.
                </p>
              </div>
            </div>
          </div>

          {/* Botão Principal Dourado: Autenticando com Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full min-h-[46px] rounded-[14px] border border-[#D9B150] bg-gradient-to-r from-[#FAE7A2] via-[#E0B44D] to-[#B07D1A] hover:brightness-105 text-[#1A160D] font-extrabold text-[11px] sm:text-xs tracking-[0.07em] uppercase cursor-pointer shadow-[0_6px_18px_rgba(184,134,27,0.28)] hover:shadow-[0_8px_22px_rgba(184,134,27,0.4)] transition-all flex items-center justify-center gap-2.5 px-4 active:scale-[0.99] disabled:opacity-60"
          >
            <RotateCw
              size={15}
              className={`text-[#2B2108] stroke-[2.3] ${loading ? 'animate-spin' : ''}`}
            />
            <span>
              {loading ? 'AUTENTICANDO COM GOOGLE...' : 'AUTENTICANDO COM GOOGLE...'}
            </span>
          </button>

          {/* Rodapé do Cartão */}
          <div className="mt-4 pt-3 border-t border-[#DFC278]/60 flex items-center justify-center gap-2 text-[#5A5A5A]">
            <ShieldCheck size={14} className="text-[#B8861B] stroke-[2.2] shrink-0" />
            <span className="text-[9.5px] sm:text-[10px] font-semibold tracking-[0.16em] uppercase">
              SISTEMA DE LOGÍSTICA E TELEMETRIA
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
