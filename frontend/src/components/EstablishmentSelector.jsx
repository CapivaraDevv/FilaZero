export default function EstablishmentSelector({ value, onChange}) {
    const establishments = [
        { id: "banco-central", name: "Banco central"},
        { id: "farmacia-abc", name: "Farmácia ABC"},
        { id: "cartorio-xyz", name: "Cartório XYZ"}
    ];

    return (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <label className="block font-semibold mb-2">
                Selecione o estabelecimento
            </label>

            <select 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                className="w-full md:w-64 border rounded-lg px-4 py-2"
            >
                <option value="">-- Selecione --</option>
                {establishments.map(est => (
                    <option key={est.id} value={est.id}>
                        {est.name}
                    </option>
                ))}    
            </select>
        </div>
    );
}