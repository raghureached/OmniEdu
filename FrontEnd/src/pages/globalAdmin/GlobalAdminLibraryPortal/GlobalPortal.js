// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { fetchContent, deleteContent, createContent, updateContent } from '../../../store/slices/contentSlice';
// import { Search, Filter, Plus } from 'lucide-react';
// import './GlobalPortal.css';



// const GlobalPortalActivity = () => {
//    const dispatch = useDispatch();
//   const { items, loading, error } = useSelector(
//     (state) => state.content
//   );

//   const navigate = useNavigate();

//   // Fetch content when component mounts
//   useEffect(() => {
//     dispatch(fetchContent());
//   }, [dispatch]);

//   // Filters state
//   const [nameSearch, setNameSearch] = useState("");
//   const [typeFilter, setTypeFilter] = useState("all");
//   const [tagSearch, setTagSearch] = useState("");
//   const [filteredItems, setFilteredItems] = useState(items);

//   // Apply filters whenever data or filter values change
//   useEffect(() => {
//     let filtered = items || [];

//     if (nameSearch) {
//       filtered = filtered.filter((item) =>
//         item.title?.toLowerCase().includes(nameSearch.toLowerCase())
//       );
//     }

//     if (typeFilter !== "all") {
//       filtered = filtered.filter(
//         (item) => item.type?.toLowerCase() === typeFilter.toLowerCase()
//       );
//     }

//     if (tagSearch) {
//       filtered = filtered.filter((item) =>
//         item.tags?.some((tag) =>
//           tag.toLowerCase().includes(tagSearch.toLowerCase())
//         )
//       );
//     }

//     setFilteredItems(filtered);
//   }, [ items,nameSearch, typeFilter, tagSearch]);

//   const handleAddContent = (type) => {
//     switch(type) {
//       case 'Module':
//         navigate('/admin/content-modules');
//         break;
//       case 'Assessment':
//         navigate('/admin/content-assessments');
//         break;
//       case 'LearningPath':
//         navigate('/admin/learning-paths');
//         break;
//       case 'Survey':
//         navigate('/admin/manage-surveys');
//         break;
//       default:
//         break;
//     }
//   };

//   const getStatusBadgeClass = (isActive) => {
//   return `status-badge ${isActive ? "active" : "inactive"}`;
// };


//   const handleFilter = () => {
//     // Additional filter logic if needed
//     console.log('Additional filtering applied');
//   };
// const capitalizeWords = (text = "") => {
//   if (!text) return "";
//   return text
//     .split(" ")
//     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(" ");
// };
// const sampleTags = [
//   "frontend",
//   "backend",
//   "assessment",
//   "learning",
//   "career-path",
//   "quiz",
//   "web-development",
//   "feedback",
//   "training",
//   "html",
//   "css",
//   "react",
// ];

// const sampleTeams = ["Tech", "Design", "Marketing", "HR", "Sales"];
// const getRandomTeam = () => {
//   const index = Math.floor(Math.random() * sampleTeams.length);
//   return sampleTeams[index];
// };

// const getRandomTags = (count = 2) => {
//   const shuffled = [...sampleTags].sort(() => 0.5 - Math.random());
//   return shuffled.slice(0, count);
// };
// useEffect(() => {
//   if (items && items.length > 0) {
//     const itemsWithExtras = items.map(item => ({
//       ...item,
//       tags: item.tags && item.tags.length > 0 ? item.tags : getRandomTags(3),
//       team: item.team || getRandomTeam()
//     }));
//     setFilteredItems(itemsWithExtras);
//   }
// }, [items]);


//   return (
//     <div className="global-portal-portal-activity-container">
//       {/* <h1>Portal Library</h1> */}
      
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

//         <button className="global-portal-filter-button" onClick={handleFilter}>
//           <Filter size={20} />
//           Filter
//         </button>
//       </div>

//       <div className="global-portal-actions-section">
//         <button className="global-portal-add-button" onClick={() => handleAddContent('Module')}>
//           <Plus size={20} />
//           Add Module
//         </button>
//         <button className="global-portal-add-button" onClick={() => handleAddContent('Assessment')}>
//           <Plus size={20} />
//           Add Assessment
//         </button>
//         <button className="global-portal-add-button" onClick={() => handleAddContent('LearningPath')}>
//           <Plus size={20} />
//           Add Learning Path
//         </button>
//         <button className="global-portal-add-button" onClick={() => handleAddContent('Survey')}>
//           <Plus size={20} />
//           Add Survey
//         </button>
//       </div>

//       <div className="global-portal-content-grid">
//          {loading && <p>Loading...</p>}
//         {error && <p className="global-portal-error">{error}</p>}
//         {!loading && filteredItems.length === 0 && (
//           <p>No content found</p>
//         )}
//         {filteredItems.map((item) => (
//           <div key={item._id} className="global-portal-content-card">
//             <div className="global-portal-content-type">{item.type}</div>
//             <h3>{capitalizeWords(item.title)}</h3>
//             <div className="global-portal-content-meta">
//               {item.team && <span>Team: {item.team}</span>}
//               <span className={getStatusBadgeClass(item.is_active)}>
//                 Status: {item.is_active ? "Active" : "Inactive"}
//               </span>
//             </div>
//             {/* <div className="global-portal-content-tags">
//               {item.tags.map((tag, index) => (
//                 <span key={index} className="global-portal-tag">{tag}</span>
//               ))}
//             </div> */}
// <div className="global-portal-content-tags">
//   {item.tags.map((tag, index) => (
//     <span key={index} className="global-portal-tag">{tag}</span>
//   ))}
// </div>

//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default GlobalPortalActivity;
// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { fetchContent } from '../../../store/slices/contentSlice';
// import { Search, Filter, Plus } from 'lucide-react';
// import './GlobalPortal.css';

// // Sample teams and tags
// const sampleTeams = ['Tech', 'HR', 'Marketing', 'Sales', 'Design'];
// const sampleTags = ['frontend', 'backend', 'assessment', 'html', 'css', 'javascript', 'career-path', 'feedback'];

// const GlobalPortalActivity = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { items = [], loading, error } = useSelector((state) => state.content);

//   // Filters state
//   const [nameSearch, setNameSearch] = useState('');
//   const [typeFilter, setTypeFilter] = useState('all');
//   const [tagSearch, setTagSearch] = useState('');
//   const [processedItems, setProcessedItems] = useState([]);

//   // Fetch content once
//   useEffect(() => {
//     dispatch(fetchContent());
//   }, [dispatch]);

//   // Process items: add stable random team/tags and capitalize title
//   useEffect(() => {
//     const newItems = items.map((item) => {
//       // Stable random team based on _id
//       const teamIndex = item._id.charCodeAt(0) % sampleTeams.length;
//       const team = sampleTeams[teamIndex];

//       // Stable random tags (pick 2-3 tags)
//       const tagSeed = item._id.charCodeAt(1) || 0;
//       const tags = [];
//       while (tags.length < 3) {
//         const t = sampleTags[(tagSeed + tags.length) % sampleTags.length];
//         if (!tags.includes(t)) tags.push(t);
//       }

//       // Capitalize first letter of title
//       const title = item.title
//         ? item.title.charAt(0).toUpperCase() + item.title.slice(1)
//         : '';

//       return {
//         ...item,
//         team,
//         tags,
//         title
//       };
//     });

//     setProcessedItems(newItems);
//   }, [items]);

//   // Apply filters
//   const filteredItems = processedItems.filter((item) => {
//     let matches = true;

//     if (nameSearch) {
//       matches = matches && item.title.toLowerCase().includes(nameSearch.toLowerCase());
//     }
//     if (typeFilter !== 'all') {
//       matches = matches && item.type.toLowerCase() === typeFilter.toLowerCase();
//     }
//     if (tagSearch) {
//       matches =
//         matches &&
//         item.tags.some((tag) => tag.toLowerCase().includes(tagSearch.toLowerCase()));
//     }

//     return matches;
//   });

//   // Status badge
//   const getStatusBadgeClass = (isActive) =>
//     `status-badge ${isActive ? 'active' : 'inactive'}`;

//   // Navigate handlers
//   const handleAddContent = (type) => {
//     switch (type) {
//       case 'Module':
//         navigate('/admin/content-modules');
//         break;
//       case 'Assessment':
//         navigate('/admin/content-assessments');
//         break;
//       case 'LearningPath':
//         navigate('/admin/learning-paths');
//         break;
//       case 'Survey':
//         navigate('/admin/manage-surveys');
//         break;
//       default:
//         break;
//     }
//   };

//   return (
//     <div className="global-portal-portal-activity-container">
//       {/* Filters Section */}
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
//           <Filter size={20} /> Filter
//         </button>
//       </div>

//       {/* Actions Section */}
//       <div className="global-portal-actions-section">
//         <button className="global-portal-add-button" onClick={() => handleAddContent('Module')}>
//           <Plus size={20} /> Add Module
//         </button>
//         <button className="global-portal-add-button" onClick={() => handleAddContent('Assessment')}>
//           <Plus size={20} /> Add Assessment
//         </button>
//         <button className="global-portal-add-button" onClick={() => handleAddContent('LearningPath')}>
//           <Plus size={20} /> Add Learning Path
//         </button>
//         <button className="global-portal-add-button" onClick={() => handleAddContent('Survey')}>
//           <Plus size={20} /> Add Survey
//         </button>
//       </div>

//       {/* Content Grid */}
//       <div className="global-portal-content-grid">
//         {loading && <p>Loading...</p>}
//         {error && <p className="global-portal-error">{error}</p>}
//         {!loading && filteredItems.length === 0 && <p>No content found</p>}

//         {filteredItems.map((item) => (
//           <div key={item._id} className="global-portal-content-card">
//             <div className="global-portal-content-type">{item.type}</div>
//             <h3>{item.title}</h3>
//             <div className="global-portal-content-meta">
//               <span>Team: {item.team}</span>
//               <span className={getStatusBadgeClass(item.is_active)}>
//                 Status: {item.is_active ? 'Active' : 'Inactive'}
//               </span>
//             </div>
//             <div className="global-portal-content-tags">
//               {item.tags.map((tag, index) => (
//                 <span key={index} className="global-portal-tag">
//                   {tag}
//                 </span>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default GlobalPortalActivity;
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchContent } from '../../../store/slices/contentSlice';
import { Search, Filter, Plus } from 'lucide-react';
import './GlobalPortal.css';

const TEAMS = ["Tech", "Design", "Marketing", "HR", "Operations"];
const TAGS = ["frontend", "backend", "design", "marketing", "HR", "web-development", "career-path", "assessment"];

const GlobalPortalActivity = () => {
  const dispatch = useDispatch();
  const { items = [], loading, error } = useSelector((state) => state.content);
  const navigate = useNavigate();

  // Fetch content when component mounts
  useEffect(() => {
    dispatch(fetchContent());
  }, [dispatch]);

  // Filters state
  const [nameSearch, setNameSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [tagSearch, setTagSearch] = useState("");

  // Assign random team and random tags **once** per item
  const itemsWithExtras = useMemo(() => {
    return items.map(item => ({
      ...item,
      team: TEAMS[Math.floor(Math.random() * TEAMS.length)],
      tags: Array.from({ length: 2 }, () => TAGS[Math.floor(Math.random() * TAGS.length)])
    }));
  }, [items]);

  // Filtered items state
  const [filteredItems, setFilteredItems] = useState(itemsWithExtras);

  // Apply filters whenever filter values or items change
  useEffect(() => {
    let filtered = itemsWithExtras;

    if (nameSearch) {
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(nameSearch.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(
        item => item.type?.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    if (tagSearch) {
      filtered = filtered.filter(item =>
        item.tags?.some(tag =>
          tag.toLowerCase().includes(tagSearch.toLowerCase())
        )
      );
    }

    setFilteredItems(filtered);
  }, [itemsWithExtras, nameSearch, typeFilter, tagSearch]);

  const handleAddContent = (type) => {
    // switch(type) {
    //   case 'Module': navigate('/admin/content-modules'); break;
    //   case 'Assessment': navigate('/admin/content-assessments'); break;
    //   case 'LearningPath': navigate('/admin/learning-paths'); break;
    //   case 'Survey': navigate('/admin/manage-surveys'); break;
    //   default: break;
    // }
    navigate('/global-admin/content');
  };

  const getStatusBadgeClass = (isActive) => `status-badge ${isActive ? "active" : "inactive"}`;

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
       
        {!loading && filteredItems.length === 0 && <p>No content found</p>}

        {filteredItems.map(item => (
          <div key={item._id} className="global-portal-content-card">
            <div className="global-portal-content-card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3>{item.title.charAt(0).toUpperCase() + item.title.slice(1)}</h3>
              <div className="global-portal-content-type">{item.type}</div>
            </div>

            <div className="global-portal-content-meta">
              {/* <span>Team: {item.team}</span> */}
              <span className={getStatusBadgeClass(item.is_active)}>
                Status: {item.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="global-portal-content-tags" style={{display:"none"}}>
              {item.tags.map((tag, idx) => (
                <span key={idx} className="global-portal-tag">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobalPortalActivity;

