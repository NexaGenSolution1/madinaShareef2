import { useState, useMemo, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Search,
  LayoutDashboard,
  Users,
  CalendarCheck,
  Building2,
  CreditCard,
  FileText,
  UserCircle,
  Lock,
  LogOut,
} from "lucide-react";
import "./DashboardLayout_clean.css";
import logo from "../../assets/images/logo.webp";

// --- Ripple Component ---
const RippleButton = ({ children, style, onClick, className, to }) => {
  const [ripples, setRipples] = useState([]);

  const createRipple = (event) => {
    // Stop event from bubbling up to parent items
    // event.stopPropagation();

    const container = event.currentTarget.getBoundingClientRect();
    const size = Math.max(container.width, container.height);
    const x = event.clientX - container.left - size / 2;
    const y = event.clientY - container.top - size / 2;
    const newRipple = { x, y, size, id: Date.now() };

    setRipples((prev) => [...prev, newRipple]);
    if (onClick) onClick(event);
  };

  const cleanUpRipple = (id) =>
    setRipples((prev) => prev.filter((r) => r.id !== id));

  const rippleElements = ripples.map((ripple) => (
    <span
      key={ripple.id}
      onAnimationEnd={() => cleanUpRipple(ripple.id)}
      style={{
        position: "absolute",
        top: ripple.y,
        left: ripple.x,
        width: ripple.size,
        height: ripple.size,
        background: "rgba(255, 255, 255, 0.3)",
        borderRadius: "50%",
        pointerEvents: "none",
        transform: "scale(0)",
        animation: "ripple-animation 600ms linear",
      }}
    />
  ));

  const commonProps = {
    className: `ripple-container ${className || ""}`,
    style: {
      ...style,
      position: "relative",
      overflow: "hidden",
      display: "flex",
      width: "100%",
    },
    onClick: createRipple,
  };

  return to ? (
    <Link to={to} {...commonProps}>
      {children}
      {rippleElements}
    </Link>
  ) : (
    <div {...commonProps}>
      {children}
      {rippleElements}
    </div>
  );
};

const DashboardLayout = ({ user, handleLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bookingsExpanded, setBookingsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle responsive sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    // Check on mount
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Close sidebar on mobile when menu item clicked
  const handleMenuClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // --- Menu Items with Icons ---
  const menuItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      exact: true,
    },
    {
      path: "/dashboard/all-groups",
      label: "All Groups",
      icon: <Users size={18} />,
    },
    {
      label: "My Bookings",
      icon: <CalendarCheck size={18} />,
      hasSubMenu: true,
      menuKey: "bookings",
      subItems: [
        { path: "/dashboard/my-bookings?status=on%20hold", label: "On Hold" },
        { path: "/dashboard/my-bookings?status=confirmed", label: "Confirmed" },
        { path: "/dashboard/my-bookings?status=cancelled", label: "Cancelled" },
        { path: "/dashboard/my-bookings", label: "All Bookings" },
      ],
    },
    { path: "/dashboard/banks", label: "Bank", icon: <Building2 size={18} /> },
    {
      path: "/dashboard/payment",
      label: "Payment",
      icon: <CreditCard size={18} />,
    },
    {
      path: "/dashboard/ledger",
      label: "Ledger",
      icon: <FileText size={18} />,
    },
    {
      path: "/dashboard/profile",
      label: "My Profile",
      icon: <UserCircle size={18} />,
    },
    {
      path: "/dashboard/change-password",
      label: "Change Password",
      icon: <Lock size={18} />,
    },
  ];

  const filteredMenu = useMemo(() => {
    if (!searchQuery.trim()) return menuItems;
    const query = searchQuery.toLowerCase();
    return menuItems.filter(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        item.subItems?.some((sub) => sub.label.toLowerCase().includes(query)),
    );
  }, [searchQuery]);

  const isActive = (path) => {
    const currentPath = location.pathname + location.search;
    return currentPath === path;
  };

  const styles = {
    container: { background: "#f5f5f5", minHeight: "100vh" },
    sidebar: {
      background: "#ffffff",
      color: "#555",
      boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
      borderRight: "1px solid #e5e5e5",
      transition: "width 0.3s ease",
      width: sidebarOpen ? "280px" : "75px",
    },
    menuItem: (isActiveItem) => ({
      background: isActiveItem
        ? "linear-gradient(90deg, #21397C 0%, #2CA3B4 100%)"
        : "transparent",
      color: isActiveItem ? "#ffffff" : "#000",
      fontSize: "18px",
      borderRadius: "5px",
      fontWeight: isActiveItem ? "500" : "400",
      cursor: "pointer",
      justifyContent: sidebarOpen ? "flex-start" : "center",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: sidebarOpen ? "12px 20px" : "12px 0",
      textDecoration: "none",
      transition: "all 0.2s",
    }),
    searchInput: {
      width: "100%",
      padding: "8px 12px 8px 36px",
      border: "1px solid #e0e0e0",
      borderRadius: "6px",
      fontSize: "13px",
      color: "#666",
      background: "#f9f9f9",
      outline: "none",
    },
    searchIcon: {
      position: "absolute",
      left: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#999",
    },
    logoutBtn: (isHovered) => ({
      background: isHovered
        ? "rgba(225, 29, 72, 0.15)"
        : "rgba(225, 29, 72, 0.08)",
      border: `1.5px solid ${isHovered ? theme.colors.danger : "rgba(225, 29, 72, 0.3)"}`,
      color: isHovered ? "#fda4af" : "#fca5a5",
      transition: theme.transitions.smooth,
    }),
  };

  const handleLogoutClick = () => {
    handleLogout();
    navigate("/");
  };

  return (
    <div className="dashboard-container" style={styles.container}>
      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="sidebar-overlay"
          onClick={toggleSidebar}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
        />
      )}

      <aside
        className={`dashboard-sidebar ${sidebarOpen ? "open" : "closed"}`}
        style={styles.sidebar}
      >
        <div
          className="sidebar-header"
          style={{
            padding: "20px",
            borderBottom: "1px solid #e5e5e5",
            position: "relative",
          }}
        >
          {/* Mobile Close Button */}
          <button
            className="sidebar-close-btn"
            onClick={toggleSidebar}
            style={{
              position: "absolute",
              top: "15px",
              right: "15px",
              background: "#f5f5f5",
              border: "1px solid #ddd",
              borderRadius: "6px",
              padding: "6px",
              cursor: "pointer",
              display: "none",
            }}
          >
            <X size={18} />
          </button>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={logo}
              alt="Logo"
              style={{
                width: sidebarOpen ? "120px" : "40px",
                transition: "0.3s",
                objectFit: "contain",
              }}
            />
          </div>
        </div>

        <div style={{ padding: "16px 20px" }}>
          <div style={{ position: "relative" }}>
            <Search size={16} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul style={{ listStyle: "none", padding: 0 }}>
            {filteredMenu.map((item, index) => (
              <li key={index}>
                {item.hasSubMenu ? (
                  <>
                    <RippleButton
                      onClick={() =>
                        sidebarOpen && setBookingsExpanded(!bookingsExpanded)
                      }
                      style={styles.menuItem(false)}
                    >
                      {item.icon}
                      {sidebarOpen && (
                        <>
                          <span style={{ flex: 1 }}>{item.label}</span>
                          {bookingsExpanded ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </>
                      )}
                    </RippleButton>
                    {bookingsExpanded && sidebarOpen && (
                      <ul
                        style={{
                          listStyle: "none",
                          paddingLeft: "0",
                          background: "#fcfcfc",
                        }}
                      >
                        {item.subItems.map((sub, sIdx) => (
                          <li key={sIdx}>
                            <RippleButton
                              to={sub.path}
                              onClick={handleMenuClick}
                              style={{
                                ...styles.menuItem(isActive(sub.path)),
                                paddingLeft: "50px",
                                fontSize: "13px",
                                borderRadius: "5px",
                              }}
                            >
                              {sub.label}
                            </RippleButton>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <RippleButton
                    to={item.path}
                    onClick={handleMenuClick}
                    style={styles.menuItem(isActive(item.path))}
                  >
                    {item.icon}
                    {sidebarOpen && <span>{item.label}</span>}
                  </RippleButton>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div
        className={`dashboard-main ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <header
          style={{
            background: "#fff",
            padding: "15px 25px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #e5e5e5",
          }}
        >
          <button
            onClick={toggleSidebar}
            style={{
              cursor: "pointer",
              border: "1px solid #ddd",
              background: "#fff",
              borderRadius: "6px",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Menu size={20} />
          </button>

          {/* User Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "#fff",
                border: "1px solid #e5e5e5",
                padding: "6px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: userDropdownOpen
                  ? "0 2px 8px rgba(0,0,0,0.1)"
                  : "none",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: user?.logo
                    ? `url(${user.logo}) center/cover`
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "14px",
                  border: "2px solid #fff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {!user?.logo && (user?.name?.[0]?.toUpperCase() || "U")}
              </div>
              <div style={{ textAlign: "left" }}>
                <div
                  style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}
                >
                  {user?.name || "User"}
                </div>
                <div style={{ fontSize: "11px", color: "#999" }}>
                  {user?.email || ""}
                </div>
              </div>
              <ChevronDown
                size={16}
                style={{
                  color: "#666",
                  transition: "transform 0.2s",
                  transform: userDropdownOpen
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
              />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <>
                <div
                  onClick={() => setUserDropdownOpen(false)}
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 999,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    minWidth: "200px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    zIndex: 1000,
                    overflow: "hidden",
                    animation: "slideDown 0.2s ease",
                  }}
                >
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      textDecoration: "none",
                      color: "#333",
                      transition: "background 0.2s",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f8f9fa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <UserCircle size={18} style={{ color: "#666" }} />
                    <span style={{ fontSize: "14px", fontWeight: "500" }}>
                      My Profile
                    </span>
                  </Link>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleLogout();
                      navigate("/");
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      background: "transparent",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      color: "#d32f2f",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#fee")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <LogOut size={18} />
                    <span style={{ fontSize: "14px", fontWeight: "500" }}>
                      Logout
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </header>
        <main className="dashboard-content" style={{ padding: "20px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
