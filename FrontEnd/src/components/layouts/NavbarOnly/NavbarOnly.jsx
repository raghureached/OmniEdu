import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../store/slices/authSlice';
import { fetchNotifications, markNotificationAsRead } from '../../../store/slices/notificationSlice';
import { User, HelpCircle, LogOut, Bell, X } from 'lucide-react';
import './NavbarOnly.css';

const NavbarOnly = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { items: notifications, unreadCount } = useSelector((state) => state.notifications);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Fetch notifications on component mount
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);
  
  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest('.user_profile_container')) {
        setProfileDropdownOpen(false);
      }
      if (notificationsOpen && !event.target.closest('.user_notification_container')) {
        setNotificationsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen, notificationsOpen]);
  
  const handleLogout = () => {
    // First remove token and update Redux state
    localStorage.removeItem('token');
    
    // Then dispatch logout action
    dispatch(logout())
      .then(() => {
        navigate('/');
      })
      .catch(() => {
        // Even if the API call fails, we should still redirect
        // since we've already removed the token
        navigate('/');
      });
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
    navigate('/user/profile');
    setProfileDropdownOpen(false);
  };
  
  // Function to get user initials
  const getUserInitials = () => {
    if (!user || !user.name) return 'U';
    
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
    <div className="navbar_only_container">
      <header className="navbar_only_header">
        <div className="admin_logo">
              
                <h3>OmniEdu</h3>

            </div>
        <div className="navbar_only_right">
          <div className="user_notification_container">
            <div className="user_notification_icon" onClick={toggleNotifications}>
              <Bell size={24} />
              {unreadCount > 0 && <span className="user_notification_badge">{unreadCount}</span>}
            </div>
            
            {notificationsOpen && (
              <div className="user_notification_dropdown">
                <div className="user_notification_header">
                  <h4>Notifications</h4>
                  <button className="user_notification_close" onClick={toggleNotifications}>
                    <X size={16} />
                  </button>
                </div>
                
                <div className="user_notification_list">
                  {notifications.length === 0 ? (
                    <div className="user_notification_empty">No notifications</div>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`user_notification_item ${notification.read ? 'user_notification_read' : ''}`}
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div className="user_notification_content">
                          <h5>{notification.title}</h5>
                          <p>{notification.message}</p>
                          <span className="user_notification_time">{formatNotificationDate(notification.date)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="user_profile_container">
            <div className="user_profile_icon" onClick={toggleProfileDropdown}>
              <div className="user_profile_initials">{getUserInitials()}</div>
            </div>
            {profileDropdownOpen && (
              <div className="user_profile_dropdown">
                <div className="user_profile_header">
                  <div className="user_profile_initials user_profile_initials_large">{getUserInitials()}</div>
                  <div className="user_profile_info">
                    <h4>{user?.name || 'User Name'}</h4>
                    <p>{user?.email || 'user@example.com'}</p>
                  </div>
                </div>
                <ul className="user_profile_menu">
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
      <main className="navbar_only_content">
        <Outlet />
      </main>
    </div>
  );
};

export default NavbarOnly;