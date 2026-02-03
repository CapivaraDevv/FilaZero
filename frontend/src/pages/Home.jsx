import { Link } from "react-router-dom";
import { motion } from "motion/react"

const extendLine = {
  hidden: {
    opacity: 0,
    width: 0,
  },
  visible: {
    opacity: 1,
    width: 240,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.30,
    },
  },
};

const item = {
  hidden: {
    opacity: 0,
    x: 30,
  },
  visible: {
    opacity: 1,
    x: 0,
    trasition: {
      duration: 0.8,
      ease: "easeInOut",
    },
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="sora-title text-5xl md:text-6xl tracking-tight font-bold text-gray-900 mb-2">
            Bem-vindo ao Fila Zero
          </h1>
          <motion.div
            variants={extendLine}
            initial="hidden"
            whileInView="visible"
            className="w-48 h-1 bg-black mx-auto mb-5">
          </motion.div>
          <p className="inter-text text-xl text-gray-600 mb-8">
            Elimine filas físicas. Atendimento em tempo real, direto do seu celular
          </p>

          <div className="mt-16 flex justify-center">
            {/* Cliente */}
            <motion.div

              className="
                    max-w-xl w-full
                  bg-white/90 backdrop-blur
                    border border-blue-200
                    rounded-2xl
                    shadow-2xl shadow-blue-200/60
                    hover:-translate-y-2 hover:shadow-blue-300/70
                    transition-all duration-300
                    p-8
                  ">

              <motion.ul
                variants={container}
                initial="hidden"
                animate="visible"
                className="inter-text text-left text-gray-600 space-y-3 mb-8 mt-8">
                <motion.li
                  variants={item}
                  className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Entre na fila remotamente
                </motion.li>
                <motion.li
                  variants={item}
                  className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Acompanhe sua posição em tempo real
                </motion.li>
                <motion.li
                  variants={item}
                  className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Receba notificações quando estiver próximo
                </motion.li>
                <motion.li
                  variants={item}
                  className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Mostre QR Code ao chegar
                </motion.li>
              </motion.ul>


              <Link to="/fila" className="inline-flex items-center justify-center
                      sora-title
                      bg-blue-600 text-white
                      px-6 py-2 rounded-lg
                      transition-all duration-200
                      hover:bg-blue-500 hover:scale-105 hover:shadow-lg
                      active:scale-95">
                Preencher formulário
              </Link>
            </motion.div>

            {/* Estabelecimento */}
          </div>
          <p className="text-sm text-slate-500 mt-10">
            Sistema em tempo real • Notificações instantâneas • Sem necessidade de app
          </p>
        </div>
      </div>
    </div>
  );
}
