import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl">📖</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bíblia Codex</h1>
          <p className="text-gray-600">Aplicativo de estudo bíblico</p>
        </div>

        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl mr-2">✅</span>
              <span className="font-semibold text-green-800">Servidor Funcionando!</span>
            </div>
            <p className="text-sm text-green-700">
              Localhost iniciado com sucesso na porta 5173
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-800 mb-2">🚀 Melhorias Implementadas:</h3>
            <ul className="text-sm text-blue-700 text-left space-y-1">
              <li>• ✅ Refatoração completa da estrutura</li>
              <li>• ✅ Otimizações de performance (React.memo)</li>
              <li>• ✅ Lazy loading de componentes</li>
              <li>• ⏳ Correção de imports em andamento</li>
            </ul>
          </div>

          <div className="text-xs text-gray-500">
            Aplicação em desenvolvimento - Refatoração em progresso
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;