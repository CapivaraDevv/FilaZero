export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="sora-title text-5xl font-bold text-gray-900 mb-4">
            Bem-vindo ao Fila Zero
          </h1>
          <p className="inter-text text-xl text-gray-600 mb-8">
            Gerenciar filas nunca foi tão fácil e seguro
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            {/* Cliente */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="sora-title text-2xl font-bold text-blue-600 mb-4">Cliente</h2>
              <ul className="inter-text text-left text-gray-600 space-y-3 mb-6">
                <li>✓ Entre na fila remotamente</li>
                <li>✓ Acompanhe sua posição em tempo real</li>
                <li>✓ Receba notificações quando estiver próximo</li>
                <li>✓ Mostre QR Code ao chegar</li>
              </ul>
              <a 
                href="/fila" 
                className="sora-title bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Entrar na Fila
              </a>
            </div>

            {/* Estabelecimento */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="sora-title text-2xl font-bold text-green-600 mb-4">Estabelecimento</h2>
              <ul className="inter-text text-left text-gray-600 space-y-3 mb-6">
                <li>✓ Crie filas do dia</li>
                <li>✓ Gerencie clientes em tempo real</li>
                <li>✓ Chame próximos da fila</li>
                <li>✓ Painel de controle completo</li>
              </ul>
              <a 
                href="/admin" 
                className="sora-title bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Acessar Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
