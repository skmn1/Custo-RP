import React, { useState, useRef, useEffect } from 'react';

/**
 * ComboBox – a fully custom combobox:
 *  - Typed free text is allowed (unlike a <select>)
 *  - Dropdown options filtered as you type
 *  - Single consistent chevron, no browser default
 *  - Fires onChange with the same { target: { name, value } } signature
 *    as a regular <input>, so it works as a drop-in replacement.
 */
const ComboBox = ({
  name,
  value = '',
  onChange,
  options = [],
  placeholder = '',
  disabled = false,
  error = false,
  autoFocus = false,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Keep query in sync when the external value changes while closed
  useEffect(() => {
    if (!open) setQuery(value || '');
  }, [value, open]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        commitAndClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  });

  const commitAndClose = () => {
    setOpen(false);
    setQuery(value || '');
  };

  const filtered = query.trim()
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);
    onChange({ target: { name, value: val } });
  };

  const handleFocus = () => {
    setQuery('');
    setOpen(true);
  };

  const handleBlur = () => {
    // Allow mousedown on a list item to fire first
    setTimeout(commitAndClose, 150);
  };

  const handleSelect = (option) => {
    onChange({ target: { name, value: option } });
    setQuery(option);
    setOpen(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      commitAndClose();
    } else if (e.key === 'ArrowDown' && filtered.length > 0) {
      e.preventDefault();
      setOpen(true);
    }
  };

  const base =
    'w-full pl-3 pr-8 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors bg-white';

  const stateClass = disabled
    ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
    : error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500 text-gray-900'
    : 'border-gray-300 focus:border-indigo-500 text-gray-900';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        name={name}
        value={open ? query : value || ''}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete="off"
        spellCheck={false}
        style={{ backgroundImage: 'none' }}
        className={`${base} ${stateClass}`}
      />

      {/* Chevron */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''} ${
            disabled ? 'text-gray-300' : 'text-gray-500'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown list */}
      {open && !disabled && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-52 overflow-y-auto">
          {filtered.map((option) => (
            <li
              key={option}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(option);
              }}
              className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors ${
                option === value
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
              }`}
            >
              <span>{option}</span>
              {option === value && (
                <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ComboBox;
