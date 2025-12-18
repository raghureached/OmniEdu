import React, { useEffect, useRef, useState } from "react";
import "./DropDown.css";

const CustomSelect = ({
  value,
  options,
  placeholder = "Select option",
  onChange,
  disabled = false,
  searchable = true
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className={`custom-select ${disabled ? "disabled" : ""} ${open ? "open" : ""}`}
      ref={wrapperRef}
    >
      <div
        className="custom-select-trigger"
        onClick={() => !disabled && setOpen(prev => !prev)}
      >
        <span>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={`arrow ${open ? "open" : ""}`} />
      </div>

      {open && (
        <div className="custom-select-options">
          {searchable && (
            <div className="custom-select-search">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {filteredOptions.length > 0 ? (
            filteredOptions.map(opt => (
              <div
                key={opt.value}
                className={`custom-select-option ${
                  opt.value === value ? "selected" : ""
                }`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div className="custom-select-no-results">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
