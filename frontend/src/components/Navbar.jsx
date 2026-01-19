import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="sora-title text-2xl">Fila Zero</h1>
        </div>
        
        <ul className="inter-text flex gap-6">
          <li>
            <Link to="/" className="hover:text-blue-100 transition">
              Home
            </Link>
          </li>
          <li>
            <Link to="/fila" className="hover:text-blue-100 transition">
              Entrar na Fila
            </Link>
          </li>
          <li>
            <Link to="/admin" className="hover:text-blue-100 transition">
              Painel Admin
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
