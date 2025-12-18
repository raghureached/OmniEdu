import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import './SearchableDropdown.css';

const SearchableDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search...',
  disabled = false,
  className = '',
  optionLabel = 'label',
  optionValue = 'value',
  searchable = true,
  clearable = false,
  maxHeight = 200,
  noOptionsMessage = 'No options found',
  fullWidth = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    if (!searchable || !searchTerm) return true;
    const label = option[optionLabel]?.toString().toLowerCase() || '';
    return label.includes(searchTerm.toLowerCase());
  });

  // Get display value
  const getDisplayValue = () => {
    if (!value) return placeholder;
    const selectedOption = options.find(option => 
      option[optionValue] === value || option === value
    );
    return selectedOption ? selectedOption[optionLabel] : placeholder;
  };

  // Handle option selection
  const handleSelectOption = (option) => {
    const newValue = option[optionValue] || option;
    onChange(newValue);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  // Handle clear
  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    setSearchTerm('');
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        if (searchable) {
          setTimeout(() => searchInputRef.current?.focus(), 0);
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelectOption(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  return (
    <div 
      ref={dropdownRef}
      className={`searchable-dropdown ${fullWidth ? 'full-width' : ''} ${className} ${disabled ? 'disabled' : ''}`}
      onKeyDown={handleKeyDown}
    >
      {/* Dropdown Trigger */}
      <div 
        className="dropdown-trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="dropdown-value">
          {getDisplayValue()}
        </span>
        <div className="dropdown-trigger-icons">
          {clearable && value && (
            <button 
              className="clear-button"
              onClick={handleClear}
              type="button"
            >
              <X size={16} />
            </button>
          )}
          <ChevronDown 
            size={20} 
            className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
          />
        </div>
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="dropdown-content" style={{ maxHeight: `${maxHeight}px` }}>
          {/* Search Bar */}
          {searchable && (
            <div className="search-container">
              <Search size={16} className="search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="search-input"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(-1);
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Options List */}
          <div className="options-container">
            {filteredOptions.length === 0 ? (
              <div className="no-options">
                {noOptionsMessage}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = option[optionValue] === value || option === value;
                const isHighlighted = index === highlightedIndex;
                
                return (
                  <div
                    key={option[optionValue] || index}
                    className={`option-item ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                    onClick={() => handleSelectOption(option)}
                  >
                    {option[optionLabel]}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
