import React, { useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';

export default function Layout({ cartCount, wishlistCount, onOpenCart, onOpenWishlist }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Top Navigation Bar */}
      <nav className="bg-surface dark:bg-on-background shadow-sm top-0 z-40 sticky transition-all duration-300 border-b border-outline-variant/30">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-[1440px] mx-auto">
          
          {/* Brand */}
          <Link 
            to="/" 
            className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary dark:text-primary-fixed tracking-tighter flex items-center gap-2 hover:scale-[1.02] transition-transform"
          >
            <span className="material-symbols-outlined text-[1.2em] font-variation-settings-'FILL' 1;" style={{ fontVariationSettings: '"FILL" 1' }}>
              deployed_code
            </span> 
            Azote Store
          </Link>

          {/* Search (Center, Desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 max-w-md mx-gutter">
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
          <div className="flex items-center gap-md">
            
            {/* Desktop Categories */}
            <div className="hidden md:flex items-center gap-md">
              <Link to="/catalog?category=yu-gi-oh" className="text-on-surface-variant dark:text-outline-variant font-body-md text-body-md hover:text-primary dark:hover:text-primary-fixed hover:scale-105 transition-all">
                Yu-Gi-Oh
              </Link>
              <Link to="/catalog?category=pokemon" className="text-on-surface-variant dark:text-outline-variant font-body-md text-body-md hover:text-primary dark:hover:text-primary-fixed hover:scale-105 transition-all">
                Pokemon
              </Link>
              <Link to="/catalog?category=magic" className="text-on-surface-variant dark:text-outline-variant font-body-md text-body-md hover:text-primary dark:hover:text-primary-fixed hover:scale-105 transition-all">
                Magic
              </Link>
              <Link to="/catalog?category=board-games" className="text-on-surface-variant dark:text-outline-variant font-body-md text-body-md hover:text-primary dark:hover:text-primary-fixed hover:scale-105 transition-all">
                Board Games
              </Link>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-sm">
              
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

              {/* Account (Mock) */}
              <button 
                onClick={() => alert('¡Cuenta de usuario! (Simulación)')}
                className="p-2 text-on-surface-variant hover:text-primary hover:scale-105 active:scale-95 transition-all rounded-full hover:bg-surface-container-high"
                aria-label="Account"
              >
                <span className="material-symbols-outlined">account_circle</span>
              </button>

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
                className="p-2 md:hidden text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-high"
                aria-label="Menu"
              >
                <span className="material-symbols-outlined">
                  {mobileMenuOpen ? 'close' : 'menu'}
                </span>
              </button>

            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden px-margin-mobile pb-4 bg-surface border-t border-outline-variant/30 flex flex-col gap-sm">
            <Link 
              to="/catalog?category=yu-gi-oh" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-on-surface font-body-md hover:text-primary"
            >
              Yu-Gi-Oh
            </Link>
            <Link 
              to="/catalog?category=pokemon" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-on-surface font-body-md hover:text-primary"
            >
              Pokemon
            </Link>
            <Link 
              to="/catalog?category=magic" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-on-surface font-body-md hover:text-primary"
            >
              Magic
            </Link>
            <Link 
              to="/catalog?category=board-games" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-on-surface font-body-md hover:text-primary"
            >
              Board Games
            </Link>
          </div>
        )}
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
