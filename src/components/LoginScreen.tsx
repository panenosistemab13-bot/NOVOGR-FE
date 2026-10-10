import React, { useState } from 'react';
import { 
  User, 
  Key, 
  ArrowRight, 
  AlertCircle
} from 'lucide-react';
import goldMedalLogo from '../assets/images/gold_logo_medal_3c_1790406432555.jpg';

interface LoginScreenProps {
  onLoginSuccess: (user: { email: string; name: string; role: string }) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('jeff');
  const [password, setPassword] = useState('#trescafe2029');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const cleanUser = username.trim().toLowerCase();
      const cleanPass = password.trim();

      if ((cleanUser === 'jeff' || cleanUser === 'jeffersondizzy@gmail.com') && cleanPass === '#trescafe2029') {
        const userData = {
          email: 'jeff@3coracoes.com.br',
          name: 'Jefferson (jeff)',
          role: 'admin'
        };
        localStorage.setItem('logged_user', JSON.stringify(userData));
        localStorage.setItem('user_email', userData.email);
        onLoginSuccess(userData);
      } else {
        setError('Usuário ou senha inválidos. Utilize Login: jeff e Senha: #trescafe2029');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090a0c] overflow-y-auto select-none font-sans">
      <div className="absolute inset-0 bg-radial from-[#181A1D] via-[#121417] to-[#090a0c]" />
      
      <div className="w-full max-w-md bg-[#121417] border border-[#C5A059] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-8 md:p-10 relative z-10 text-[#FAF7F0] backdrop-blur-xl">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full mx-auto p-1 bg-[#181A1D] border-2 border-[#C5A059] shadow-[0_4px_20px_rgba(197,160,89,0.35)] flex items-center justify-center mb-4">
            <img src={goldMedalLogo} alt="Café Três Corações" className="w-full h-full object-contain" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="bg-[#C91F2D] text-white font-black text-[10px] px-3 py-1 rounded-full shadow-md tracking-widest uppercase border border-red-400/40 font-heading">
              3CORAÇÕES
            </span>
            <span className="bg-[#181A1D] text-[#C5A059] font-mono font-bold text-[10px] px-3 py-1 rounded-full shadow-inner border border-[#C5A059]/40 uppercase tracking-widest">
              CENTRAL GR
            </span>
          </div>

          <h1 className="text-2xl font-black text-[#FAF7F0] tracking-wide uppercase font-heading">
            Acesso Operacional
          </h1>
          <p className="text-[10px] font-mono text-stone-400 mt-1 tracking-widest uppercase">
            Sistema de Controle e Gestão de Risco
          </p>
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
            <label className="block text-[10px] font-mono font-black text-[#C5A059] uppercase tracking-wider mb-1.5">
              Usuário / Login
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input 
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="jeff"
                className="w-full bg-[#181A1D] border border-[#C5A059]/50 focus:border-[#C5A059] rounded-xl pl-11 pr-4 py-3 text-xs font-mono font-black text-[#FAF7F0] placeholder-stone-500 focus:outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-black text-[#C5A059] uppercase tracking-wider mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="#trescafe2029"
                className="w-full bg-[#181A1D] border border-[#C5A059]/50 focus:border-[#C5A059] rounded-xl pl-11 pr-4 py-3 text-xs font-mono font-black text-[#FAF7F0] placeholder-stone-500 focus:outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#C91F2D] via-[#b31b27] to-[#801414] hover:brightness-110 text-white font-black py-3.5 px-6 rounded-xl shadow-[0_4px_20px_rgba(201,31,45,0.4)] transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs border border-red-500/40 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2 font-mono">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Autenticando...
              </span>
            ) : (
              <>
                Entrar no Sistema 
                <ArrowRight size={14} className="text-[#C5A059]" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#C5A059]/30 text-center">
          <p className="text-[10px] font-mono text-stone-400">
            Café Três Corações • Segurança em Cada Trajeto
          </p>
        </div>

      </div>
    </div>
  );
}
