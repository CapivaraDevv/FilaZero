import { Link, useLocation } from 'react-router-dom';

import { useState, useEffect } from 'react';



export default function Sidebar() {
    const [isSideBarOpen, setSideBarOpen] = useState(false);

    return (
        <div className={`max-w-5xl min-h-screen mx-auto absolute bg-slate-900 text-white`}>
            <button
                className='flex flex-col gap-1 cursor-pointer mx-auto'
                onClick={() => setSideBarOpen(!isSideBarOpen)}
                aria-label={isSideBarOpen ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={isSideBarOpen}
                aria-controls='navbar-menu'
                type='button'
            >
                <div className={`w-6 h-0.5 bg-white transition-all ${isSideBarOpen ? 'rotate-45 translate-y-1 -translate-x-2' : ''}`}></div>
                <div className={`w-6 h-0.5 bg-white transition-all ${isSideBarOpen ? 'opacity-0' : ''}`}></div>
                <div className={`w-6 h-0.5 bg-white transition-all ${isSideBarOpen ? '-rotate-45 -translate-y-2 translate-x-2' : ''}`}></div>
            </button>
            <div>
                <ul className={`inter-text max-w-4xl mx-auto p-10 text-lg`}>
                    <li className={` ${isSideBarOpen ? '' : 'opacity-1'}`}>Dashboard</li>
                    <li className={` ${isSideBarOpen ? '' : 'opacity-1'}`}>Histórico</li>
                    <li className={` ${isSideBarOpen ? '' : 'opacity-1'}`}>Relatórios</li>
                </ul>
            </div>
        </div>
    );
};

