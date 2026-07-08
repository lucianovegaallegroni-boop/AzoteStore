import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';

export default function Layout({ cartCount, wishlistCount, currentUser, onLogout, onOpenCart, onOpenWishlist }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [tcgOpen, setTcgOpen] = useState(false);
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

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
    <div className="flex flex-col min-h-screen overflow-x-hidden w-full">
      
      {/* Top Navigation Bar */}
      <nav className="bg-surface dark:bg-on-background shadow-sm top-0 z-40 sticky transition-all duration-300 border-b border-outline-variant/30">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-[1440px] mx-auto">
          
          {/* Brand */}
          <Link 
            to="/" 
            className="font-display-lg-mobile md:font-display-lg text-[22px] sm:text-display-lg-mobile md:text-display-lg text-primary dark:text-primary-fixed tracking-tighter flex items-center gap-1.5 sm:gap-2 hover:scale-[1.02] transition-transform shrink-0"
          >
            <span className="material-symbols-outlined text-[1.4em] sm:text-[1.2em] font-variation-settings-'FILL' 1;" style={{ fontVariationSettings: '"FILL" 1' }}>
              deployed_code
            </span> 
            <span className="hidden sm:inline">Azote Store</span>
          </Link>

          {/* Search (Center, Desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden">
            <div className="relative w-full group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
                search
              </span>
              <input 
                type="text"
                placeholder="Buscar Gundam, Cartas, Juegos..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md pl-10 pr-4 py-2 rounded-full border-none focus:ring-2 focus:ring-primary focus:bg-white transition-all shadow-inner outline-none"
              />
            </div>
          </form>

          {/* Navigation Links & Actions */}
          <div className="flex items-center gap-xs sm:gap-md">
            
            {/* Desktop Categories - hidden, navigation via mobile drawer */}
            <div className="hidden">
              {/* TCG Dropdown */}
              <div className="relative group py-2">
                <button className="text-on-surface-variant dark:text-outline-variant font-body-md text-body-md hover:text-primary dark:hover:text-primary-fixed flex items-center gap-1 transition-all cursor-pointer">
                  TCG
                  <span className="material-symbols-outlined text-[16px] group-hover:rotate-180 transition-transform duration-200">
                    expand_more
                  </span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute top-full left-0 mt-1 bg-surface dark:bg-inverse-surface border border-outline-variant/30 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2 w-44 flex flex-col gap-1 card-shadow">
                  <Link 
                    to="/catalog?category=yu-gi-oh" 
                    className="px-4 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px] text-outline">style</span>
                    Yu-Gi-Oh
                  </Link>
                  <Link 
                    to="/catalog?category=pokemon" 
                    className="px-4 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px] text-outline">pets</span>
                    Pokemon
                  </Link>
                  <Link 
                    to="/catalog?category=magic" 
                    className="px-4 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px] text-outline">auto_awesome</span>
                    Magic
                  </Link>
                </div>
              </div>

              {/* Sleeves Link */}
              <Link to="/catalog?category=sleeves" className="text-on-surface-variant dark:text-outline-variant font-body-md text-body-md hover:text-primary dark:hover:text-primary-fixed hover:scale-105 transition-all">
                Sleeves
              </Link>

              {/* Board Games Link */}
              <Link to="/catalog?category=board-games" className="text-on-surface-variant dark:text-outline-variant font-body-md text-body-md hover:text-primary dark:hover:text-primary-fixed hover:scale-105 transition-all">
                Board Games
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
            <div className="flex items-center gap-sm relative">
              
              {/* Search Toggle for Mobile */}
              <button 
                onClick={() => {
                  const query = prompt('Buscar en Azote Store:');
                  if (query) navigate(`/catalog?q=${encodeURIComponent(query)}`);
                }}
                className="p-2 lg:hidden text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-high"
                aria-label="Buscar"
              >
                <span className="material-symbols-outlined">search</span>
              </button>

              {/* Favorites */}
              <button 
                onClick={onOpenWishlist}
                className="p-2 text-on-surface-variant hover:text-primary hover:scale-105 active:scale-95 transition-all rounded-full hover:bg-surface-container-high relative"
                aria-label="Favorites"
              >
                <span className="material-symbols-outlined">favorite</span>
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-secondary text-on-secondary text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Account Dropdown or Login Button */}
              {currentUser ? (
                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 p-1.5 pr-3 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full transition-all border border-outline-variant/30 active:scale-95"
                    aria-label="User Menu"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center shadow-sm">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold hidden md:inline max-w-[80px] truncate">{currentUser.name}</span>
                    <span className="material-symbols-outlined text-[16px]">
                      {userMenuOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-surface border border-outline-variant/40 rounded-xl shadow-lg z-50 py-2">
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
                  className="p-2 text-on-surface-variant hover:text-primary hover:scale-105 active:scale-95 transition-all rounded-full hover:bg-surface-container-high"
                  aria-label="Login"
                >
                  <span className="material-symbols-outlined">account_circle</span>
                </button>
              )}

              {/* Cart Button */}
              <button 
                onClick={onOpenCart}
                className="flex items-center gap-xs bg-primary text-on-primary font-label-md text-label-md px-4 py-2 rounded-full shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all relative"
              >
                <span className="material-symbols-outlined text-[1.2em]">shopping_cart</span>
                <span className="hidden sm:inline">Carrito</span>
                {cartCount > 0 && (
                  <span className="bg-white text-primary text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold ml-1">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-high"
                aria-label="Menu"
              >
                <span className="material-symbols-outlined">
                  {mobileMenuOpen ? 'close' : 'menu'}
                </span>
              </button>

            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer (Slide from Left) */}
        <div className={`fixed inset-0 z-50 transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          {/* Blurred Backdrop */}
          <div 
            className="absolute inset-0 bg-on-background/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Drawer Body (slides left-to-right) */}
          <div className={`absolute inset-y-0 right-0 w-72 max-w-xs bg-surface border-l border-outline-variant/30 shadow-2xl p-6 flex flex-col gap-6 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
              <span className="font-display-lg-mobile text-primary tracking-tighter flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined text-[1.2em]">deployed_code</span> 
                Azote Store
              </span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors"
                aria-label="Cerrar menú"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Links */}
            <nav className="flex flex-col gap-2 flex-grow">
              <div className="text-[10px] text-outline uppercase tracking-wider font-bold mb-2 ml-3">Categorías</div>

              {/* TCG Accordion */}
              <div>
                <button
                  onClick={() => setTcgOpen(!tcgOpen)}
                  className="w-full py-2.5 px-3 rounded-lg text-on-surface font-body-md hover:bg-surface-container-low transition-colors flex items-center gap-3 font-semibold"
                >
                  <span className="material-symbols-outlined text-outline">playing_cards</span>
                  TCG
                  <span className={`material-symbols-outlined text-[18px] text-outline ml-auto transition-transform duration-200 ${tcgOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                {/* Sub-items */}
                <div className={`overflow-hidden transition-all duration-200 ${tcgOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="flex flex-col gap-1 pl-4 mt-1 border-l-2 border-outline-variant/30 ml-5">
                    <Link
                      to="/catalog?category=yu-gi-oh"
                      onClick={() => { setMobileMenuOpen(false); setTcgOpen(false); }}
                      className="py-2 px-3 rounded-lg text-on-surface-variant font-semibold text-sm hover:bg-surface-container-low hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px] text-outline">style</span>
                      Yu-Gi-Oh
                    </Link>
                    <Link
                      to="/catalog?category=pokemon"
                      onClick={() => { setMobileMenuOpen(false); setTcgOpen(false); }}
                      className="py-2 px-3 rounded-lg text-on-surface-variant font-semibold text-sm hover:bg-surface-container-low hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px] text-outline">pets</span>
                      Pokemon
                    </Link>
                    <Link
                      to="/catalog?category=magic"
                      onClick={() => { setMobileMenuOpen(false); setTcgOpen(false); }}
                      className="py-2 px-3 rounded-lg text-on-surface-variant font-semibold text-sm hover:bg-surface-container-low hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px] text-outline">auto_awesome</span>
                      Magic
                    </Link>
                  </div>
                </div>
              </div>

              <Link 
                to="/catalog?category=sleeves" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg text-on-surface font-body-md hover:bg-surface-container-low transition-colors flex items-center gap-3 font-semibold"
              >
                <span className="material-symbols-outlined text-outline">layers</span>
                Sleeves
              </Link>
              <Link 
                to="/catalog?category=board-games" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg text-on-surface font-body-md hover:bg-surface-container-low transition-colors flex items-center gap-3 font-semibold"
              >
                <span className="material-symbols-outlined text-outline">casino</span>
                Board Games
              </Link>
              
              {currentUser && (
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
            </nav>

            {/* User Session Info in Drawer Footer */}
            {currentUser && (
              <div className="border-t border-outline-variant/20 pt-4 mt-auto">
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
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-inverse-surface dark:bg-surface-container-lowest border-t border-outline mt-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop py-xl w-full max-w-[1440px] mx-auto">
          
          <div className="md:col-span-1 flex flex-col gap-4">
            <Link to="/" className="font-headline-md text-headline-md text-primary-fixed dark:text-primary tracking-tighter flex items-center gap-2">
              <span className="material-symbols-outlined text-[1.2em]">deployed_code</span> 
              Azote Store
            </Link>
            <p className="font-body-md text-body-md text-surface-variant max-w-xs mt-2">
              Elevando la experiencia del coleccionista. Artículos premium, seleccionados por expertos.
            </p>
          </div>

          <div className="flex flex-col gap-sm">
            <h3 className="font-label-md text-label-md text-primary-fixed uppercase tracking-wider mb-2">Navegación</h3>
            <Link to="/catalog" className="text-surface-variant hover:text-white transition-colors hover:underline decoration-secondary decoration-2 font-body-md text-body-md w-fit">
              Catálogo Completo
            </Link>
            <a href="#" className="text-surface-variant hover:text-white transition-colors hover:underline decoration-secondary decoration-2 font-body-md text-body-md w-fit">
              Localizador de Tiendas
            </a>
            <a href="#" className="text-surface-variant hover:text-white transition-colors hover:underline decoration-secondary decoration-2 font-body-md text-body-md w-fit">
              Calendario de Eventos
            </a>
          </div>

          <div className="flex flex-col gap-sm">
            <h3 className="font-label-md text-label-md text-primary-fixed uppercase tracking-wider mb-2">Soporte</h3>
            <a href="#" className="text-surface-variant hover:text-white transition-colors hover:underline decoration-secondary decoration-2 font-body-md text-body-md w-fit">
              Políticas de Envío
            </a>
            <a href="#" className="text-surface-variant hover:text-white transition-colors hover:underline decoration-secondary decoration-2 font-body-md text-body-md w-fit">
              Contacto y Soporte
            </a>
          </div>

          <div className="flex flex-col gap-sm">
            <h3 className="font-label-md text-label-md text-primary-fixed uppercase tracking-wider mb-2">Mantente Actualizado</h3>
            <form onSubmit={(e) => { e.preventDefault(); alert('¡Te has registrado con éxito!'); }} className="flex mt-2">
              <input 
                type="email" 
                required
                placeholder="Dirección de correo" 
                className="bg-on-background border border-outline text-white px-4 py-2 rounded-l-md w-full focus:outline-none focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed text-sm"
              />
              <button type="submit" className="bg-primary-fixed text-on-primary-fixed px-4 py-2 rounded-r-md font-label-md hover:bg-white transition-colors text-sm font-semibold">
                Unirse
              </button>
            </form>
          </div>

          <div className="md:col-span-4 mt-lg pt-lg border-t border-outline/30 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-body-md text-body-md text-surface-variant">
              © 2026 Azote Store Enthusiast Collective. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-surface-variant hover:text-primary-fixed transition-colors">
                <span className="material-symbols-outlined">share</span>
              </a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
