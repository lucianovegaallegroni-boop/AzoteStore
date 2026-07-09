import React, { useState, useEffect, useRef } from 'react';

/**
 * A highly customizable dropdown component that replaces standard HTML <select>.
 * Optimized for mobile touch targets and desktop screens.
 */
export default function CustomDropdown({
  value,
  onChange,
  options = [],
  className = '',
  menuClassName = '',
  disabled = false,
  placeholder = 'Seleccione una opción',
  align = 'left', // 'left' | 'right' | 'full'
  openDirection = 'auto' // 'auto' | 'down' | 'up'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldOpenUp, setShouldOpenUp] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      if (openDirection === 'up') {
        setShouldOpenUp(true);
      } else if (openDirection === 'down') {
        setShouldOpenUp(false);
      } else {
        // Measure space below dropdown relative to viewport height
        const rect = dropdownRef.current.getBoundingClientRect();
        const spaceBelowViewport = window.innerHeight - rect.bottom;

        // Measure space below dropdown relative to its nearest overflow/scroll parent
        let spaceBelowParent = Infinity;
        let parent = dropdownRef.current.parentElement;
        while (parent && parent !== document.body) {
          const style = window.getComputedStyle(parent);
          const overflowY = style.overflowY || '';
          const overflowX = style.overflowX || '';
          const overflow = style.overflow || '';
          
          const isScrollable = 
            overflowY.includes('auto') || overflowY.includes('scroll') || overflowY.includes('hidden') ||
            overflowX.includes('auto') || overflowX.includes('scroll') || overflowX.includes('hidden') ||
            overflow.includes('auto') || overflow.includes('scroll') || overflow.includes('hidden');

          if (isScrollable) {
            const parentRect = parent.getBoundingClientRect();
            spaceBelowParent = parentRect.bottom - rect.bottom;
            break;
          }
          parent = parent.parentElement;
        }

        const spaceBelow = Math.min(spaceBelowViewport, spaceBelowParent);
        
        // Adapt threshold height: short menus (~160px), longer menus (~250px)
        const requiredSpace = options.length <= 3 ? 160 : 250;
        setShouldOpenUp(spaceBelow < requiredSpace);
      }
    }
  }, [isOpen, openDirection, options.length]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (val) => {
    if (onChange) {
      onChange({ target: { value: val } });
    }
    setIsOpen(false);
  };

  // Determine button styles
  const isTransparent = className.includes('bg-transparent');
  
  const buttonStyles = isTransparent
    ? `flex items-center gap-1.5 focus:outline-none outline-none text-left cursor-pointer ${className}`
    : `w-full flex items-center justify-between gap-2 px-4 py-3 bg-surface-container-low dark:bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-sm text-on-surface hover:border-primary/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 outline-none text-left cursor-pointer ${className}`;

  // Menu positioning
  let menuPositionClass = 'left-0';
  if (align === 'right') menuPositionClass = 'right-0';
  if (align === 'full') menuPositionClass = 'left-0 right-0';

  return (
    <div
      className={`relative inline-block w-full ${isTransparent ? 'w-auto' : ''} ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      }`}
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={buttonStyles}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <span
          className="material-symbols-outlined text-[18px] text-on-surface-variant transition-transform duration-200 shrink-0"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
        >
          expand_more
        </span>
      </button>

      {isOpen && (
        <div
          className={`absolute ${menuPositionClass} ${
            shouldOpenUp ? 'bottom-full mb-2' : 'top-full mt-2'
          } bg-surface dark:bg-inverse-surface border border-outline-variant/40 rounded-xl shadow-xl z-50 py-2 max-h-60 overflow-y-auto card-shadow animate-fade-in ${
            align === 'full' ? 'w-full' : 'min-w-[160px]'
          } ${menuClassName}`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-4 py-3 md:py-2.5 text-sm transition-colors flex items-center justify-between font-semibold ${
                  isSelected
                    ? 'bg-primary/10 text-primary font-bold dark:bg-primary/20 dark:text-primary-fixed'
                    : 'text-on-surface dark:text-inverse-on-surface hover:bg-surface-container-high dark:hover:bg-surface-container-low'
                }`}
              >
                <span className="truncate pr-4">{opt.label}</span>
                {isSelected && (
                  <span className="material-symbols-outlined text-[16px] text-primary dark:text-primary-fixed shrink-0">
                    check
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
