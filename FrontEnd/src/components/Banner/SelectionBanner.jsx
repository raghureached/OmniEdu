import React from 'react';
import { X, Loader } from 'lucide-react';
import './SelectionBanner.css'

/**
 * SelectionBanner - A reusable component for displaying selection state
 * Similar to Gmail/UserManagement selection UI
 * 
 * @param {Object} props
 * @param {string} props.selectionScope - 'none' | 'page' | 'all' | 'custom'
 * @param {number} props.selectedCount - Number of selected items
 * @param {number} props.currentPageCount - Items on current page
 * @param {number} props.totalCount - Total items across all pages
 * @param {Function} props.onClearSelection - Callback to clear selection
 * @param {Function} props.onSelectAllPages - Callback to select all pages
 * @param {boolean} props.selectAllLoading - Loading state for select all
 * @param {string} props.itemType - Type of items (e.g., 'user', 'group', 'assessment')
 * @param {string} props.variant - 'default' | 'compact' | 'minimal'
 * @param {Array} props.leftActions - Left side action buttons [{label, onClick, variant?, disabled?, icon?}]
 */
const SelectionBanner = ({
  selectionScope = 'none',
  selectedCount = 0,
  currentPageCount = 0,
  totalCount = 0,
  onClearSelection,
  onSelectAllPages,
  selectAllLoading = false,
  itemType = 'item',
  variant = 'default',
  leftActions = [],
  showWelcomeMessage = true
}) => {

  // Don't render if no selection and no welcome message
  if (selectionScope === 'none' && selectedCount === 0 && !showWelcomeMessage) {
    return null;
  }

  const pluralizedItemType = selectedCount === 1 ? itemType : `${itemType}s`;

  // Render welcome message when nothing is selected
  const renderWelcomeMessage = () => {
    const welcomeMessages = {
      user: "Welcome to the Users table — manage, assign, and organize your users effortlessly 🎉.",
      users: "Welcome to the Users table — manage, assign, and organize your users effortlessly 🎉.",
      group: "Welcome to the Groups table — manage, organize, and oversee your teams effortlessly 🎉.",
      groups: "Welcome to the Groups table — manage, organize, and oversee your teams effortlessly 🎉.",
      assessment: "Welcome to the Assessments table — create, manage, and track your assessments effortlessly 🎉.",
      assessments: "Welcome to the Assessments table — create, manage, and track your assessments effortlessly 🎉.",
      team: "Welcome to the Teams table — manage, organize, and oversee your teams effortlessly 🎉.",
      teams: "Welcome to the Teams table — manage, organize, and oversee your teams effortlessly 🎉.",
      default: `Welcome to the ${itemType.charAt(0).toUpperCase() + itemType.slice(1)} table — manage and organize your ${itemType}s effortlessly 🎉.`
    };
    
    return welcomeMessages[itemType] || welcomeMessages.default;
  };

  // Render message text based on selection scope
  const renderMessage = () => {
    // Show welcome message if nothing is selected
    if (selectionScope === 'none' || selectedCount === 0) {
      return <span>{renderWelcomeMessage()}</span>;
    }

    switch (selectionScope) {
      case 'page':
        return (
          <span>
            All <strong>{currentPageCount}</strong> {currentPageCount === 1 ? itemType : `${itemType}s`} on this page are selected.
          </span>
        );

      case 'all':
        return (
          <span>
            All <strong>{selectedCount}</strong> {pluralizedItemType} are selected across all pages.
          </span>
        );

      case 'custom':
      default:
        return (
          <span>
            <strong>{selectedCount}</strong> {pluralizedItemType} selected.
          </span>
        );
    }
  };

  // Render action buttons based on selection scope
  const renderActionButtons = () => {
    // Don't show action buttons when nothing is selected
    if (selectionScope === 'none' || selectedCount === 0) {
      return [];
    }

    const buttons = [];

    // Show "Select all" button if not all are selected and totalCount > selectedCount
    if (selectionScope !== 'all' && totalCount > selectedCount && onSelectAllPages) {
      buttons.push(
        <button
          key="select-all"
          type="button"
          className="table-selection-banner__button"
          style={{background:"linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%)",border:"none",color:"white"}}
          onClick={onSelectAllPages}
          disabled={selectAllLoading}
        >
          {selectAllLoading ? (
            <>
              <Loader size={14} className="table-selection-banner__spinner" />
              Selecting all {itemType}s...
            </>
          ) : (
            `Select all ${totalCount} ${totalCount === 1 ? itemType : `${itemType}s`}`
          )}
        </button>
      );
    }

    // Always show "Clear selection" button
    if (onClearSelection) {
      buttons.push(
        <button
          key="clear"
          type="button"
          className="table-selection-banner__button"
          onClick={onClearSelection}
        >
          Clear selection
        </button>
      );
    }

    return buttons;
  };

  return (
    <>
      
      <div className={`table-selection-banner table-selection-banner--${variant}`}>
        {/* Left side: Message text */}
        <div className="table-selection-banner__left">
          <div className="table-selection-banner__info" style={{padding:"9px 0px"}}>
            {renderMessage()}
          </div>
        </div>

        {/* Right side: Select all / Clear + Custom action buttons */}
        <div className="table-selection-banner__right">
          {/* Selection action buttons (Select all / Clear) */}
          <div className="table-selection-banner__actions">
            {renderActionButtons()}
          </div>

          {/* Custom action buttons */}
          {leftActions.length > 0 && (
            <div className="table-selection-banner__left-actions">
              {leftActions.map((action, index) => (
                <button
                  key={index}
                  type="button"
                  className={`table-selection-banner__button ${action.variant ? `table-selection-banner__button--${action.variant}` : ''}`}
                  onClick={action.onClick}
                  disabled={action.disabled || false}
                  title={action.title}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SelectionBanner;

// Demo component to show usage
// const SelectionBannerDemo = () => {
//   const [selectedCount, setSelectedCount] = React.useState(5);
//   const [selectionScope, setSelectionScope] = React.useState('custom');
//   const [loading, setLoading] = React.useState(false);

//   const handleSelectAll = () => {
//     setLoading(true);
//     setTimeout(() => {
//       setSelectedCount(150);
//       setSelectionScope('all');
//       setLoading(false);
//     }, 1500);
//   };

//   const handleClear = () => {
//     setSelectedCount(0);
//     setSelectionScope('none');
//   };

//   return (
//     <div style={{ padding: '40px', background: '#f9fafb', minHeight: '100vh' }}>
//       <h1 style={{ marginBottom: '32px', color: '#111827' }}>Selection Banner Component</h1>
      
//       <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
//         <button onClick={() => { setSelectedCount(5); setSelectionScope('custom'); }} style={buttonStyle}>Custom (5)</button>
//         <button onClick={() => { setSelectedCount(20); setSelectionScope('page'); }} style={buttonStyle}>Page (20)</button>
//         <button onClick={() => { setSelectedCount(150); setSelectionScope('all'); }} style={buttonStyle}>All (150)</button>
//       </div>

//       <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
//         <div>
//           <h3 style={{ marginBottom: '12px', color: '#374151' }}>Page Selection</h3>
//           <SelectionBanner
//             selectionScope="page"
//             selectedCount={20}
//             currentPageCount={20}
//             totalCount={150}
//             onClearSelection={handleClear}
//             onSelectAllPages={handleSelectAll}
//             selectAllLoading={loading}
//             itemType="user"
//             variant="default"
//             leftActions={[
//               {
//                 label: 'Export',
//                 onClick: () => alert('Exporting'),
//               },
//               {
//                 label: 'Assign to Team',
//                 onClick: () => alert('Assigning'),
//               },
//               {
//                 label: 'Delete',
//                 onClick: () => alert('Deleting'),
//                 variant: 'danger',
//                 icon: <X size={14} />
//               }
//             ]}
//           />
//         </div>

//         <div>
//           <h3 style={{ marginBottom: '12px', color: '#374151' }}>All Selected</h3>
//           <SelectionBanner
//             selectionScope="all"
//             selectedCount={150}
//             currentPageCount={20}
//             totalCount={150}
//             onClearSelection={handleClear}
//             itemType="user"
//             variant="default"
//             leftActions={[
//               {
//                 label: 'Export',
//                 onClick: () => alert('Exporting'),
//               },
//               {
//                 label: 'Delete',
//                 onClick: () => alert('Deleting'),
//                 variant: 'danger'
//               }
//             ]}
//           />
//         </div>

//         <div>
//           <h3 style={{ marginBottom: '12px', color: '#374151' }}>Custom Selection</h3>
//           <SelectionBanner
//             selectionScope="custom"
//             selectedCount={23}
//             currentPageCount={20}
//             totalCount={150}
//             onClearSelection={handleClear}
//             onSelectAllPages={handleSelectAll}
//             selectAllLoading={loading}
//             itemType="group"
//             variant="default"
//             leftActions={[
//               {
//                 label: 'Export',
//                 onClick: () => alert('Exporting'),
//               }
//             ]}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// const buttonStyle = {
//   padding: '8px 16px',
//   background: '#3b82f6',
//   color: 'white',
//   border: 'none',
//   borderRadius: '6px',
//   cursor: 'pointer',
//   fontSize: '14px',
//   fontWeight: '500'
// };

// export default SelectionBannerDemo;