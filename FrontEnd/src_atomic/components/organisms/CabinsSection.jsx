import { CABINS } from "../../data";
import { Trees, Wifi, Tv, Coffee, Flame, CheckCircle2, Car, Utensils, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Sección de galería y listado de cabañas.
 * Renderiza tarjetas individuales de cabañas con carruseles manuales de imágenes.
 */

// Función auxiliar para mapear características de texto a íconos de Lucide
const FeatureIcon = ({ feature }) => {
  const f = feature.toLowerCase();
  
  let Icon = CheckCircle2;
  if (f.includes('jacuzzi')) Icon = Coffee;
  else if (f.includes('wifi')) Icon = Wifi;
  else if (f.includes('tv')) Icon = Tv;
  else if (f.includes('fogata') || f.includes('fuego')) Icon = Flame;
  else if (f.includes('verde') || f.includes('catamaran')) Icon = Trees;
  else if (f.includes('parqueadero')) Icon = Car;
  else if (f.includes('bbq')) Icon = Utensils;

  return <Icon className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
};

// 2. Componente de tarjeta de Cabaña extraído para mejor legibilidad
const CabinCard = ({ cabin, index }) => {
  const scrollRef = useRef(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const scroll = (direction) => {
    setIsAutoPlaying(false);
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (cabin.images.length <= 1 || !isAutoPlaying) return;
    const intervalId = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // Si llegó al final (con un pequeño margen por redondeo de píxeles)
        if (Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
      }
    }, 5000); // 5 segundos

    return () => clearInterval(intervalId);
  }, [cabin.images.length, isAutoPlaying]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-stone-200/50 border border-stone-100 flex flex-col group hover:-translate-y-2 transition-transform duration-300"
    >
      {/* Carrusel nativo con CSS (Scroll Snap) en lugar de react-slick */}
      <div 
        className="w-full aspect-[4/3] relative overflow-hidden bg-stone-100 group/carousel"
        onPointerDown={() => setIsAutoPlaying(false)}
      >
        {/* Flechas de navegación */}
        {cabin.images.length > 1 && (
          <>
            <button 
              onClick={() => scroll('left')} 
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-all opacity-0 group-hover/carousel:opacity-100"
              aria-label="Anterior imagen"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll('right')} 
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-all opacity-0 group-hover/carousel:opacity-100"
              aria-label="Siguiente imagen"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        <div 
          ref={scrollRef} 
          className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar w-full h-full"
        >
          {cabin.images.map((img, i) => (
            <div key={i} className="flex-none w-full h-full snap-center relative">
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-stone-900/10 z-[1] pointer-events-none" />
              
              <div className="absolute top-4 right-4 z-[2] bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium border border-white/20 tracking-wider">
                {i + 1} / {cabin.images.length}
              </div>
              
              <img 
                src={img} 
                alt={`${cabin.name} - Vista ${i + 1}`} 
                loading="lazy" 
                className="w-full h-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-105" 
              />
            </div>
          ))}
        </div>
        
        {/* Indicador visual inferior opcional */}
        {cabin.images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none opacity-80">
            {cabin.images.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
            ))}
          </div>
        )}
      </div>

      <div className="p-6 md:p-8 flex flex-col flex-1">
        <h3 className="text-2xl font-bold text-stone-900 mb-3">{cabin.name}</h3>
        <p className="text-stone-600 mb-6 leading-relaxed text-sm md:text-base min-h-[4.5rem]">
          {cabin.description}
        </p>
        
        <div className="mb-6 flex-1">
          <h4 className="text-xs md:text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">Comodidades</h4>
          <ul className="grid grid-cols-2 gap-y-3 gap-x-2">
            {cabin.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-stone-700 text-sm font-medium">
                <FeatureIcon feature={feature} />
                <span className="truncate" title={feature}>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto pt-6 border-t border-stone-100">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="block text-xs text-stone-500 font-medium mb-1">Desde</span>
              <span className="text-2xl font-bold text-emerald-700">
                ${cabin.plans.occasional.toLocaleString('es-CO')}
              </span>
            </div>
          </div>
          <Link 
            to="/reservas"
            className="w-full flex justify-center items-center py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-200"
          >
            Reservar ahora
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export function CabinsSection() {
  return (
    <section id="cabins" className="py-20 md:py-24 px-4 sm:px-6 lg:px-12 bg-stone-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-stone-900 mb-4"
          >
            Nuestras Cabañas
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto"
          >
            Cada cabaña está diseñada para ofrecer el máximo confort integrándose armoniosamente con el entorno natural.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {CABINS.map((cabin, index) => (
            <CabinCard key={cabin.id} cabin={cabin} index={index} />
          ))}
        </div>
      </div>
      
      {/* Estilos locales para el comportamiento del carrusel */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
