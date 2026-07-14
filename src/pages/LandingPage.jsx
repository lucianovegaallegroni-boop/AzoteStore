import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
export default function LandingPage({ products }) {
  const navigate = useNavigate();
  const [dbProducts, setDbProducts] = React.useState([]);
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const staticSlides = [
    {

    },
    {
      title: "Estrategia y Táctica Premium",
      subtitle: "Juegos de Mesa",
      description: "Desde cooperativos profundos hasta desafiantes juegos de estrategia. Encuentra tu próxima gran partida en nuestra colección.",
      buttonText: "Ver Juegos",
      link: "/catalog?category=board-games",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_tvA7VyJYA3UBiwgNaiAVnSxltWGfbXLOpQU0uU7pUl7XkjgLIxBwIiTFtScLU9bPXQ5MElIEncb-2Lda6FOKjQXPUUdD71gEdioHPQLWEMZD5q8zvxCOrcTtY6DCHTLn30Hc5OWPCBsJfr3PSgNAxn8ve_nUVrtWqhpTRAu3KZ79iCoEXDFIFcl8cSGeIHsexlYcS1_3-okEBdZlx2Vmojc_5RS3k9UAqLVAnqsMqCSco25NHBHC7w",
      badgeColor: "bg-secondary text-on-secondary",
      onClick: () => navigate('/catalog?category=board-games')
    },
    {
      title: "Cartas Coleccionables TCG",
      subtitle: "Yu-Gi-Oh, Pokémon & Magic",
      description: "Protege tu baraja y encuentra cartas secretas raras de las últimas expansiones lanzadas al mercado.",
      buttonText: "Comprar TCG",
      link: "/catalog?category=tcg",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAct3FZrbUkLdhtf_kIuFVe-SsAjjQF2TyHl0Z9heIFgJClU0DGBHnMVFINYeaIbb_B0JRF69Sf1JPn8BG-uHXAyrlcoB2V32G7XQIMQwGpPJoq1KYszZ43O2-ZjnU6cI4kdMetqGyPByPmC1-kXaSJiaT2O5mRMHIODP6v1AYNYIKqEUi2EMAqI4W5wOpZBtf1zrT0vVnkridLk8r2pPDmH9LgyMNCINBwKZACGdTxJeYhduMlOWoVRA",
      badgeColor: "bg-tertiary text-on-tertiary",
      onClick: () => navigate('/catalog?category=yu-gi-oh')
    }
  ];

  // Get products that are marked as hero (division === 'hero')
  const heroProducts = dbProducts.filter(p => p.division === 'hero');

  // Map heroProducts to slides format
  const dynamicSlides = heroProducts.map((p, idx) => {
    const badgeColors = ["bg-primary text-on-primary", "bg-secondary text-on-secondary", "bg-tertiary text-on-tertiary"];
    const badgeColor = badgeColors[idx % badgeColors.length];

    return {
      title: p.name,
      subtitle: `${p.category} Destacado`,
      description: p.description || "Descubre este artículo de colección en nuestra tienda. Calidad premium garantizada.",
      buttonText: "Ver Detalles",
      link: `/product/${p.id}`,
      image: p.image,
      badgeColor: badgeColor,
      onClick: () => navigate(`/product/${p.id}`)
    };
  });

  const activeSlides = dynamicSlides.length > 0 ? dynamicSlides : staticSlides;

  // Drag-to-swipe slider controls
  const [dragStartX, setDragStartX] = React.useState(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [hasDragged, setHasDragged] = React.useState(false);

  const handleDragStart = (e) => {
    if (e.type === 'mousedown' && e.button !== 0) return;
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    setDragStartX(clientX);
    setIsDragging(true);
    setHasDragged(false);
  };

  const handleDragMove = (e) => {
    if (!isDragging || dragStartX === null) return;
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const diffX = dragStartX - clientX;

    if (Math.abs(diffX) > 10) {
      setHasDragged(true);
    }

    if (Math.abs(diffX) > 60) {
      if (diffX > 0) {
        // Swipe left -> Next slide
        setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
      } else {
        // Swipe right -> Previous slide
        setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
      }
      setIsDragging(false);
      setDragStartX(null);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragStartX(null);
  };

  const handleContainerClick = (e) => {
    if (hasDragged) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    activeSlides[currentSlide]?.onClick();
  };

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  React.useEffect(() => {
    (async () => {
      try {
        const { supabase } = await import('../supabaseClient');
        const { data: prods, error } = await supabase
          .from('products')
          .select('*, product_variants(*)');

        if (error) throw error;

        if (prods) {
          const formatted = prods.map(p => ({
            id: p.id,
            name: p.name,
            subtitle: `${p.category} Collectible Item`,
            price: parseFloat(p.price),
            originalPrice: null,
            image: p.image,
            category: p.category,
            categorySlug: p.category.toLowerCase().replace(/\s+/g, '-'),
            inStock: p.stock > 0,
            featured: p.featured,
            division: p.division,
            description: p.description
          }));
          setDbProducts(formatted);
        }
      } catch (err) {
        console.error('Error cargando destacados desde Supabase:', err);
      }
    })();
  }, []);

  const activeProducts = dbProducts.length > 0 ? dbProducts : products;

  // Get only products marked as featured, fallback to first 4 if none are flagged
  const flaggedProducts = activeProducts.filter(p => p.featured === true);
  const featuredProducts = flaggedProducts.length > 0 ? flaggedProducts.slice(0, 4) : activeProducts.slice(0, 4);

  return (
    <div className="w-full">

      {/* Hero Section - Bento Grid Style */}
      <section className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-lg md:py-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter h-auto lg:h-[600px]">

          {/* Main Feature (Left) */}
          {/* Main Feature (Left) - Auto-rotating Slider */}
          <div
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            onClick={handleContainerClick}
            className="lg:col-span-8 bg-surface-container-low rounded-xl overflow-hidden relative group cursor-pointer shadow-[0_4px_20px_rgba(15,23,42,0.08)] h-[400px] lg:h-full transition-all duration-500 select-none"
          >
            {activeSlides.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${slide.image}')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-on-background/80 via-on-background/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-lg w-full">
                  <span className={`inline-block ${slide.badgeColor} font-label-sm text-label-sm px-3 py-1 rounded-full mb-4 uppercase tracking-wider backdrop-blur-sm shadow-sm`}>
                    {slide.subtitle}
                  </span>
                  <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-white mb-2 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="font-body-lg text-body-lg text-white/90 mb-6 max-w-xl">
                    {slide.description}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(slide.link);
                    }}
                    className="bg-white text-on-background font-label-md text-label-md px-6 py-3 rounded-full hover:bg-surface-container-highest hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-2"
                  >
                    {slide.buttonText} <span className="material-symbols-outlined text-[1.2em]">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Slide Indicators */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              {activeSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(idx);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/70'
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
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

        <div className="relative w-full overflow-hidden py-4">
          {/* Infinite Marquee Track */}
          <div className="flex gap-6 w-max animate-scroll hover:[animation-play-state:paused]">
            {/* First Set */}
            {featuredProducts.map((product) => (
              <div
                key={`${product.id}-first`}
                onClick={() => navigate(`/product/${product.id}`)}
                className="bg-surface rounded-xl overflow-hidden cursor-pointer group border border-outline-variant/20 card-shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col h-full w-[280px] sm:w-[300px] shrink-0"
              >
                <div className="h-[240px] overflow-hidden bg-surface-container-low relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!product.inStock ? 'grayscale opacity-60' : ''}`}
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center transition-all duration-300 group-hover:bg-black/45">
                      <span className="border-2 border-error text-error bg-error/10 font-headline-md text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg shadow-sm">
                        Sin Stock
                      </span>
                    </div>
                  )}
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

            {/* Duplicate Set for Seamless Scrolling Loop */}
            {featuredProducts.map((product) => (
              <div
                key={`${product.id}-second`}
                onClick={() => navigate(`/product/${product.id}`)}
                className="bg-surface rounded-xl overflow-hidden cursor-pointer group border border-outline-variant/20 card-shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col h-full w-[280px] sm:w-[300px] shrink-0"
              >
                <div className="h-[240px] overflow-hidden bg-surface-container-low relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!product.inStock ? 'grayscale opacity-60' : ''}`}
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center transition-all duration-300 group-hover:bg-black/45">
                      <span className="border-2 border-error text-error bg-error/10 font-headline-md text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg shadow-sm">
                        Sin Stock
                      </span>
                    </div>
                  )}
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
        </div>
      </section>

    </div>
  );
}
