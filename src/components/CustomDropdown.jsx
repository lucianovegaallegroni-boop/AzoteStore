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
  openDirection = 'auto', // 'auto' | 'down' | 'up'
  onEditOption = null,
  onDeleteOption = null
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

  // When dropdown is open, elevate parent stacking context so it floats above all other inputs/buttons
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const parent = dropdownRef.current.closest('.space-y-base, [class*="space-y"], .grid > div, form > div, tr, td');
      if (parent) {
        const prevZIndex = parent.style.zIndex;
        const prevPosition = parent.style.position;
        parent.style.zIndex = '100';
        if (!parent.style.position || parent.style.position === 'static') {
          parent.style.position = 'relative';
        }
        return () => {
          parent.style.zIndex = prevZIndex;
          parent.style.position = prevPosition;
        };
      }
    }
  }, [isOpen]);

  const handleSelect = (val) => {
    if (onChange) {
      onChange({ target: { value: val }, value: val, toString: () => val });
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
      className={`relative inline-block w-full ${isOpen ? 'z-30' : 'z-1'} ${isTransparent ? 'w-auto' : ''} ${
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
        <div className="flex items-center gap-2.5 min-w-0">
          {selectedOption?.icon && (
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0">
              {selectedOption.icon}
            </span>
          )}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
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
          } bg-surface dark:bg-inverse-surface border border-outline-variant/40 rounded-xl shadow-2xl z-30 py-2 max-h-60 overflow-y-auto card-shadow animate-fade-in ${
            align === 'full' ? 'w-full' : 'min-w-[160px]'
          } ${menuClassName}`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            const isSpecialAction = opt.isAction || opt.value === '__ADD_NEW__';
            const canEdit = Boolean(onEditOption && !isSpecialAction && opt.value !== '');
            const canDelete = Boolean(onDeleteOption && !isSpecialAction && opt.value !== '');

            return (
              <div
                key={opt.value}
                className={`w-full flex items-center justify-between transition-colors ${
                  isSpecialAction
                    ? 'border-t border-outline-variant/30 mt-1 pt-1 bg-primary/5 hover:bg-primary/15 text-primary font-bold'
                    : isSelected
                    ? 'bg-primary/10 text-primary font-bold dark:bg-primary/20 dark:text-primary-fixed'
                    : 'text-on-surface dark:text-inverse-on-surface hover:bg-surface-container-high dark:hover:bg-surface-container-low'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className="flex-1 text-left px-4 py-3 md:py-2.5 text-sm flex items-center justify-between font-semibold min-w-0 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {opt.icon && (
                      <span className={`material-symbols-outlined text-[18px] shrink-0 ${
                        isSelected || isSpecialAction ? 'text-primary' : 'text-on-surface-variant'
                      }`}>
                        {opt.icon}
                      </span>
                    )}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && !isSpecialAction && (
                    <span className="material-symbols-outlined text-[16px] text-primary dark:text-primary-fixed shrink-0">
                      check
                    </span>
                  )}
                </button>

                {(canEdit || canDelete) && (
                  <div className="flex items-center gap-0.5 pr-2 shrink-0">
                    {canEdit && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsOpen(false);
                          onEditOption(opt);
                        }}
                        className="p-1.5 rounded-lg hover:bg-secondary/15 text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"
                        title={`Editar "${opt.label}"`}
                      >
                        <span className="material-symbols-outlined text-[16px] block">edit</span>
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsOpen(false);
                          onDeleteOption(opt);
                        }}
                        className="p-1.5 rounded-lg hover:bg-error/15 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                        title={`Eliminar "${opt.label}"`}
                      >
                        <span className="material-symbols-outlined text-[16px] block">delete</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
