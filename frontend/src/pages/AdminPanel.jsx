export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Painel de Administrador
        </h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">
              Pessoas na Fila
            </h3>
            <p className="text-3xl font-bold text-blue-600">12</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">
              Atendidos Hoje
            </h3>
            <p className="text-3xl font-bold text-green-600">28</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">
              Tempo Médio
            </h3>
            <p className="text-3xl font-bold text-orange-600">8 min</p>
          </div>
        </div>

        {/* Fila */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Fila Atual</h2>
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Posição</th>
                <th className="px-4 py-2 text-left">Nome</th>
                <th className="px-4 py-2 text-left">Telefone</th>
                <th className="px-4 py-2 text-center">Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">1</td>
                <td className="px-4 py-3">João Silva</td>
                <td className="px-4 py-3">(11) 99999-1111</td>
                <td className="px-4 py-3 text-center">
                  <button className="bg-green-600 text-white px-4 py-1 rounded cursor-pointer hover:bg-green-700">
                    Chamar
                  </button>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">2</td>
                <td className="px-4 py-3">Maria Santos</td>
                <td className="px-4 py-3">(11) 99999-2222</td>
                <td className="px-4 py-3 text-center">
                  <button className="bg-green-600 text-white px-4 py-1 rounded cursor-pointer hover:bg-green-700">
                    Chamar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
