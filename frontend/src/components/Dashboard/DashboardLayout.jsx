import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight } from "lucide-react";
import { FaBars, FaUniversity, FaMoneyBillWave, FaSignOutAlt, FaHome, FaUsers, FaBook, FaKey, FaUserCircle, FaTicketAlt } from 'react-icons/fa';
import './DashboardLayout.css';
import logo from '../../assets/images/logo.webp';

const DashboardLayout = ({ user, handleLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bookingsExpanded, setBookingsExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogoutClick = () => {
    handleLogout();
    navigate('/');
  };

  const menuItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Dashboard', exact: true },
    { path: '/dashboard/all-groups', icon: <FaUsers />, label: 'All Groups' },
    {
      path: '/dashboard/my-bookings',
      icon: <FaTicketAlt />,
      label: 'My Bookings',
      hasSubMenu: true,
      subItems: [
        { path: '/dashboard/my-bookings?status=on hold', label: 'On Hold' },
        { path: '/dashboard/my-bookings?status=confirmed', label: 'Confirmed' },
        { path: '/dashboard/my-bookings?status=cancelled', label: 'Cancelled' },
        { path: '/dashboard/my-bookings', label: 'All Bookings' },
      ]
    },
    { path: '/dashboard/banks', icon: <FaUniversity />, label: 'Bank' },
    { path: '/dashboard/payment', icon: <FaMoneyBillWave />, label: 'Payment' },
    { path: '/dashboard/ledger', icon: <FaBook />, label: 'Ledger' },

    { path: '/dashboard/profile', icon: <FaUserCircle />, label: 'My Profile' },
    { path: '/dashboard/change-password', icon: <FaKey />, label: 'Change Password' },
  ];

  const isActive = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <img src={logo} alt="Logo" style={{ width: '80px', height: 'auto' }} onError={(e) => e.target.style.display = 'none'} />
          </Link>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                {item.hasSubMenu ? (
                  <>
                    <div
                      onClick={() => setBookingsExpanded(!bookingsExpanded)}
                      className={`menu-item-parent ${isActive(item.path, item.exact) ? 'active' : ''}`}
                      title={item.label}
                    >
                      <div className="menu-item-content">
                        <span className="menu-icon">{item.icon}</span>
                        {sidebarOpen && <span className="menu-label">{item.label}</span>}
                      </div>
                      {sidebarOpen && <span className="expand-icon">{bookingsExpanded ? <ChevronDown className="w-4 h-4 expand-icon" /> : <ChevronRight className="w-4 h-4 expand-icon" />}</span>}
                    </div>
                    {bookingsExpanded && sidebarOpen && (
                      <ul className="sub-menu">
                        {item.subItems.map((subItem) => {
                          const currentPath = location.pathname;
                          const currentStatus = new URLSearchParams(location.search).get('status') || '';
                          const subItemStatus = subItem.path.includes('?status=')
                            ? subItem.path.split('status=')[1]
                            : '';
                          const isSubActive = currentPath === '/dashboard/my-bookings' && currentStatus === subItemStatus;

                          return (
                            <li key={subItem.path}>
                              <Link
                                to={subItem.path}
                                className={`sub-menu-item ${isSubActive ? 'active' : ''}`}
                              >
                                {subItem.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className={isActive(item.path, item.exact) ? 'active' : ''}
                    title={item.label}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    {sidebarOpen && <span className="menu-label">{item.label}</span>}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogoutClick} className="logout-btn" title="Logout">
            <span className="menu-icon"><FaSignOutAlt /></span>
            {sidebarOpen && <span className="menu-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Header */}
        <header className="dashboard-header">
          <button onClick={toggleSidebar} className="toggle-sidebar-btn">
            {/* {sidebarOpen ? <FaTimes /> : <FaBars />} */}
            {sidebarOpen ? <FaBars /> : <FaBars />}
          </button>
          {/* <div className="header-title">
            <h1>Dashboard - Brothers International</h1> 
          </div> */}
          <div className="header-user">
            <span>Welcome, {user?.name || 'User'}</span>
          </div>
        </header>

        {/* Content Area */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
