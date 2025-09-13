




// ////testing code
//   import React, { useEffect } from "react";
// import { Outlet, Link, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { logout } from "../../../store/slices/authSlice";
// import { fetchOrganizations } from "../../../store/slices/organizationSlice";
// import "./GlobalAdminLayout.css";

// const GlobalAdminLayout = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.auth);
//   const { organizations } = useSelector((state) => state.organizations);

//   useEffect(() => {
//     dispatch(fetchOrganizations({}));
//   }, [dispatch]);

//   const handleLogout = () => {
//     dispatch(logout()).then(() => {
//       navigate("/");
//     });
//   };

//   return (
//     <div className="global-admin-layout">
//       <nav className="sidebar">
//         <div className="sidebar-header">
//           <h3>OmniEdu Global Admin</h3>
//           <div className="user-info">
//             <span>{user?.name}</span>
//             <small>{user?.email}</small>
//           </div>
//         </div>

//         {organizations.length > 0 && (
//           <div className="org-selector">
//             <label>Organization:</label>
//             <select>
//               {organizations.map((org) => (
//                 <option key={org.id} value={org.id}>
//                   {org.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         )}

//         <ul className="sidebar-menu">
//           <li>
//             <Link to="/global-admin">Global Admin Home</Link>
//           </li>
//           <li>
//             <Link to="/global-admin/organizations">Manage Organizations</Link>
//           </li>
//           <li>
//             <Link to="/global-admin/roles">Manage Roles</Link>
//           </li>
//           <li>
//             <Link to="/global-admin/content">Manage Content</Link>
//           </li>
//           <li>
//             <Link to="/global-admin/surveys">Manage Surveys</Link>
//           </li>
//         </ul>

//         <div className="sidebar-footer">
//           <button onClick={handleLogout} className="logout-btn">
//             Logout
//           </button>
//         </div>
//       </nav>

//       <main className="content">
//         <header className="content-header">
//           <h2>Global Admin Dashboard</h2>
//         </header>
//         <div className="content-body">
//           <Outlet />
//         </div>
//       </main>
//     </div>
//   );
// };

// export default GlobalAdminLayout;

////admin code
 import React, { useState, useEffect } from 'react';
 import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
 import { useDispatch, useSelector } from 'react-redux';
 import { logout } from '../../../store/slices/authSlice';
 import { fetchNotifications, markNotificationAsRead } from '../../../store/slices/notificationSlice';
import './GlobalAdminLayout.css';
 import { fetchOrganizations } from "../../../store/slices/organizationSlice";
 import { Menu, Home, Users, UserCheck, Shield, BookOpen,Building2, CheckCircle, Award, UserRoundPen, BookCopy, Clock, User, HelpCircle, LogOut, Bell, X, BarChart, MessageCircle } from 'lucide-react';
 
 const GlobalAdminLayout = () => {
   const dispatch = useDispatch();
   const navigate = useNavigate();
   const location = useLocation();
   const { user } = useSelector((state) => state.auth);
   const { organizations } = useSelector((state) => state.organizations);

   const { items: notifications, unreadCount } = useSelector(
     (state) => state.notifications
   );
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
   const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
   const [notificationsOpen, setNotificationsOpen] = useState(false);

     useEffect(() => {
       dispatch(fetchOrganizations({}));
     }, [dispatch]);
   // Fetch notifications on component mount
   useEffect(() => {
     dispatch(fetchNotifications());
   }, [dispatch]);

   // Close mobile menu when location changes
   useEffect(() => {
     setMobileMenuOpen(false);
   }, [location.pathname]);

   // Close profile dropdown when clicking outside
   useEffect(() => {
     const handleClickOutside = (event) => {
       if (
         profileDropdownOpen &&
         !event.target.closest(".admin_profile_container")
       ) {
         setProfileDropdownOpen(false);
       }
       if (
         notificationsOpen &&
         !event.target.closest(".admin_notification_container")
       ) {
         setNotificationsOpen(false);
       }
     };

     document.addEventListener("mousedown", handleClickOutside);
     return () => {
       document.removeEventListener("mousedown", handleClickOutside);
     };
   }, [profileDropdownOpen, notificationsOpen]);

   const handleLogout = () => {
     dispatch(logout()).then(() => {
       navigate("/");
     });
   };

   // Function to check if a link is active
   const isActive = (path) => {
     return (
       location.pathname === path || location.pathname.startsWith(`${path}/`)
     );
   };

   const toggleMobileMenu = () => {
     setMobileMenuOpen(!mobileMenuOpen);
   };

   const toggleSidebar = () => {
     setSidebarCollapsed(!sidebarCollapsed);
   };

   const toggleProfileDropdown = () => {
     setProfileDropdownOpen(!profileDropdownOpen);
   };

   const toggleNotifications = () => {
     setNotificationsOpen(!notificationsOpen);
   };

   const handleNotificationClick = (notificationId) => {
     dispatch(markNotificationAsRead(notificationId));
   };

   const navigateToProfile = () => {
     navigate("/admin/profile");
     setProfileDropdownOpen(false);
   };

   // Function to get user initials
   const getUserInitials = () => {
     if (!user || !user.name) return "A";

     const nameParts = user.name.split(" ");
     if (nameParts.length >= 2) {
       return `${nameParts[0].charAt(0)}${nameParts[1].charAt(
         0
       )}`.toUpperCase();
     }

     return user.name.substring(0, 2).toUpperCase();
   };

   // Function to format notification date
   const formatNotificationDate = (dateString) => {
     const date = new Date(dateString);
     const now = new Date();
     const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

     if (diffInHours < 1) {
       return "Just now";
     } else if (diffInHours < 24) {
       return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
     } else {
       const diffInDays = Math.floor(diffInHours / 24);
       return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
     }
   };

   return (
     <div className="globaladmin_layout_container">
       {/* Overlay for mobile */}
       {mobileMenuOpen && (
         <div
           className="globaladmin_sidebar_overlay"
           onClick={toggleMobileMenu}
         ></div>
       )}

       <nav
         className={`globaladmin_sidebar ${
           mobileMenuOpen ? "globaladmin_sidebar_open" : ""
         } ${sidebarCollapsed ? "globaladmin_sidebar_collapsed" : ""}`}
       >
         <div className="globaladmin_sidebar_header">
           <div className="globaladmin_logo_container">
             <button
               className="globaladmin_menu_toggle"
               onClick={toggleSidebar}
             >
               <Menu size={24} />
             </button>
             <div className="globaladmin_logo">
               {sidebarCollapsed ? (
                 <span className="globaladmin_logo_small"></span>
               ) : (
                 <h3>OmniEdu</h3>
               )}
             </div>
           </div>
         </div>

         {/* {organizations.length > 0 && (
           <div className="org-selector">
             <label>Organization:</label>
             <select>
               {organizations.map((org) => (
                 <option key={org.id} value={org.id}>
                   {org.name}
                 </option>
               ))}
             </select>
           </div>
         )} */}
         <ul className="globaladmin_sidebar_menu">
           {/* home */}
           <li>
             <Link
               to="/global-admin"
               className={
                 isActive("/global-admin") &&
                 !isActive("/global-admin/users") &&
                 !isActive("/global-admin/groups")
                   ? "globaladmin_link_active"
                   : ""
               }
             >
               <Home size={20} />
               {!sidebarCollapsed && (
                 <span className="globaladmin_sidebar_names">
                   Global Admin Home
                 </span>
               )}
             </Link>
           </li>
           {/* new changes check */}
           {/* {organizations.length > 0 && (
             <div className="org-selector">
               <label>Organization:</label>
               <select>
                 {organizations.map((org) => (
                   <option key={org.id} value={org.id}>
                     {org.name}
                   </option>
                 ))}
               </select>
             </div>
           )} */}

           {/* organizations */}
           <li>
             <li className="globaladmin_menu_section">
               {!sidebarCollapsed && (
                 <div className="globaladmin_section_title">Organizations</div>
               )}
               <li>
                 <Link
                   to="/global-admin/organizations"
                   className={
                     isActive("/globl-admin/organizations")
                       ? "globaladmin_link_active"
                       : ""
                   }
                 >
                   {/* <BookCopy size={20} /> */}
                   <Building2 size={20} />
                   {!sidebarCollapsed && (
                     <span className="globaladmin_sidebar_names">
                       Manage Organizations
                     </span>
                   )}
                 </Link>
               </li>
             </li>
           </li>

           {/* menu people */}
           <li className="globaladmin_menu_section">
             {!sidebarCollapsed && (
               <div className="globaladmin_section_title"> People</div>
             )}
             <li>
               <Link
                 to="/global-admin/roles"
                 className={
                   isActive("/global-admin/roles")
                     ? "globaladmin_link_active"
                     : ""
                 }
               >
                 <Shield size={20} />
                 {!sidebarCollapsed && (
                   <span className="globaladmin_sidebar_names">
                     {" "}
                     Manage Roles
                   </span>
                 )}
               </Link>
             </li>
           </li>

           {/* <li>
             <Link
               to="/global-admin/users"
               className={
                 isActive("/global-admin/users")
                   ? "globaladmin_link_active"
                   : ""
               }
             >
               <Users size={20} />
               {!sidebarCollapsed && (
                 <span className="globaladmin_sidebar_names">Users</span>
               )}
             </Link>
           </li>
           <li>
             <Link
               to="/global-admin/groups"
               className={
                 isActive("/global-admin/groups")
                   ? "globaladmin_link_active"
                   : ""
               }
             >
               <UserCheck size={20} />
               {!sidebarCollapsed && (
                 <span className="globaladmin_sidebar_names">Groups</span>
               )}
             </Link>
           </li> */}
           {/* <li>
             <Link
               to="/global-admin/roles"
               className={
                 isActive("/global-admin/roles")
                   ? "globaladmin_link_active"
                   : ""
               }
             >
               <Shield size={20} />
               {!sidebarCollapsed && (
                 <span className="globaladmin_sidebar_names">Roles</span>
               )}
             </Link>
           </li> */}

           {/* content */}
           <li className="globaladmin_menu_section">
             {!sidebarCollapsed && (
               <div className="globaladmin_section_title"> Content</div>
             )}
             <li>
               <Link
                 to="/global-admin/content"
                 className={
                   isActive("/global-admin/content")
                     ? "globaladmin_link_active"
                     : ""
                 }
               >
                 <BookOpen size={20} />
                 {!sidebarCollapsed && (
                   <span className="globaladmin_sidebar_names">
                     Manage Content
                   </span>
                 )}
               </Link>
             </li>
           </li>

           {/* //  assessment
           <li>
             <Link
               to="/admin/content-assessments"
               className={
                 isActive("/admin/content-assessments")
                   ? "globaladmin_link_active"
                   : ""
               }
             >
               <CheckCircle size={20} />
               {!sidebarCollapsed && (
                 <span className="globaladmin_sidebar_names">Assessments</span>
               )}
             </Link>
           </li>
           <li>
             <Link
               to="/admin/learning-paths"
               className={
                 isActive("/admin/learning-paths")
                   ? "globaladmin_link_active"
                   : ""
               }
             >
               <Award size={20} />
               {!sidebarCollapsed && (
                 <span className="globaladmin_sidebar_names">
                   Learning Paths
                 </span>
               )}
             </Link>
           </li> */}

           {/* surveys */}
           <li>
             <li className="globaladmin_menu_section">
               {!sidebarCollapsed && (
                 <div className="globaladmin_section_title">Surveys</div>
               )}
               <li>
                 <Link
                   to="/global-admin/surveys"
                   className={
                     isActive("/globl-admin/surveys")
                       ? "globaladmin_link_active"
                       : ""
                   }
                 >
                   <BookCopy size={20} />
                   {!sidebarCollapsed && (
                     <span className="globaladmin_sidebar_names">
                       Manage Surveys
                     </span>
                   )}
                 </Link>
               </li>
             </li>
           </li>

           {/* <li>
             <Link
               to="/admin/manage-surveys"
               className={
                 isActive("/admin/manage-surveys")
                   ? "globaladmin_link_active"
                   : ""
               }
             >
               <BookCopy size={20} />
               {!sidebarCollapsed && (
                 <span className="globaladmin_sidebar_names">
                   Manage Surveys
                 </span>
               )}
             </Link>
           </li>
           <li className="globaladmin_menu_section">
             {!sidebarCollapsed && (
               <div className="globaladmin_section_title">Assessments</div>
             )}
           </li>
           <li>
             <Link
               to="/admin/create-assignment"
               className={
                 isActive("/admin/create-assignment")
                   ? "globaladmin_link_active"
                   : ""
               }
             >
               <CheckCircle size={20} />
               {!sidebarCollapsed && (
                 <span className="globaladmin_sidebar_names">
                   Create Assignment
                 </span>
               )}
             </Link>
           </li>
           <li>
             <Link
               to="/admin/manage-assignments"
               className={
                 isActive("/admin/manage-assignments")
                   ? "globaladmin_link_active"
                   : ""
               }
             >
               <CheckCircle size={20} />
               {!sidebarCollapsed && (
                 <span className="globaladmin_sidebar_names">
                   Manage Assignments
                 </span>
               )}
             </Link>
           </li>
           <li className="globaladmin_menu_section">
             {!sidebarCollapsed && (
               <div className="globaladmin_section_title">Library</div>
             )}
           </li>
           <li>
             <Link
               to="/admin/portal-library"
               className={
                 isActive("/admin/portal-library")
                   ? "globaladmin_link_active"
                   : ""
               }
             >
               <BookCopy size={20} />
               {!sidebarCollapsed && (
                 <span className="globaladmin_sidebar_names">
                   Portal Library
                 </span>
               )}
             </Link>
           </li>
           <li className="globaladmin_menu_section">
             {!sidebarCollapsed && (
               <div className="globaladmin_section_title">User Dashboard</div>
             )}
           </li>
           <li>
             <Link
               to="/admin/message-board"
               className={
                 isActive("/admin/message-board")
                   ? "globaladmin_link_active"
                   : ""
               }
             >
               <BookCopy size={20} />
               {!sidebarCollapsed && (
                 <span className="globaladmin_sidebar_names">
                   Message Board
                 </span>
               )}
             </Link>
           </li>
           <li className="globaladmin_menu_section">
             {!sidebarCollapsed && (
               <div className="globaladmin_section_title">Analytics</div>
             )}
           </li>
           <li>
             <Link
               to="/admin/analytics-overview"
               className={
                 isActive("/admin/analytics-overview")
                   ? "globaladmin_link_active"
                   : ""
               }
             >
               <BarChart size={20} />
               {!sidebarCollapsed && (
                 <span className="globaladmin_sidebar_names">Overview</span>
               )}
             </Link>
           </li>
           */}
           <li className="globaladmin_menu_section">
             {!sidebarCollapsed && (
               <div className="globaladmin_section_title">Other</div>
             )}
           </li>
           <li>
             <Link
               to="/global-admin/profile"
               className={
                 isActive("/global-admin/profile")
                   ? "globaladmin_link_active"
                   : ""
               }
             >
               {/* <Clock size={20} /> */}
               <UserRoundPen size={20} />
               {!sidebarCollapsed && (
                 <span className="globaladmin_sidebar_names">
                   Global Admin Profile
                 </span>
               )}
             </Link>
           </li>
           <li>
             <Link
               to="/global-admin/activity-log"
               className={
                 isActive("/global-admin/activity-log")
                   ? "globaladmin_link_active"
                   : ""
               }
             >
               <Clock size={20} />
               {!sidebarCollapsed && (
                 <span className="globaladmin_sidebar_names">Activity Log</span>
               )}
             </Link>
           </li>
           <li>
             <Link
               to="/global-admin/help-center"
               className={
                 isActive("/global-admin/help-center")
                   ? "globaladmin_link_active"
                   : ""
               }
             >
               <HelpCircle size={20} />
               {!sidebarCollapsed && (
                 <span className="globaladmin_sidebar_names">Help Center</span>
               )}
             </Link>
           </li>
           <li>
             <Link
               to="/global-admin/message-board"
               className={
                 isActive("/global-admin/message-board")
                   ? "globaladmin_link_active"
                   : ""
               }
             >
               <MessageCircle size={20} />
               {!sidebarCollapsed && (
                 <span className="globaladmin_sidebar_names">Message Board</span>
               )}
             </Link>
           </li>
         </ul>

         <div className="globaladmin_sidebar_footer">
           <button onClick={handleLogout} className="globaladmin_logout_btn">
             <LogOut size={20} />
             {!sidebarCollapsed && <span>Logout</span>}
           </button>
         </div>
       </nav>

       <main
         className={`globaladmin_content ${
           sidebarCollapsed ? "globaladmin_content_expanded" : ""
         }`}
       >
         <header className="globaladmin_content_header">
          
           <h2>Global Admin Dashboard</h2>

           {/* <div className="globaladmin_header_left">
             <h2>
               {location.pathname.includes("/global-admin/users") &&
                 "Users Management"}
               {location.pathname.includes("/admin/groups") &&
                 "Groups Management"}
               {location.pathname.includes("/admin/roles") &&
                 "Roles Management"}
               {location.pathname.includes("/admin/content-modules") &&
                 "Content Modules"}
               {location.pathname.includes("/admin/content-assessments") &&
                 "Content Assessments"}
               {location.pathname.includes("/admin/learning-paths") &&
                 "Learning Paths"}
               {location.pathname.includes("/admin/profile") && "Admin Profile"}
               {location.pathname.includes("/admin/manage-surveys") &&
                 "Manage Surveys"}
               {location.pathname.includes("/admin/assignments") &&
                 "Assignments"}
               {location.pathname.includes("/admin/create-assignment") &&
                 "Create Assignment"}
               {location.pathname.includes("/admin/manage-assignments") &&
                 "Manage Assignments"}
               {location.pathname.includes("/admin/portal-library") &&
                 "Portal Library"}
               {location.pathname.includes("/admin/message-board") &&
                 "Message Board"}
               {location.pathname.includes("/admin/analytics-overview") &&
                 "Analytics Overview"}
               {location.pathname.includes("/admin/activity-log") &&
                 "Activity Log"}
               {location.pathname.includes("/admin/help-center") &&
                 "Help Center"}
               {location.pathname === "/admin" && "Admin Dashboard"}
             </h2>
           </div> */}
           <div className="globaladmin_header_right">
             <div className="globaladmin_notification_container">
               <div
                 className="globaladmin_notification_icon"
                 onClick={toggleNotifications}
               >
                 <Bell size={24} />
                 {unreadCount > 0 && (
                   <span className="globaladmin_notification_badge">
                     {unreadCount}
                   </span>
                 )}
               </div>

               {notificationsOpen && (
                 <div className="globaladmin_notification_dropdown">
                   <div className="globaladmin_notification_header">
                     <h4>Notifications</h4>
                     <button
                       className="globaladmin_notification_close"
                       onClick={toggleNotifications}
                     >
                       <X size={16} />
                     </button>
                   </div>

                   <div className="globaladmin_notification_list">
                     {notifications.length === 0 ? (
                       <div className="globaladmin_notification_empty">
                         No notifications
                       </div>
                     ) : (
                       notifications.map((notification) => (
                         <div
                           key={notification.id}
                           className={`globaladmin_notification_item ${
                             notification.read
                               ? "globaladmin_notification_read"
                               : ""
                           }`}
                           onClick={() =>
                             handleNotificationClick(notification.id)
                           }
                         >
                           <div className="globaladmin_notification_content">
                             <h5>{notification.title}</h5>
                             <p>{notification.message}</p>
                             <span className="globaladmin_notification_time">
                               {formatNotificationDate(notification.date)}
                             </span>
                           </div>
                         </div>
                       ))
                     )}
                   </div>
                 </div>
               )}
             </div>

             <div className="globaladmin_profile_container">
               <div
                 className="globaladmin_profile_icon"
                 onClick={toggleProfileDropdown}
               >
                 <div className="globaladmin_profile_initials">
                   {getUserInitials()}
                 </div>
               </div>
               {profileDropdownOpen && (
                 <div className="globaladmin_profile_dropdown">
                   <div className="globaladmin_profile_header">
                     <div className="globaladmin_profile_initials admin_profile_initials_large">
                       {getUserInitials()}
                     </div>
                     <div className="globaladmin_profile_info">
                       <h4>{user?.name || "GlobalAdmin User"}</h4>
                       <p>{user?.email || "globaladmin@example.com"}</p>
                     </div>
                   </div>
                   <ul className="globaladmin_profile_menu">
                     <li onClick={navigateToProfile}>
                       <User size={16} />
                       <span>My Profile</span>
                     </li>
                     <li onClick={handleLogout}>
                       <LogOut size={16} />
                       <span>Logout</span>
                     </li>
                   </ul>
                 </div>
               )}
             </div>
           </div>
         </header>
         <div className="globaladmin_content_body">
           <Outlet />
         </div>
       </main>
     </div>
   );
 };
 
 export default GlobalAdminLayout;