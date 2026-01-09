import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../store/slices/authSlice';
import { fetchNotifications, markNotificationAsRead } from '../../../store/slices/notificationSlice';
import './AdminLayout.css';
import { Menu, Home, User2, UserCheck, Shield, BookOpen, CircleUserRound, NotepadText, NotebookPen, LibraryBig, BookOpenCheck, MessageCircleCode, Award, BookCopy, Clock, HelpCircle, LogOut, Bell, X, ChartColumnIncreasing,Laptop, PenBox, Package, Notebook } from 'lucide-react';
import { fetchPermissions } from '../../../store/slices/roleSlice';
import { GoGear, GoPeople } from 'react-icons/go';

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { items: notifications, unreadCount } = useSelector((state) => state.notifications);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(location.pathname);

  const {permissions} = useSelector((state) => state.rolePermissions);
  useEffect(() => {
      // Initial fetch
      dispatch(fetchPermissions());
  
      // Set up interval for periodic updates (every 5 minutes)
      const permissionsInterval = setInterval(() => {
        dispatch(fetchPermissions());
      }, 5 * 60 * 1000); // 5 minutes in milliseconds
  
      // Cleanup interval on unmount
      return () => {
        clearInterval(permissionsInterval);
      };
    }, [dispatch]);

  
  // Fetch notifications on component mount
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);
  useEffect(() => {
    setCurrentLocation(location.pathname);
    if(location.pathname === "admin/learning-paths/:i"){
      setSidebarCollapsed(true);
    }
    else{
      setSidebarCollapsed(false);
    }
  }, [location.pathname]);
  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest('.admin_profile_container')) {
        setProfileDropdownOpen(false);
      }
      if (notificationsOpen && !event.target.closest('.admin_notification_container')) {
        setNotificationsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen, notificationsOpen]);
  
  const handleLogout = () => {
    dispatch(logout()).then(() => {
      navigate('/');
    });
  };
  
  // Function to check if a link is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
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
    navigate('/admin/profile');
    setProfileDropdownOpen(false);
  };
  
  // Function to get user initials
  const getUserInitials = () => {
    if (!user || !user.name) return 'A';
    
    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    
    return user.name.substring(0, 2).toUpperCase();
  };
  
  // Function to format notification date
  const formatNotificationDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
  };
  
  return (
    <div className="admin_layout_container">
      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div className="admin_sidebar_overlay" onClick={toggleMobileMenu}></div>
      )}

      <nav
        className={`admin_sidebar ${
          mobileMenuOpen ? "admin_sidebar_open" : ""
        } ${sidebarCollapsed ? "admin_sidebar_collapsed" : ""}`}
      >
        <div className="admin_sidebar_header">
          <div className="admin_logo_container">
            <button className="admin_menu_toggle" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <div className="admin_logo">
              {sidebarCollapsed ? (
                <span className="admin_logo_small"></span>
              ) : (
                <h3>OmniEdu</h3>
              )}
            </div>
          </div>
        </div>

        <ul className="admin_sidebar_menu">
          <li>
            <Link
              to="/admin"
              className={
                isActive("/admin") &&
                !isActive("/admin/users") &&
                !isActive("/admin/groups")
                  ? "admin_link_active"
                  : ""
              }
            >
              <Home size={20} />
              {!sidebarCollapsed && (
                <span className="admin_sidebar_names">Admin Home</span>
              )}
            </Link>
          </li>
          <li className="admin_menu_section">
            {!sidebarCollapsed && (
              <div className="admin_section_title"><span style={{display:"flex",alignItems:"center",gap:"10px"}}><GoPeople size={20} /> <span>People</span></span></div>
            )}
          </li>
          <li>
            <Link
              to="/admin/groups"
              className={isActive("/admin/groups") ? "admin_link_active" : ""}
            >
              <UserCheck size={20} />
              {!sidebarCollapsed && (
                <span className="admin_sidebar_names">Groups</span>
              )}
            </Link>
          </li>
          <li>
            <Link
              to="/admin/users"
              className={isActive("/admin/users") ? "admin_link_active" : ""}
            >
              <User2 size={20} />
              {!sidebarCollapsed && (
                <span className="admin_sidebar_names">Users</span>
              )}
            </Link>
          </li>
          <li>
            <Link
              to="/admin/message-board"
              className={
                isActive("/admin/message-board") ? "admin_link_active" : ""
              }
            >
              {/* <BookCopy size={20} /> */}
              <MessageCircleCode size={20} />
              {!sidebarCollapsed && (
                <span className="admin_sidebar_names">Message Board</span>
              )}
            </Link>
          </li>
          <li className="admin_menu_section">
            {!sidebarCollapsed && (
              <div className="admin_section_title">Content</div>
            )}
          </li>
           <li>
            <Link
              to="/admin/documents"
              className={
                isActive("/admin/documents") ? "admin_link_active" : ""
              }
            >
             
              <LibraryBig size={20}/>
              {!sidebarCollapsed && (
                <span className="admin_sidebar_names">Documents</span>
              )}
            </Link>
          </li>
          <li>
            <Link
              to="/admin/content-modules"
              className={
                isActive("/admin/content-modules") ? "admin_link_active" : ""
              }
            >
              <BookOpen size={20} />
              {!sidebarCollapsed && (
                <span className="admin_sidebar_names">Modules</span>
              )}
            </Link>
          </li>
          
          <li>
            <Link
              to="/admin/content-assessments"
              className={
                isActive("/admin/content-assessments")
                  ? "admin_link_active"
                  : ""
              }
            >
              <BookOpenCheck size={20} />
              {!sidebarCollapsed && (
                <span className="admin_sidebar_names">Assessments</span>
              )}
            </Link>
          </li>
          <li>
            <Link
              to="/admin/manage-surveys"
              className={
                isActive("/admin/manage-surveys") ? "admin_link_active" : ""
              }
            >
              <NotepadText size={20} />
              {!sidebarCollapsed && (
                <span className="admin_sidebar_names">Surveys</span>
              )}
            </Link>
          </li>
          <li>
            <Link
              to="/admin/learning-paths"
              className={
                isActive("/admin/learning-paths") ? "admin_link_active" : ""
              }
            >
              <Award size={20} />
              {!sidebarCollapsed && (
                <span className="admin_sidebar_names">Learning Paths</span>
              )}
            </Link>
          </li>
          <li>
            <Link
              to="/admin/scorm"
              className={
                isActive("/admin/scorm") ? "admin_link_active" : ""
              }
            >
              <Package size={20} />
              {!sidebarCollapsed && (
                <span className="admin_sidebar_names">Scorm</span>
              )}
            </Link>
          </li>
          
          <li className="admin_menu_section">
            {!sidebarCollapsed && (
                           <div className="admin_section_title"><span style={{display:"flex",alignItems:"center",gap:"10px"}}><PenBox size={20} /> <span>Assignments</span></span></div>

            )}
          </li>
          <li>
            <Link
              to="/admin/create-assignment"
              className={
                isActive("/admin/create-assignment") ? "admin_link_active" : ""
              }
            >
              <NotebookPen size={20} />
              {!sidebarCollapsed && (
                <span className="admin_sidebar_names">Create Assignment</span>
              )}
            </Link>
            <Link
              to="/admin/view-assignments"
              className={
                isActive("/admin/view-assignments") ? "admin_link_active" : ""
              }
            >
              <Notebook size={20} />
              {!sidebarCollapsed && (
                <span className="admin_sidebar_names">View / Manage Assignments</span>
              )}
            </Link>
          </li>
        
          
          <li className="admin_menu_section">
            {!sidebarCollapsed && (
              <div className="admin_section_title"><span style={{display:"flex",alignItems:"center",gap:"10px"}}><GoGear size={20} /> <span>Settings</span></span></div>
            )}
          </li>
          <li>
            <Link
              to="/admin/analytics"
              className={
                isActive("/admin/analytics") ? "admin_link_active" : ""
              }
            >
              <ChartColumnIncreasing size={20} />
              {!sidebarCollapsed && (
                <span className="admin_sidebar_names">Analytics</span>
              )}
            </Link>
          </li>
          
          {permissions.includes("Activity History Access") && <li>
            <Link
              to="/admin/activity-log"
              className={
                isActive("/admin/activity-log") ? "admin_link_active" : ""
              }
            >
              <Clock size={20} />
              {!sidebarCollapsed && (
                <span className="admin_sidebar_names">Activity Log</span>
              )}
            </Link>
          </li>}
          {permissions.includes("Profile Access") &&<li>
            <Link
              to="/admin/profile"
              className={isActive("/admin/profile") ? "admin_link_active" : ""}
            >
              <CircleUserRound size={20} />
              {!sidebarCollapsed && (
                <span className="admin_sidebar_names">Admin Profile</span>
              )}
            </Link>
          </li>}
          {permissions.includes("Help Center Access") && <li>
            <Link
              to="/admin/help-center"
              className={
                isActive("/admin/help-center") ? "admin_link_active" : ""
              }
            >
              <HelpCircle size={20} />
              {!sidebarCollapsed && (
                <span className="admin_sidebar_names">Help Center</span>
              )}
            </Link>
          </li>}
          {permissions.includes("Support Button Access") && <li>
            <Link
              to="/admin/support"
              className={
                isActive("/admin/support") ? "admin_link_active" : ""
              }
            >
              {/* <HelpCircle size={20} /> */}
               <Laptop  size={20}/>
              {!sidebarCollapsed && (
                <span className="admin_sidebar_names">Support</span>
              )}
            </Link>
          </li>}
        </ul>

        <div className="admin_sidebar_footer">
          <button onClick={handleLogout} className="admin_logout_btn">
            <LogOut size={20} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </nav>

      <main
        className={`admin_content ${
          sidebarCollapsed ? "admin_content_expanded" : ""
        }`}
      >
        <header className="admin_content_header">
          <div className="admin_header_left">
            <h2>
              {location.pathname.includes("/admin/users") && "Users Management"}
              {location.pathname.includes("/admin/groups") &&
                "Groups Management"}
              {location.pathname.includes("/admin/roles") && "Roles Management"}
               {location.pathname.includes("/admin/documents") &&
                "Documents"}
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
              {location.pathname.includes("/admin/analytics") &&
                "Analytics Overview"}
              {location.pathname.includes("/admin/activity-log") &&
                "Activity Log"}
              {location.pathname.includes("/admin/help-center") &&
                "Help Center"}
              {location.pathname.includes("/admin/support") &&
                "Support"}
              {location.pathname === "/admin" && "Admin Dashboard"}
            </h2>
          </div>
          <div className="admin_header_right">
            <div className="admin_notification_container">
              <div
                className="admin_notification_icon"
                onClick={toggleNotifications}
              >
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className="admin_notification_badge">
                    {unreadCount}
                  </span>
                )}
              </div>

              {notificationsOpen && (
                <div className="admin_notification_dropdown">
                  <div className="admin_notification_header">
                    <h4>Notifications</h4>
                    <button
                      className="admin_notification_close"
                      onClick={toggleNotifications}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="admin_notification_list">
                    {notifications.length === 0 ? (
                      <div className="admin_notification_empty">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`admin_notification_item ${
                            notification.read ? "admin_notification_read" : ""
                          }`}
                          onClick={() =>
                            handleNotificationClick(notification.id)
                          }
                        >
                          <div className="admin_notification_content">
                            <h5>{notification.title}</h5>
                            <p>{notification.message}</p>
                            <span className="admin_notification_time">
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

            <div className="admin_profile_container">
              <div
                className="admin_profile_icon"
                onClick={toggleProfileDropdown}
              >
                <div className="admin_profile_initials">
                  {getUserInitials()}
                </div>
              </div>
              {profileDropdownOpen && (
                <div className="admin_profile_dropdown">
                  <div className="admin_profile_header">
                    <div className="admin_profile_initials admin_profile_initials_large">
                      {getUserInitials()}
                    </div>
                    <div className="admin_profile_info">
                      <h4>{user?.name || "Admin User"}</h4>
                      <p>{user?.email || "admin@example.com"}</p>
                    </div>
                  </div>
                  <ul className="admin_profile_menu">
                    <li onClick={navigateToProfile}>
                      <CircleUserRound size={16} />
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
        <div className="admin_content_body">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;