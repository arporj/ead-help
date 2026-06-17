import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Plus, X, Search, Check, AlertTriangle, Key } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { systemUsers, addSystemUser, removeSystemUser } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Confirmation modal states
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !fullName.trim()) return;

    // Verificar se já existe cadastrado
    const exists = systemUsers.some(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (exists) {
      setErrorMsg('Este e-mail já está cadastrado como administrador.');
      return;
    }

    try {
      await addSystemUser(email, fullName);
      setEmail('');
      setFullName('');
      setSuccessMsg('Usuário do sistema cadastrado com sucesso! Ele já pode acessar o portal.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg('Erro ao cadastrar administrador.');
    }
  };

  const handleDeleteClick = (userEmail: string) => {
    setUserToDelete(userEmail);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await removeSystemUser(userToDelete);
        setUserToDelete(null);
        setSuccessMsg('Acesso administrativo revogado com sucesso.');
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
        setErrorMsg('Erro ao revogar acesso administrativo.');
      }
    }
  };

  const filteredAdmins = systemUsers.filter(su => {
    const query = searchQuery.toLowerCase();
    const matchEmail = su.email.toLowerCase().includes(query);
    const matchName = su.fullName ? su.fullName.toLowerCase().includes(query) : false;
    return matchEmail || matchName;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="text-brand-light" size={24} />
          Usuários do Sistema
        </h2>
        <p className="text-gray-400 text-xs mt-1">
          Gerencie e conceda acesso administrativo para novos usuários gerirem a plataforma.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Add Admin */}
        <div className="lg:col-span-4 bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl shadow-xl h-fit space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Plus size={16} className="text-brand-light" />
            Novo Administrador
          </h3>

          {successMsg && (
            <div className="bg-green-950/35 border border-green-500/35 text-green-300 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <Check size={14} className="text-green-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-900/35 border border-red-500/35 text-red-200 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5">
                Nome Completo
              </label>
              <input
                type="text"
                required
                placeholder="Ex: André Rodrigues"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-3.5 py-2 text-xs text-white focus:border-brand-light focus:outline-none placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5">
                Endereço de E-mail
              </label>
              <input
                type="email"
                required
                placeholder="Ex: arporj@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-3.5 py-2 text-xs text-white focus:border-brand-light focus:outline-none placeholder-gray-500"
              />
            </div>

            <div className="bg-brand-dark/30 border border-brand-medium/55 p-3 rounded-xl text-[10px] text-gray-400 leading-relaxed space-y-1">
              <span className="font-bold text-brand-light block uppercase tracking-wider text-[9px]">Acesso Padrão:</span>
              <p>Por padrão, novos administradores criados possuirão **Acesso Total** a todas as páginas acadêmicas.</p>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-light hover:bg-white text-brand-dark py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-light/5 cursor-pointer"
            >
              Adicionar Administrador
            </button>
          </form>
        </div>

        {/* Right column: Admin List */}
        <div className="lg:col-span-8 bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl shadow-xl flex flex-col h-[550px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 shrink-0">
            <h3 className="font-bold text-white text-sm">
              Administradores Cadastrados ({systemUsers.length})
            </h3>
            
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por e-mail ou nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-dark/60 border border-brand-medium/55 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-brand-light focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
            {filteredAdmins.length === 0 ? (
              <div className="text-center py-16 text-gray-500 text-xs">
                Nenhum administrador encontrado.
              </div>
            ) : (
              filteredAdmins.map(admin => {
                const isPending = admin.id === null;

                return (
                  <div key={admin.email} className="border border-brand-medium/35 bg-brand-dark/30 p-4 rounded-xl flex items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border ${
                          isPending 
                            ? 'bg-yellow-650/25 border-yellow-500/35 text-yellow-300' 
                            : 'bg-brand-medium/55 border-brand-light/30 text-white'
                        }`}>
                          {(admin.fullName || admin.email)[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-white truncate">
                            {admin.fullName || 'Convidado Pendente'}
                          </h4>
                          <span className="text-[10px] text-gray-400 block truncate">{admin.email}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[9px] pt-1">
                        {isPending ? (
                          <span className="px-2 py-0.5 rounded bg-yellow-950 text-yellow-300 border border-yellow-500/20 font-semibold uppercase">
                            Convite Pendente
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-green-950 text-green-300 border border-green-500/20 font-semibold uppercase">
                            Ativo
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-brand-medium/20 text-brand-light border border-brand-medium/30 flex items-center gap-1">
                          <Key size={8} /> Acesso Total (all)
                        </span>
                        <span className="px-2 py-0.5 rounded bg-brand-dark/40 border border-brand-medium/20 text-gray-400">
                          Criado em: {new Date(admin.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Exclude button */}
                    {admin.email !== 'admin@eadhelp.com' && (
                      <button
                        onClick={() => handleDeleteClick(admin.email)}
                        className="p-2 rounded-xl bg-red-950/15 hover:bg-red-905 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white transition-all cursor-pointer"
                        title="Revogar Acesso Administrativo"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-brand-dark border-2 border-red-500/20 p-6 rounded-2xl max-w-sm w-full space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-900/25 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h4 className="font-bold text-white text-sm">Revogar Acesso?</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Você está prestes a remover **{userToDelete}** da lista de administradores. 
              Se a conta já estiver cadastrada, ela perderá acesso administrativo e será rebaixada para estudante básico.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 bg-brand-medium/40 hover:bg-brand-medium text-white py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-900 hover:bg-red-800 text-white py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Sim, Revogar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
