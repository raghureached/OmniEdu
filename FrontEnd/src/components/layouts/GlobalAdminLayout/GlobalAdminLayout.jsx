
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../store/slices/authSlice';
import { fetchNotifications, markNotificationAsRead } from '../../../store/slices/notificationSlice';
import './GlobalAdminLayout.css';
import { fetchOrganizations } from "../../../store/slices/organizationSlice";
import { Menu, Home, UserCheck, Shield, BookOpen, Building2, CheckCircle, UserRoundPen, BookCopy, Clock, User, LogOut, Bell, X, BarChart, MessageCircle, Landmark, MessageCircleCode, BookCheck, NotebookTabs, CircleUserRound, NotepadText, ChartColumnIncreasing, BookOpenCheck, User2, NotebookPen } from 'lucide-react';
import { GoGear } from 'react-icons/go';
import { HiOutlineBuildingLibrary } from "react-icons/hi2";


const GlobalAdminLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);
    // const { organizations } = useSelector((state) => state.organizations);

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
                !event.target.closest(".globaladmin_profile_container")
            ) {
                setProfileDropdownOpen(false);
            }
            if (
                notificationsOpen &&
                !event.target.closest(".globaladmin_notification_container")
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
            localStorage.removeItem("authState");
            navigate("/login");
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
        // console.log("Navigating to profile");
        navigate("/global-admin/profile");
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
    const handleProfileLogout = () => {
        setProfileDropdownOpen(false);
        dispatch(logout()).then(() => {
            localStorage.removeItem("authState");
            navigate("/login");
        });
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
                className={`globaladmin_sidebar ${mobileMenuOpen ? "globaladmin_sidebar_open" : ""
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
                <ul className="globaladmin_sidebar_menu">
               
                    <li>
                        <Link
                            to="/global-admin/dashboard"
                            className={isActive("/global-admin/dashboard") ? "globaladmin_link_active" : ""}
                        >
                            <Home size={20} />
                            {!sidebarCollapsed && <span className="globaladmin_sidebar_names">Global Admin Home</span>}
                        </Link>
                    </li>

                    <li className="globaladmin_menu_section">
                        {!sidebarCollapsed && <div className="globaladmin_section_title"><span style={{display:"flex",alignItems:"center",gap:"10px"}}><HiOutlineBuildingLibrary size={20} /> <span>MANAGE</span></span></div>}
                    </li>

                    <li>
                        <Link to="/global-admin/organizations" className={isActive("/global-admin/organizations") ? "globaladmin_link_active" : ""}>
                            <Landmark size={20} />
                            {!sidebarCollapsed && <span className="globaladmin_sidebar_names">Organizations</span>}
                        </Link>
                    </li>

                    <li>
                        <Link to="/global-admin/roles" className={isActive("/global-admin/roles") ? "globaladmin_link_active" : ""}>
                            <Shield size={20} />
                            {!sidebarCollapsed && <span className="globaladmin_sidebar_names">Roles</span>}
                        </Link>
                    </li>
                    
                    <li>
                        <Link to="/global-admin/message-board" className={isActive("/global-admin/message-board") ? "globaladmin_link_active" : ""}>
                            <MessageCircleCode size={20} />
                            {!sidebarCollapsed && <span className="globaladmin_sidebar_names">Message Board</span>}
                        </Link>
                    </li>
                    <li>
                        <Link to="/global-admin/user-dashboard-config" className={isActive("/global-admin/user-dashboard-config") ? "globaladmin_link_active" : ""}>
                            <UserRoundPen size={20} />
                            {!sidebarCollapsed && <span className="globaladmin_sidebar_names">User Dashboard Config</span>}
                        </Link>
                    </li>

                    <li>
                        <Link to="/global-admin/admin-dashboard-config" className={isActive("/global-admin/admin-dashboard-config") ? "globaladmin_link_active" : ""}>
                            <UserCheck size={20} />
                            {!sidebarCollapsed && <span className="globaladmin_sidebar_names">Admin Dashboard Config</span>}
                        </Link>
                    </li>
                    <li className="globaladmin_menu_section">
                        {!sidebarCollapsed && <div className="globaladmin_section_title"><span style={{display:"flex",alignItems:"center",gap:"10px"}}><BookCopy size={20} /> <span>Global Library</span></span></div>}
                    </li>
                    <li>
                        <Link to="/global-admin/module" className={isActive("/global-admin/module") ? "globaladmin_link_active" : ""}>
                            <BookOpen size={20} />
                            {!sidebarCollapsed && <span className="globaladmin_sidebar_names">Modules</span>}
                        </Link>
                    </li>
                    <li>
                        <Link to="/global-admin/assessments" className={isActive("/global-admin/assessments") ? "globaladmin_link_active" : ""}>
                            <BookOpenCheck size={20} />
                            {!sidebarCollapsed && <span className="globaladmin_sidebar_names">Assessments</span>}
                        </Link>
                    </li>
                    <li>
                        <Link to="/global-admin/surveys" className={isActive("/global-admin/surveys") ? "globaladmin_link_active" : ""}>
                            <NotepadText size={20} />
                            {!sidebarCollapsed && <span className="globaladmin_sidebar_names">Surveys</span>}
                        </Link>
                    </li>
                    <li>
                        <Link to="/global-admin/scorm" className={isActive("/global-admin/scorm") ? "globaladmin_link_active" : ""}>
                            <NotepadText size={20} />
                            {!sidebarCollapsed && <span className="globaladmin_sidebar_names">Scorm</span>}
                        </Link>
                    </li>
                    <li>
                        <Link to="/global-admin/assignments" className={isActive("/global-admin/assignments") ? "globaladmin_link_active" : ""}>
                                          <NotebookPen size={20} />
                            
                            {!sidebarCollapsed && <span className="globaladmin_sidebar_names">Create Assignment</span>}
                        </Link>
                    </li>

                   
                    

                    <li className="globaladmin_menu_section">
                        {!sidebarCollapsed && <div className="globaladmin_section_title"><span style={{display:"flex",alignItems:"center",gap:"10px"}}><GoGear size={20} /> <span>Settings</span></span></div>}
                    </li>
                    <li>
                        <Link to="/global-admin/analytics-view" className={isActive("/global-admin/analytics-view") ? "globaladmin_link_active" : ""}>
                            {/* <BarChart size={20} /> */}
                            <ChartColumnIncreasing size={20} />
                            {!sidebarCollapsed && <span className="globaladmin_sidebar_names">Analytics</span>}
                        </Link>
                    </li>

                    <li>
                        <Link to="/global-admin/activity-log" className={isActive("/global-admin/activity-log") ? "globaladmin_link_active" : ""}>
                            <Clock size={20} />
                            {!sidebarCollapsed && <span className="globaladmin_sidebar_names">Activity Log</span>}
                        </Link>
                    </li>
                    <li>
                        <Link to="/global-admin/support" className={isActive("/global-admin/support") ? "globaladmin_link_active" : ""}>
                            <MessageCircle size={20} />
                            {!sidebarCollapsed && <span className="globaladmin_sidebar_names">Support</span>}
                        </Link>
                    </li>

                    {/* Profile */}
                    <li>
                        <Link to="/global-admin/profile" className={isActive("/global-admin/profile") ? "globaladmin_link_active" : ""}>
                            {/* <User size={20} /> */}
                            <CircleUserRound size={20} />
                            {!sidebarCollapsed && <span className="globaladmin_sidebar_names">Global Admin Profile</span>}
                        </Link>
                    </li>
                    <li >
                    <Link onClick={handleLogout} style={{color:"red"}}>
                        <LogOut size={20} />
                        {!sidebarCollapsed && <span>Logout</span>}
                    </Link>
                </li>
                </ul>


                
            </nav>

            <main
                className={`globaladmin_content ${sidebarCollapsed ? "globaladmin_content_expanded" : ""
                    }`}
            >
                <header className="globaladmin_content_header">
                    <div className="globaladmin_header_left">
                        <h2>
                            {/* {location.pathname.includes('/global-admin') && 'Dashboard'} */}
                            {location.pathname.includes('/global-admin/admindashboard') && 'Global Admin Dashboard Configuration'}
                            {location.pathname.includes('/global-admin/organizations') && 'Manage Organizations'}
                            {location.pathname.includes('/global-admin/roles') && 'Manage Roles'}
                            {location.pathname.includes('/global-admin/module') && 'Manage Modules'}
                            {location.pathname.includes('/global-admin/assessments') && 'Manage Assessments'}
                            {location.pathname.includes('/global-admin/users') && 'Manage Users'}
                            {location.pathname.includes('/global-admin/surveys') && 'Manage Surveys'}
                            {location.pathname.includes('/global-admin/profile') && 'Manage Profile'}
                            {location.pathname.includes('/global-admin/activity-log') && 'Manage Activity History'}
                            {location.pathname.includes('/global-admin/help-center') && 'Manage Help Center'}
                            {location.pathname.includes('/global-admin/assignments') && 'Assignments'}
                            {/* {location.pathname.includes('/global-admin/library-user') && 'User Library'} */}
                            {location.pathname.includes('/global-admin/portal-library-admin') && 'Admin Library'}
                            {location.pathname.includes('/global-admin/user-dashboard-config') && 'User Dashboard Configuration'}
                            {location.pathname.includes('/global-admin/admin-dashboard-config') && 'Admin Dashboard Configuration'}
                            {location.pathname.includes('/global-admin/analytics-view') && 'Analytics'}
                            {location.pathname.includes('/global-admin/message-board') && 'Message Board'}
                            {/* {location.pathname.includes('/global-admin/analytics-view') && 'Manage Help Center'} */}
                        </h2>
                    </div>


                    <div className="globaladmin_header_right">
                        {/* <div className='userdata'>
                            <h4>{user ? `${user.name}` : "GlobalAdmin"}</h4>

                        </div> */}
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
                                                    className={`globaladmin_notification_item ${notification.read
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
                                            <h4>{user ? `${user.name}` : "GlobalAdmin"}</h4>
                                            <p>{user?.email || "globaladmin@example.com"}</p>

                                        </div>
                                    </div>
                                    <ul className="globaladmin_profile_menu">
                                        <li onClick={navigateToProfile}>
                                            {/* <User size={16} /> */}
                                            <CircleUserRound size={16} />
                                            <span>My Profile</span>
                                        </li>
                                        <li onClick={handleProfileLogout}>
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