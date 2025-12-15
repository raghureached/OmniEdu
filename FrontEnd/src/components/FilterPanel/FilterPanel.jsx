import "./FilterPanel.css";

const FilterPanel = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fp-overlay" onClick={onClose}></div>}

      {/* Panel */}
      <div className={`fp-panel ${isOpen ? "fp-open" : ""}`}>
        <div className="fp-header">
          <h3>Filters</h3>
          <button className="fp-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="fp-body">
          <div className="fp-group">
            <label>Category</label>
            <select>
              <option>All</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>

          <div className="fp-group">
            <label>Duration</label>
            <input type="range" />
          </div>

          <button className="fp-apply-btn">Apply Filters</button>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;
