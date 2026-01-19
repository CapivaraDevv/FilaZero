export default function ClientQueue() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Entrar na Fila
          </h1>
          
          <form className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Nome Completo
              </label>
              <input 
                type="text" 
                placeholder="Seu nome" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Telefone
              </label>
              <input 
                type="tel" 
                placeholder="(00) 99999-9999" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Selecione o Estabelecimento
              </label>
              <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500">
                <option>-- Selecione --</option>
                <option>Banco Central</option>
                <option>Farmácia ABC</option>
                <option>Cartório XYZ</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition mt-6"
            >
              Entrar na Fila
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
