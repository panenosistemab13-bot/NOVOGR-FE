import React, { useState } from 'react';
import { User, Save, Trash2, Camera, Shield, Mail } from 'lucide-react';
import { UserProfile } from '../types';

export default function ConfiguracoesView() {
  const [users, setUsers] = useState([
    { id: 1, name: 'Jefferson', role: 'Administrador', email: 'jefferson@3coracoes.com.br', password: 'password', avatar: null },
    { id: 2, name: 'Funcionario', role: 'Funcionario', email: 'funcionario@3coracoes.com.br', password: 'password', avatar: null }
  ]);
  const [selectedUserId, setSelectedUserId] = useState<number>(1);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0];

  const deleteUser = (id: number) => {
    setUsers(users.filter(u => u.id !== id));
    if (selectedUserId === id) {
      setSelectedUserId(users[0]?.id || 0);
    }
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 p-6 gap-6">
      {/* Coluna 1: Lista de Usuários */}
      <div className="w-1/4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold mb-6">Equipe</h2>
        <div className="space-y-3">
          {users.map(user => (
            <div
              key={user.id}
              className={`w-full p-4 rounded-2xl flex items-center justify-between gap-3 ${selectedUserId === user.id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-100'}`}
            >
              <button
                onClick={() => setSelectedUserId(user.id)}
                className="flex items-center gap-3 flex-grow text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              </button>
              <button onClick={() => deleteUser(user.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Coluna 2: Detalhes do Usuário */}
      <div className="w-2/4 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <h2 className="text-2xl font-bold">Editar Perfil</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome Completo</label>
            <input type="text" value={selectedUser?.name || ''} onChange={e => updateUser('name', e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={selectedUser?.email || ''} onChange={e => updateUser('email', e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cargo/Role</label>
            <input type="text" value={selectedUser?.role || ''} onChange={e => updateUser('role', e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200" />
          </div>
        </div>
      </div>

      {/* Coluna 3: Ações e Segurança */}
      <div className="w-1/4 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold flex items-center gap-2"><Shield size={18}/> Segurança</h3>
          <input type="password" placeholder="Nova Senha" value={selectedUser?.password || ''} onChange={e => updateUser('password', e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200" />
        </div>
        
        <button onClick={handleSave} className="w-full p-4 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-700 transition">
          <Save size={18} /> Salvar Alterações
        </button>

        {savedSuccess && (
          <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 text-sm font-bold animate-pulse">
            Salvo com sucesso!
          </div>
        )}
      </div>
    </div>
  );
}
