import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import logo from '../assets/logo.webp';

const defaultHeaderBanners = [
  {
    id: 'default-1',
    image: '/header-banners/BEYOND_THE_BRAVE_1.webp',
    fallback: '/header-banners/BEYOND_THE_BRAVE_1.png',
    alt: 'Beyond The Brave',
    link: '/catalog?category=yu-gi-oh',
    position_x: 50,
    position_y: 50
  },
  {
    id: 'default-2',
    image: '/header-banners/share-fb-v1.webp',
    fallback: '/header-banners/share-fb-v1.jpg.jpeg',
    alt: 'Azote Store Coleccionables',
    link: '/catalog',
    position_x: 50,
    position_y: 50
  },
  {
    id: 'default-3',
    image: '/header-banners/vorquelminta-1920x500.webp',
    fallback: '/header-banners/vorquelminta-1920x500.png',
    alt: 'Vorquelminta Promo',
    link: '/catalog',
    position_x: 50,
    position_y: 50
  }
];

const defaultTcgGames = [
  { name: 'Yu-Gi-Oh!', slug: 'yu-gi-oh' },
  { name: 'Pokémon', slug: 'pokemon' },
  { name: 'Magic: The Gathering', slug: 'magic' }
];

const getTcgLogo = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('yu-gi-oh') || n.includes('yugioh')) {
    return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQb_QJG__8waCiF9-EHaLoNyDavicTlcHbAk8fhh5-i6w&s';
  }
  if (n.includes('pok') || n.includes('pokemon')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/9/98/International_Pok%C3%A9mon_logo.svg';
  }
  if (n.includes('magic')) {
    return 'https://1000logos.net/wp-content/uploads/2022/10/Magic-The-Gathering-logo.png';
  }
  if (n.includes('one piece')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/One_Piece_Logo.svg/1200px-One_Piece_Logo.svg.png';
  }
  return null;
};

const getTcgSlug = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('yu-gi-oh') || n.includes('yugioh')) return 'yu-gi-oh';
  if (n.includes('pok')) return 'pokemon';
  if (n.includes('magic')) return 'magic';
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
};

export default function Layout({ cartCount, currentUser, onLogout, onOpenCart }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [tcgOpen, setTcgOpen] = useState(false);
  const [tcgGames, setTcgGames] = useState([]);
  const [banners, setBanners] = useState(defaultHeaderBanners);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  // Fetch TCG games for navigation
  useEffect(() => {
    let isMounted = true;
    const loadTcgGames = async () => {
      try {
        const { supabase } = await import('../supabaseClient');
        const { data, error } = await supabase
          .from('tcg_games')
          .select('id, name')
          .order('name', { ascending: true });
        if (!error && data && data.length > 0 && isMounted) {
          setTcgGames(data);
        }
      } catch (e) {
        console.warn('Error cargando tcg_games:', e);
      }
    };
    loadTcgGames();
    return () => { isMounted = false; };
  }, []);

  const displayedTcgGames = tcgGames.length > 0 ? tcgGames : defaultTcgGames;

  // Fetch banners from Supabase
  useEffect(() => {
    let isMounted = true;
    const loadBanners = async () => {
      try {
        const { supabase } = await import('../supabaseClient');
        const { data, error } = await supabase
          .from('header_banners')
          .select('*')
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0 && isMounted) {
          setBanners(
            data.map((b) => ({
              id: b.id,
              image: b.image_url,
              alt: b.title || 'Azote Store',
              link: (typeof b.link_url === 'string' && b.link_url.startsWith('{'))
                ? (JSON.parse(b.link_url).value || '/catalog')
                : (b.link_url || '/catalog'),
              position_x: b.position_x !== null && b.position_x !== undefined ? b.position_x : 50,
              position_y: b.position_y !== null && b.position_y !== undefined ? b.position_y : 50
            }))
          );
        }
      } catch (e) {
        console.warn('Using default header banners:', e);
      }
    };

    loadBanners();

    const handleUpdate = () => {
      loadBanners();
    };

    window.addEventListener('header_banners_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('header_banners_updated', handleUpdate);
    };
  }, []);

  // Safe active banner index
  const safeBannerIndex = banners.length > 0 ? currentBannerIndex % banners.length : 0;
  const activeBanner = banners[safeBannerIndex] || defaultHeaderBanners[0];

  // Auto-rotate header showcase banner every 4.5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Close user menu on clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogoutClick = () => {
    onLogout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen overflow-x-clip w-full">

      {/* Top Navigation Bar */}
      <nav className="bg-[#121358] text-white shadow-md top-0 z-40 sticky transition-all duration-300 border-b border-white/10 w-full">
        <div className="flex justify-between items-center w-full pl-2 sm:pl-4 md:pl-6 pr-1 sm:pr-2 h-16 sm:h-20 md:h-24 lg:h-28">

          <Link
            to="/"
            className="hover:scale-[1.02] transition-transform shrink-0 flex items-center py-2"
          >
            {/* Desktop & Standard Mobile Logo */}
            <img
              src={logo}
              alt="Azote Store"
              className="hidden min-[421px]:block h-12 sm:h-16 md:h-20 w-auto object-contain rounded-lg"
            />
            {/* Very narrow mobile screens: favicon only */}
            <img
              src="/favicon.png"
              alt="Azote Store"
              className="block min-[421px]:hidden h-9 w-9 object-contain rounded-md"
            />
          </Link>

          {/* Header Showcase Cuadro (Rotating Banner - Full Height with Rounded Corners & Border) */}
          <div className="mx-2 sm:mx-6 flex-1 max-w-[220px] min-[400px]:max-w-[300px] sm:max-w-[460px] md:max-w-[620px] lg:max-w-[760px] self-stretch h-full flex justify-center py-1 sm:py-1.5">
            <Link
              to={activeBanner.link}
              className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden border border-white/30 hover:border-teal-accent/80 shadow-md transition-all duration-300 group block bg-black/40"
              title={activeBanner.alt}
            >
              {banners.map((banner, index) => (
                <img
                  key={banner.id}
                  src={banner.image}
                  alt={banner.alt}
                  style={{
                    objectPosition: `${banner.position_x ?? 50}% ${banner.position_y ?? 50}%`
                  }}
                  onError={(e) => {
                    if (banner.fallback && e.currentTarget.src !== banner.fallback) {
                      e.currentTarget.src = banner.fallback;
                    }
                  }}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out group-hover:scale-105 transition-transform duration-500 ${
                    index === safeBannerIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                  loading="eager"
                />
              ))}

              {/* Subtle gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

              {/* Active Slide Indicators (Dots) */}
              {banners.length > 1 && (
                <div className="absolute bottom-2 right-3 flex items-center gap-1.5 z-10 pointer-events-none">
                  {banners.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === safeBannerIndex ? 'w-4 bg-teal-accent shadow-sm' : 'w-1.5 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </Link>
          </div>

          {/* Navigation Links & Actions */}
          <div className="flex items-center gap-1 min-[380px]:gap-2 sm:gap-md shrink-0 py-2">

            {/* Desktop Categories - hidden, navigation via mobile drawer */}
            <div className="hidden">
              {/* TCG Dropdown */}
              <div className="relative group py-2">
                <Link
                  to="/catalog?category=tcg"
                  className="text-on-surface-variant dark:text-outline-variant font-body-md text-body-md hover:text-primary dark:hover:text-primary-fixed flex items-center gap-1 transition-all cursor-pointer"
                >
                  TCG
                  <span className="material-symbols-outlined text-[16px] group-hover:rotate-180 transition-transform duration-200">
                    expand_more
                  </span>
                </Link>

                {/* Dropdown Menu */}
                <div className="absolute top-full left-0 mt-1 bg-surface dark:bg-inverse-surface border border-outline-variant/30 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2 w-52 flex flex-col gap-1 card-shadow max-h-80 overflow-y-auto scrollbar-thin">
                  {displayedTcgGames.map((game) => {
                    const logoUrl = getTcgLogo(game.name);
                    const slug = getTcgSlug(game.name);
                    return (
                      <Link
                        key={game.id || game.name}
                        to={`/catalog?category=${slug}`}
                        className="px-4 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low hover:text-primary transition-colors flex items-center gap-2.5"
                      >
                        {logoUrl ? (
                          <img src={logoUrl} alt={game.name} className="w-[24px] h-[24px] object-contain shrink-0" />
                        ) : (
                          <span className="material-symbols-outlined text-[16px] text-outline">style</span>
                        )}
                        {game.name}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Sleeves Link */}
              <Link to="/catalog?category=sleeves" className="text-on-surface-variant dark:text-outline-variant font-body-md text-body-md hover:text-primary dark:hover:text-primary-fixed hover:scale-105 transition-all">
                Sleeves
              </Link>

              {/* Add Product Button (Visible only to admin users) */}
              {currentUser && currentUser.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-secondary dark:text-secondary-fixed font-bold text-body-md hover:text-primary hover:scale-105 transition-all flex items-center gap-1 border-l border-outline-variant/30 pl-4 ml-1"
                >
                  <span className="material-symbols-outlined text-[1.2em]">add_box</span>
                  Agregar productos
                </Link>
              )}
            </div>

            {/* Icons */}
            <div className="flex items-center gap-1.5 min-[380px]:gap-2 sm:gap-sm relative">

              {/* Account Dropdown or Login Button */}
              {currentUser ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 p-0.5 min-[421px]:p-1.5 min-[421px]:pr-3 text-white hover:bg-white/10 rounded-full transition-all border border-white/20 active:scale-95"
                    aria-label="User Menu"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold hidden md:inline max-w-[80px] truncate">{currentUser.name}</span>
                    <span className="material-symbols-outlined text-[16px] hidden min-[421px]:inline">
                      {userMenuOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 mt-2 sm:w-56 bg-surface border border-outline-variant/40 rounded-xl shadow-lg z-50 py-2">
                      <div className="px-4 py-2 border-b border-outline-variant/20">
                        <p className="text-xs font-semibold text-outline">Conectado como</p>
                        <p className="font-label-md text-sm text-on-background truncate mt-0.5">{currentUser.name}</p>
                        <p className="text-xs text-on-surface-variant truncate">{currentUser.email}</p>
                      </div>

                      {/* Mobile-only Admin Link inside dropdown */}
                      {currentUser && currentUser.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="md:hidden w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-2 mt-1"
                        >
                          <span className="material-symbols-outlined text-[18px]">add_box</span>
                          Agregar productos
                        </Link>
                      )}

                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full text-left px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors flex items-center gap-2 mt-0.5"
                      >
                        <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                        Mis Pedidos
                      </Link>

                      <button
                        onClick={handleLogoutClick}
                        className="w-full text-left px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-error transition-colors flex items-center gap-2 mt-0.5"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="p-1.5 min-[380px]:p-2 text-white/80 hover:text-white hover:scale-105 active:scale-95 transition-all rounded-full hover:bg-white/10"
                  aria-label="Login"
                >
                  <span className="material-symbols-outlined">account_circle</span>
                </button>
              )}

              {/* Cart Button */}
              <button
                onClick={onOpenCart}
                className="flex items-center justify-center p-1.5 min-[380px]:p-2 sm:px-4 sm:py-2 bg-tertiary text-on-tertiary font-label-md text-label-md rounded-full shadow-sm hover:shadow-md hover:bg-tertiary/90 hover:scale-105 active:scale-95 transition-all relative"
              >
                <span className="material-symbols-outlined text-[1.2em]">shopping_cart</span>
                <span className="hidden sm:inline">Carrito</span>
                {cartCount > 0 && (
                  <span className="sm:relative absolute -top-1 -right-1 sm:top-auto sm:right-auto bg-[#121358] text-white text-[9px] sm:text-[10px] w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold sm:ml-1">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1 min-[380px]:p-1.5 sm:p-2 text-white hover:text-white/80 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
                aria-label="Abrir menú"
              >
                <span className="material-symbols-outlined text-[20px] sm:text-[24px]">menu</span>
              </button>

            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu (Sidebar) */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="absolute inset-0 bg-on-background/50 backdrop-blur-xs"
        />
        <div className={`absolute inset-y-0 right-0 z-10 w-72 max-w-xs bg-surface border-l border-outline-variant/30 shadow-2xl p-6 flex flex-col gap-6 transform transition-transform duration-300 ease-in-out pointer-events-auto ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>

            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 shrink-0">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center bg-[#121358] px-2.5 py-1.5 rounded-xl border border-white/10">
                <img src={logo} alt="Azote Store" className="h-11 w-auto object-contain" />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors"
                aria-label="Cerrar menú"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Scrollable Nav Links Area (Scrolls above footer) */}
            <nav className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin">
              <div className="text-[10px] text-outline uppercase tracking-wider font-bold mb-2 ml-3">Categorías</div>

              {/* TCG Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setTcgOpen(!tcgOpen)}
                  className="w-full py-2.5 px-3 rounded-lg text-on-surface font-body-md hover:bg-surface-container-low transition-colors flex items-center justify-between font-semibold cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-outline">playing_cards</span>
                    <span>TCG</span>
                  </div>
                  <span className={`material-symbols-outlined text-[18px] text-outline transition-transform duration-200 ${tcgOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                {/* Sub-items */}
                <div className={`overflow-hidden transition-all duration-200 ${tcgOpen ? 'max-h-[380px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="flex flex-col gap-1 pl-4 pb-2 border-l-2 border-outline-variant/30 ml-5 mt-1 overflow-y-auto max-h-[360px] scrollbar-thin">
                    {displayedTcgGames.map((game) => {
                      const logoUrl = getTcgLogo(game.name);
                      const slug = getTcgSlug(game.name);
                      return (
                        <Link
                          key={game.id || game.name}
                          to={`/catalog?category=${slug}`}
                          onClick={() => { setMobileMenuOpen(false); setTcgOpen(false); }}
                          className="py-2 px-3 rounded-lg text-on-surface-variant font-semibold text-sm hover:bg-surface-container-low hover:text-primary transition-colors flex items-center gap-2.5"
                        >
                          {logoUrl ? (
                            <img src={logoUrl} alt={game.name} className="w-[27px] h-[27px] object-contain shrink-0" />
                          ) : (
                            <span className="material-symbols-outlined text-[18px] text-outline">style</span>
                          )}
                          {game.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Link
                to="/catalog?category=sleeve"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg text-on-surface font-body-md hover:bg-surface-container-low transition-colors flex items-center gap-3 font-semibold"
              >
                <span className="material-symbols-outlined text-outline">layers</span>
                Sleeves
              </Link>

              <Link
                to="/catalog?category=producto-sellado"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg text-on-surface font-body-md hover:bg-surface-container-low transition-colors flex items-center gap-3 font-semibold"
              >
                <span className="material-symbols-outlined text-outline">inventory_2</span>
                Producto Sellado
              </Link>


              {currentUser && (
                <>
                  <div className="border-t border-outline-variant/20 my-3"></div>
                  <div className="text-[10px] text-outline uppercase tracking-wider font-bold mb-2 ml-3">Mi Cuenta</div>
                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 px-3 rounded-lg text-on-surface font-body-md hover:bg-surface-container-low transition-colors flex items-center gap-3 font-semibold"
                  >
                    <span className="material-symbols-outlined text-outline">shopping_bag</span>
                    Mis Pedidos
                  </Link>

                  {currentUser.role === 'admin' && (
                    <>
                      <div className="border-t border-outline-variant/20 my-3"></div>
                      <div className="text-[10px] text-outline uppercase tracking-wider font-bold mb-2 ml-3">Administración</div>
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-2.5 px-3 rounded-lg text-secondary font-bold hover:bg-secondary/5 transition-colors flex items-center gap-3"
                      >
                        <span className="material-symbols-outlined">add_box</span>
                        Agregar productos
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>

            {/* Pinned User Session Info Footer */}
            {currentUser && (
              <div className="border-t border-outline-variant/20 pt-4 mt-auto shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary text-on-primary font-bold text-sm flex items-center justify-center shadow-sm">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-on-background truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-outline truncate">{currentUser.email}</p>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-inverse-surface dark:bg-surface-container-lowest border-t border-outline/30 mt-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-margin-mobile md:px-margin-desktop py-6 sm:py-8 w-full max-w-[1440px] mx-auto">

          <div className="md:col-span-1 flex flex-col gap-2">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Azote Store" className="h-10 sm:h-12 w-auto rounded-lg object-contain border border-outline-variant/10 shadow-sm" />
            </Link>
            <p className="text-xs text-surface-variant/80 max-w-xs mt-1">
              Elevando la experiencia del coleccionista. Artículos premium, seleccionados por expertos.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <h3 className="text-xs font-bold text-primary-fixed uppercase tracking-wider mb-1">Navegación</h3>
            <Link to="/catalog" className="text-surface-variant hover:text-white transition-colors hover:underline decoration-secondary decoration-2 text-xs sm:text-sm w-fit">
              Catálogo Completo
            </Link>
          </div>

          <div className="md:col-span-4 mt-6 pt-4 border-t border-outline/20 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-surface-variant/80">
              © 2026 Azote Store Enthusiast Collective. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-surface-variant hover:text-primary-fixed transition-colors">
                <span className="material-symbols-outlined text-[18px]">share</span>
              </a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
