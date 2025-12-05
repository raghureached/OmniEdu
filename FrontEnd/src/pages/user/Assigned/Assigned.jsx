// import React, { useState } from 'react';
// import './Assigned.css';
// import { useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import { useDispatch } from 'react-redux';
// import { fetchUserAssignments } from '../../../store/slices/userAssignmentSlice';
// import { CourseCard } from '../Cards/ContentCards';
// import LoadingScreen from '../../../components/common/Loading/Loading';

// const Assigned = () => {
//   const dispatch = useDispatch();
//   const [loading, setLoading] = useState(false);
//   useEffect(() => {
//     setLoading(true);
//     dispatch(fetchUserAssignments()).then(() => setLoading(false));
//   }, []);
//   const [activeTab, setActiveTab] = useState('training');
//   // const assignments = useSelector(state => state.userAssignments);
  

//   const currentItems= [];
//   if(loading){
//     return <LoadingScreen text="Loading Assignments" />
//   }

//   return (
//     <div className="assigned-container">
//       <div className="assigned-header">
//         {/* <p>These are assigned by your organization</p>   */}
        
//       </div>

//       <div className="assigned-content">
//         {currentItems.length > 0 ? (
//           <div className="assigned-grid">
//             {currentItems.map(item => (
              
//               item?.assignment_id?.contentId && <CourseCard key={item.id} assign_id={item.assignment_id._id} data={item.assignment_id.contentId} status={item.status} progressPct={item.progress_pct} contentType={item.contentType}/>
//             ))}
//           </div>
//         ) : (
//           <div className="assigned-empty-state">
//             <p>You currently have no {activeTab === 'training' ? 'assigned trainings' : 'assignments'}.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Assigned;