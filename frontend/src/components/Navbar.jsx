import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useRef, useEffect } from 'react';

export default function Navbar() {
  const menuRef =  useRef(null);
  const firstLinkRef = useRef(null);
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if(isMenuOpen) {
      firstLinkRef.current?.focus();
      const onKey = (e) => {if (e.key === 'Escape') setIsMenuOpen(false); };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }
  }, [isMenuOpen]);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/fila', label: 'Entrar na fila' },
    { path: '/admin', label: 'Painel Admin' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-900 text-white p-6 shadow-lg" aria-label="Navegação principal">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <h1 className="sora-title text-2xl" role='heading' aria-level={1}>
            Fila Zero
          </h1>
        </div>

        <button
          className='md:hidden flex flex-col gap-1 cursor-pointer'
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isMenuOpen}
          aria-controls='navbar-menu'
          type='button'
        >
          <div className={`w-6 h-0.5 bg-white transition-all ${isMenuOpen ? 'rotate-45 translate-y-1 -translate-x-2' : ''}`}></div>
          <div className={`w-6 h-0.5 bg-white transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></div>
          <div className={`w-6 h-0.5 bg-white transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2 translate-x-2' : ''}`}></div>
        </button>

        {/* Menu (Desktop) */}
        <ul
          id='navbar-menu'
          className={`inter-text flex gap-6 md:flex
            ${isMenuOpen ? 'flex flex-col absolute top-20 left-0 right-0 bg-[#0F172A] p-4' : 'hidden md:flex md:static md:flex-row p-0'
            }`}
          role='menubar'
        >
          {navLinks.map(({ path, label }, index) => (
            <li key={path} role="none">
              <Link
                ref={index === 0 ? firstLinkRef : undefined}
                to={path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded hover:scale-110 transition-all 
                  ${isActive(path)
                    ? 'bg-blue-600 text-white'
                    : 'hover:text-blue-100 text-gray-200'
                  }`}
                aria-current={isActive(path) ? 'page' : undefined}
                role='menuitem'
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
