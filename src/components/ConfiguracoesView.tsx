import React, { useState, useEffect } from 'react';
import { User, Save, Trash2, Camera, Shield, Eye, EyeOff, Plus, UserPlus } from 'lucide-react';

interface UserData {
  id: number;
  name: string;
  role: 'Administrador' | 'Funcionario';
  email: string;
  password: string;
}

export default function ConfiguracoesView() {
  const [users, setUsers] = useState<UserData[]>(() => {
    const saved = localStorage.getItem('app_users');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Jefferson', role: 'Administrador', email: 'jefferson@3coracoes.com.br', password: '#trescafe2029' },
      { id: 2, name: 'Funcionario', role: 'Funcionario', email: 'funcionario@3coracoes.com.br', password: 'password' }
    ];
  });

  const [selectedUserId, setSelectedUserId] = useState<number>(users[0]?.id || 1);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    localStorage.setItem('app_users', JSON.stringify(users));
  }, [users]);

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0];

  const updateUser = (field: keyof UserData, value: string) => {
    setUsers(users.map(u => u.id === selectedUserId ? { ...u, [field]: value } : u));
  };

  const deleteUser = (id: number) => {
    if (users.length <= 1) return;
    const updatedUsers = users.filter(u => u.id !== id);
    setUsers(updatedUsers);
    if (selectedUserId === id) {
      setSelectedUserId(updatedUsers[0]?.id);
    }
  };

  const addUser = () => {
    const newUser: UserData = {
      id: Date.now(),
      name: 'Novo Usuário',
      role: 'Funcionario',
      email: '',
      password: 'password'
    };
    setUsers([...users, newUser]);
    setSelectedUserId(newUser.id);
  };

  return (
    <div className="flex h-full p-6 gap-6 bg-zinc-950 text-zinc-100">
      <div className="w-80 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Usuários</h2>
          <button onClick={addUser} className="p-2 bg-indigo-600 rounded-full hover:bg-indigo-500">
            <Plus size={18} />
          </button>
        </div>
        <div className="space-y-2 flex-grow overflow-y-auto">
          {users.map(user => (
            <div
              key={user.id}
              className={`p-3 rounded-xl flex items-center justify-between cursor-pointer ${selectedUserId === user.id ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}
              onClick={() => setSelectedUserId(user.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                  <User size={14} />
                </div>
                <div className='text-sm'>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-zinc-400">{user.role}</p>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); deleteUser(user.id); }} className="text-red-400 hover:text-red-300">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-grow bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
        <h2 className="text-2xl font-bold">Editar Usuário</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Nome</label>
            <input type="text" value={selectedUser?.name || ''} onChange={e => updateUser('name', e.target.value)} className="w-full p-3 bg-zinc-800 rounded-xl border border-zinc-700" />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Email</label>
            <input type="email" value={selectedUser?.email || ''} onChange={e => updateUser('email', e.target.value)} className="w-full p-3 bg-zinc-800 rounded-xl border border-zinc-700" />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Cargo</label>
            <select value={selectedUser?.role || 'Funcionario'} onChange={e => updateUser('role', e.target.value as any)} className="w-full p-3 bg-zinc-800 rounded-xl border border-zinc-700">
              <option value="Administrador">Administrador</option>
              <option value="Funcionario">Funcionario</option>
            </select>
          </div>
          <div className="relative">
            <label className="block text-sm text-zinc-400 mb-1">Senha</label>
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={selectedUser?.password || ''} 
              onChange={e => updateUser('password', e.target.value)} 
              className="w-full p-3 bg-zinc-800 rounded-xl border border-zinc-700" 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-zinc-400">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
