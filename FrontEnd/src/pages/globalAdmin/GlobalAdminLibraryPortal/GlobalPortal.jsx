

// // export default GlobalPortalActivity;
// import React, { useState, useEffect, useMemo } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// // import { fetchContent } from '../../../store/slices/contentSlice';
// import { Search, Filter, Plus } from 'lucide-react';
// import './GlobalPortal.css';
// import { fetchGlobalAssignments } from '../../../store/slices/globalAssignmentSlice';

// const GlobalPortalActivity = () => {
//   const dispatch = useDispatch();
//   const { content, loading } = useSelector((state) => state.globalAssignments);
//   // console.log(content)
//   const navigate = useNavigate();

//   // Fetch content when component mounts
//   useEffect(() => {
//     dispatch(fetchGlobalAssignments());
//   }, [dispatch]);

//   // Filters state
//   const [nameSearch, setNameSearch] = useState("");
//   const [typeFilter, setTypeFilter] = useState("all");
//   const [tagSearch, setTagSearch] = useState("");
//   const [filteredItems, setFilteredItems] = useState(content);

//   // Apply filters whenever filter values or items change
//   useEffect(() => {
//     let filtered = content;

//     if (nameSearch) {
//       filtered = filtered.filter(item =>
//         item.contentName?.toLowerCase().includes(nameSearch.toLowerCase())
//       );
//     }

//     if (typeFilter !== "all") {
//       filtered = filtered.filter(
//         item => item.contentId.type?.toLowerCase() === typeFilter.toLowerCase()
//       );
//     }

//     if (tagSearch) {
//       filtered = filtered.filter(item =>
//         item.tags?.some(tag =>
//           tag.toLowerCase().includes(tagSearch.toLowerCase())
//         )
//       );
//     }

//     setFilteredItems(filtered);
//   }, [content, nameSearch, typeFilter, tagSearch]);

//   const handleAddContent = (type) => {
//     // switch(type) {
//     //   case 'Module': navigate('/admin/content-modules'); break;
//     //   case 'Assessment': navigate('/admin/content-assessments'); break;
//     //   case 'LearningPath': navigate('/admin/learning-paths'); break;
//     //   case 'Survey': navigate('/admin/manage-surveys'); break;
//     //   default: break;
//     // }
//     navigate('/global-admin/content');
//   };

//   const getStatusBadgeClass = (isActive) => `status-badge ${isActive ? "active" : "inactive"}`;

//   return (
//     <div className="global-portal-activity-container">
//       <div className="global-portal-filters-section">
//         <div className="global-portal-search-filter">
//           <label>Name:</label>
//           <div className="global-portal-search-input">
//             <Search size={20} />
//             <input
//               type="text"
//               placeholder="Search by name..."
//               value={nameSearch}
//               onChange={(e) => setNameSearch(e.target.value)}
//             />
//           </div>
//         </div>

//         <div className="global-portal-type-filter">
//           <label>Type:</label>
//           <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
//             <option value="all">All Types</option>
//             <option value="module">Module</option>
//             <option value="assessment">Assessment</option>
//             <option value="learning-path">Learning Path</option>
//             <option value="survey">Survey</option>
//           </select>
//         </div>

//         <div className="global-portal-search-filter">
//           <label>Tag:</label>
//           <div className="global-portal-search-input">
//             <Search size={20} />
//             <input
//               type="text"
//               placeholder="Search by tag..."
//               value={tagSearch}
//               onChange={(e) => setTagSearch(e.target.value)}
//             />
//           </div>
//         </div>

//         <button className="global-portal-filter-button">
//           <Filter size={20} />
//           Filter
//         </button>
//       </div>

//       <div className="global-portal-actions-section">
//         <button className="global-portal-add-button" onClick={() => handleAddContent('Module')}>
//           <Plus size={20} /> Add Content
//         </button>
//       </div>

//       <div className="global-portal-content-grid">
       
//         {!loading && content.length === 0 && <p>No content found</p>}

//         {content.map(item => (
//           <div key={item._id} className="global-portal-content-card">
//             <div className="global-portal-content-card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
//               <h3>{item?.contentName?.charAt(0).toUpperCase() + item?.contentName?.slice(1)}</h3>
//               <div className="global-portal-content-type">{item?.contentId?.type}</div>
//             </div>

//             <div className="global-portal-content-meta">
//               {/* <span>Team: {item.team}</span> */}
//               <span className={getStatusBadgeClass(item?.contentId?.is_active == true ? "Active" : "Inactive")}>
//                 Status: {item?.contentId?.is_active ? "Active" : "Inactive"}
//               </span>
//             </div>

//             {/* <div className="global-portal-content-tags" style={{display:"none"}}>
//               {item.tags.map((tag, idx) => (
//                 <span key={idx} className="global-portal-tag">{tag}</span>
//               ))}
//             </div> */}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default GlobalPortalActivity;




// export default GlobalPortalActivity;
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
// import { fetchContent } from '../../../store/slices/contentSlice';
import { Search, Filter, Plus } from 'lucide-react';
import './GlobalPortal.css';
import { fetchGlobalAssignments } from '../../../store/slices/globalAssignmentSlice';

const TEAMS = ["Tech", "Design", "Marketing", "HR", "Operations"];
const TAGS = ["frontend", "backend", "design", "marketing", "HR", "web-development", "career-path", "assessment"];

const GlobalPortalActivity = () => {
  const dispatch = useDispatch();
  const { content, loading } = useSelector((state) => state.globalAssignments);
  console.log(content)
  const navigate = useNavigate();

  // Fetch content when component mounts
  useEffect(() => {
    dispatch(fetchGlobalAssignments());
  }, [dispatch]);

  // Filters state
  const [nameSearch, setNameSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [tagSearch, setTagSearch] = useState("");

  // Assign random team and random tags **once** per item
  // const itemsWithExtras = useMemo(() => {
  //   return content.map(item => ({
  //     ...item,
  //     team: TEAMS[Math.floor(Math.random() * TEAMS.length)],
  //     tags: Array.from({ length: 2 }, () => TAGS[Math.floor(Math.random() * TAGS.length)])
  //   }));
  // }, [content]);

  // Filtered items state
  const [filteredItems, setFilteredItems] = useState(content);

  // Apply filters whenever filter values or items change
  useEffect(() => {
    let filtered = content;

    if (nameSearch) {
      filtered = filtered.filter(item =>
        item.contentName?.toLowerCase().includes(nameSearch.toLowerCase())
      );
    }

    // if (typeFilter !== "all") {
    //   filtered = filtered.filter(
    //     item => item.contentId.type?.toLowerCase() === typeFilter.toLowerCase()
    //   );
    // }
    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (item) =>
          item?.contentId?.type?.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    if (tagSearch) {
      filtered = filtered.filter((item) =>
        item?.tags?.some((tag) =>
          tag?.toLowerCase().includes(tagSearch.toLowerCase())
        )
      );
    }

    setFilteredItems(filtered);
  }, [content, nameSearch, typeFilter, tagSearch]);

  const handleAddContent = (type) => {
    navigate('/global-admin/content');
  }

const getStatusBadgeClass = (isActive) =>
    `status-badge ${
      isActive === true ? "active" : isActive === false ? "inactive" : ""
    }`;

  return (
    <div className="global-portal-activity-container">
      <div className="global-portal-filters-section">
        <div className="global-portal-search-filter">
          <label>Name:</label>
          <div className="global-portal-search-input">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name..."
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="global-portal-type-filter">
          <label>Type:</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="module">Module</option>
            <option value="assessment">Assessment</option>
            <option value="learning-path">Learning Path</option>
            <option value="survey">Survey</option>
          </select>
        </div>

        <div className="global-portal-search-filter">
          <label>Tag:</label>
          <div className="global-portal-search-input">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by tag..."
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
            />
          </div>
        </div>

        <button className="global-portal-filter-button">
          <Filter size={20} />
          Filter
        </button>
      </div>

      <div className="global-portal-actions-section">
        <button className="global-portal-add-button" onClick={() => handleAddContent('Module')}>
          <Plus size={20} /> Add Content
        </button>
        {/* <button className="global-portal-add-button" onClick={() => handleAddContent('Assessment')}>
          <Plus size={20} /> Add Assessment
        </button>
        <button className="global-portal-add-button" onClick={() => handleAddContent('LearningPath')}>
          <Plus size={20} /> Add Learning Path
        </button>
        <button className="global-portal-add-button" onClick={() => handleAddContent('Survey')}>
          <Plus size={20} /> Add Survey
        </button> */}
      </div>

      <div className="global-portal-content-grid">
       
        {!loading && content.length === 0 && <p>No content found</p>}

        {filteredItems.map(item => (
          <div key={item._id} className="global-portal-content-card">
            <div className="global-portal-content-card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3>{item?.contentName?.charAt(0).toUpperCase() + item?.contentName?.slice(1)}</h3>
              <div className="global-portal-content-type">{item?.contentId?.type}</div>
            </div>

            <div className="global-portal-content-meta">
              {/* <span>Team: {item.team}</span> */}
              <span className={getStatusBadgeClass(item?.contentId?.is_active)}>
                Status: {item?.contentId?.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            {/* <div className="global-portal-content-tags" style={{display:"none"}}>
              {item.tags.map((tag, idx) => (
                <span key={idx} className="global-portal-tag">{tag}</span>
              ))}
            </div> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobalPortalActivity;

