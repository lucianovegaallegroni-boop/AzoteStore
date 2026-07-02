import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
export default function LandingPage({ products }) {
  const navigate = useNavigate();

  // Get some products to display as featured
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="w-full">
      
      {/* Hero Section - Bento Grid Style */}
      <section className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-lg md:py-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter h-auto lg:h-[600px]">
          
          {/* Main Feature (Left) */}
          <div 
            onClick={() => navigate('/product/rx-78-2-titanium-finish')}
            className="lg:col-span-8 bg-surface-container-low rounded-xl overflow-hidden relative group cursor-pointer shadow-[0_4px_20px_rgba(15,23,42,0.08)] h-[400px] lg:h-full"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAct3FZrbUkLdhtf_kIuFVe-SsAjjQF2TyHl0Z9heIFgJClU0DGBHnMVFINYeaIbb_B0JRF69Sf1JPn8BG-uHXAyrlcoB2V32G7XQIMQwGpPJoq1KYszZ43O2-ZjnU6cI4kdMetqGyPByPmC1-kXaSJiaT2O5mRMHIODP6v1AYNYIKqEUi2EMAqI4W5wOpZBtf1zrT0vVnkridLk8r2pPDmH9LgyMNCINBwKZACGdTxJeYhduMlOWoVRA')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-on-background/80 via-on-background/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-lg w-full">
              <span className="inline-block bg-primary text-on-primary font-label-sm text-label-sm px-3 py-1 rounded-full mb-4 uppercase tracking-wider backdrop-blur-sm shadow-sm">
                Lanzamiento Destacado
              </span>
              <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-white mb-2 leading-tight">
                Master Grade: The Next Evolution
              </h1>
              <p className="font-body-lg text-body-lg text-white/90 mb-6 max-w-xl">
                Experimenta un nivel de detalle sin precedentes con la última incorporación a la línea PG Unleashed. Preventas abiertas.
              </p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/catalog?category=mecha-kits');
                }}
                className="bg-white text-on-background font-label-md text-label-md px-6 py-3 rounded-full hover:bg-surface-container-highest hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-2"
              >
                Comprar Gunpla <span className="material-symbols-outlined text-[1.2em]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Secondary Features (Right) */}
          <div className="lg:col-span-4 flex flex-col gap-gutter h-full">
            
            {/* Top Right */}
            <div 
              onClick={() => navigate('/catalog?category=board-games')}
              className="flex-1 bg-surface-container rounded-xl overflow-hidden relative group cursor-pointer shadow-[0_4px_20px_rgba(15,23,42,0.08)] min-h-[180px]"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" 
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA_tvA7VyJYA3UBiwgNaiAVnSxltWGfbXLOpQU0uU7pUl7XkjgLIxBwIiTFtScLU9bPXQ5MElIEncb-2Lda6FOKjQXPUUdD71gEdioHPQLWEMZD5q8zvxCOrcTtY6DCHTLn30Hc5OWPCBsJfr3PSgNAxn8ve_nUVrtWqhpTRAu3KZ79iCoEXDFIFcl8cSGeIHsexlYcS1_3-okEBdZlx2Vmojc_5RS3k9UAqLVAnqsMqCSco25NHBHC7w')" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-on-background/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-md w-full">
                <h2 className="font-headline-md text-headline-md text-white mb-1">Estrategia y Táctica</h2>
                <p className="font-body-md text-body-md text-white/80">Descubre juegos de mesa altamente valorados.</p>
              </div>
            </div>

            {/* Bottom Right */}
            <div 
              onClick={() => navigate('/catalog?category=yu-gi-oh')}
              className="flex-1 bg-secondary-container text-on-secondary-container rounded-xl overflow-hidden relative group cursor-pointer shadow-[0_4px_20px_rgba(15,23,42,0.08)] p-md flex flex-col justify-between min-h-[180px] transition-transform duration-300 hover:scale-[1.01]"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <span className="material-symbols-outlined text-[6rem]">style</span>
              </div>
              <div>
                <span className="inline-block bg-white/20 backdrop-blur-md text-on-secondary-container font-label-sm text-label-sm px-3 py-1 rounded-full mb-2">
                  Alerta de Restock
                </span>
                <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold leading-tight relative z-10">
                  Cartas TCG Raras
                </h2>
              </div>
              <div className="flex justify-between items-end relative z-10">
                <p className="font-body-md text-body-md opacity-90 max-w-[150px]">
                  Nuevas cajas de sobres acaban de llegar.
                </p>
                <button className="bg-on-secondary-container text-secondary-container rounded-full p-3 hover:scale-110 active:scale-95 transition-transform shadow-md">
                  <span className="material-symbols-outlined">shopping_bag</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Shop by Category (Circular Icons) */}
      <section className="w-full bg-surface-container-lowest py-xl border-y border-outline-variant/20">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex flex-col md:flex-row justify-between items-end mb-lg gap-4">
            <div>
              <h2 className="font-display-lg-mobile md:font-headline-lg text-display-lg-mobile md:text-headline-lg text-on-background tracking-tight">
                Explora la Bóveda
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
                Encuentra tu próxima obsesión.
              </p>
            </div>
          </div>
          <div className="flex overflow-x-auto pb-4 gap-lg snap-x hide-scrollbar">
            
            {/* Category 1 */}
            <Link to="/catalog?category=mecha-kits" className="group flex flex-col items-center gap-4 min-w-[120px] snap-center">
              <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300 shadow-sm">
                <span className="material-symbols-outlined text-[3rem]">smart_toy</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">
                Kits de Mechas
              </span>
            </Link>

            {/* Category 2 */}
            <Link to="/catalog?category=board-games" className="group flex flex-col items-center gap-4 min-w-[120px] snap-center">
              <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors duration-300 shadow-sm">
                <span className="material-symbols-outlined text-[3rem]">casino</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface group-hover:text-secondary transition-colors">
                Juegos de Mesa
              </span>
            </Link>

            {/* Category 3 */}
            <Link to="/catalog?category=tcg" className="group flex flex-col items-center gap-4 min-w-[120px] snap-center">
              <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center text-tertiary group-hover:bg-tertiary group-hover:text-on-tertiary transition-colors duration-300 shadow-sm">
                <span className="material-symbols-outlined text-[3rem]">auto_awesome_mosaic</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface group-hover:text-tertiary transition-colors">
                Juegos de Cartas
              </span>
            </Link>

            {/* Category 4 - Mock Category */}
            <Link to="/catalog?q=tools" className="group flex flex-col items-center gap-4 min-w-[120px] snap-center">
              <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-on-surface-variant group-hover:text-surface transition-colors duration-300 shadow-sm">
                <span className="material-symbols-outlined text-[3rem]">handyman</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface group-hover:text-on-surface-variant transition-colors">
                Herramientas
              </span>
            </Link>

            {/* Category 5 - Mock Category */}
            <Link to="/catalog?q=manga" className="group flex flex-col items-center gap-4 min-w-[120px] snap-center">
              <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300 shadow-sm">
                <span className="material-symbols-outlined text-[3rem]">book</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">
                Manga/Libros
              </span>
            </Link>

          </div>
        </div>
      </section>

      {/* Featured Products List */}
      <section className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
        <div className="flex justify-between items-center mb-lg">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-background">Productos Destacados</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Nuestra mejor selección para entusiastas.</p>
          </div>
          <Link to="/catalog" className="text-primary hover:text-primary-container font-label-md hover:underline flex items-center gap-1 transition-all">
            Ver catálogo completo <span className="material-symbols-outlined text-[1em]">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {featuredProducts.map((product) => (
            <div 
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className="bg-surface rounded-xl overflow-hidden cursor-pointer group border border-outline-variant/20 card-shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col h-full"
            >
              <div className="h-[240px] overflow-hidden bg-surface-container-low relative">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  {product.inStock ? (
                    <span className="chip chip-instock">En stock</span>
                  ) : (
                    <span className="bg-error-container/85 text-error text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full backdrop-blur-sm">
                      Agotado
                    </span>
                  )}
                  {product.grade === 'Premium Grade' && (
                    <span className="chip chip-rare">Premium</span>
                  )}
                </div>
              </div>

              <div className="p-md flex flex-col flex-1 justify-between">
                <div>
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold font-body-md">{product.category}</span>
                  <h3 className="font-headline-md text-[18px] text-on-background group-hover:text-primary transition-colors line-clamp-1 mt-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">{product.description}</p>
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-outline-variant/20">
                  <div className="flex items-baseline gap-2">
                    <span className="font-headline-md text-primary">${product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="font-body-md text-xs text-outline line-through">${product.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                  <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
