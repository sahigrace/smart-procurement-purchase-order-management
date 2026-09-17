import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {

    const navigate = useNavigate();
    const location = useLocation();

    const authData = localStorage.getItem("auth");
    const auth = authData ? JSON.parse(authData) : null;

    const username = auth?.username || "User";

    const role =
        auth?.authorities?.[0]?.authority
            ?.replace("ROLE_", "") || "USER";

    const handleLogout = () => {
        localStorage.removeItem("auth");
        navigate("/login");
    };

    const menuItems = [
        {
            name: "Dashboard",
            icon: "⌂",
            path: "/dashboard",
            roles: [
                "ADMIN",
                "EMPLOYEE",
                "MANAGER",
                "FINANCE",
                "PROCUREMENT_HEAD"
            ]
        },
        {
            name: "Requisitions",
            icon: "▣",
            path: "/requisitions",
            roles: [
                "ADMIN",
                "EMPLOYEE",
                "MANAGER",
                "FINANCE",
                "PROCUREMENT_HEAD"
            ]
        },
        {
            name: "Purchase Orders",
            icon: "▤",
            path: "/purchase-orders",
            roles: [
                "ADMIN",
                "PROCUREMENT_HEAD"
            ]
        },
        {
            name: "Analytics",
            icon: "◈",
            path: "/analytics",
            roles: [
                "ADMIN",
                "FINANCE",
                "PROCUREMENT_HEAD"
            ]
        },
        {
            name: "Audit Logs",
            icon: "☷",
            path: "/audit-logs",
            roles: [
                "ADMIN"
            ]
        },
        {
            name: "Users",
            icon: "♙",
            path: "/admin/users",
            roles: [
                "ADMIN"
            ]
        },
        {
            name: "Departments",
            icon: "▦",
            path: "/departments",
            roles: [
                "ADMIN",
                "MANAGER"
            ]
        },
        {
            name: "Suppliers",
            icon: "♢",
            path: "/suppliers",
            roles: [
                "ADMIN",
                "PROCUREMENT_HEAD"
            ]
        },
        {
            name: "Products",
            icon: "□",
            path: "/products",
            roles: [
                "ADMIN",
                "PROCUREMENT_HEAD"
            ]
        }
    ];

    const visibleItems = menuItems.filter(
        (item) => item.roles.includes(role)
    );

    const isActive = (path) => {

        if (path === "/dashboard") {
            return location.pathname === "/dashboard";
        }

        return location.pathname.startsWith(path);
    };

    return (
        <aside className="sidebar">

            {/* =========================
                LOGO
            ========================= */}

            <div className="sidebar-logo">

                <div className="logo-icon">
                    SP
                </div>

                <div className="logo-text">

                    <h2>
                        Smart Procurement
                    </h2>

                    <span>
                        Purchase Order Management
                    </span>

                </div>

            </div>

            {/* =========================
                USER
            ========================= */}

            <div className="user-info">

                <div className="user-avatar">
                    {username.charAt(0).toUpperCase()}
                </div>

                <div className="user-details">

                    <strong>
                        {username}
                    </strong>

                    <small>
                        {role.replace("_", " ")}
                    </small>

                </div>

            </div>

            {/* =========================
                NAVIGATION
            ========================= */}

            <div className="menu-heading">
                MAIN MENU
            </div>

            <nav className="sidebar-menu">

                {visibleItems.map((item) => (

                    <button
                        key={item.path}
                        className={
                            isActive(item.path)
                                ? "menu-item active"
                                : "menu-item"
                        }
                        onClick={() =>
                            navigate(item.path)
                        }
                    >

                        <span className="menu-icon">
                            {item.icon}
                        </span>

                        <span className="menu-label">
                            {item.name}
                        </span>

                    </button>

                ))}

            </nav>

            {/* =========================
                BOTTOM
            ========================= */}

            <div className="sidebar-bottom">

                <div className="system-label">
                    Group 2
                </div>

                <button
                    className="menu-item logout-menu"
                    onClick={handleLogout}
                >

                    <span className="menu-icon">
                        ⇥
                    </span>

                    <span className="menu-label">
                        Logout
                    </span>

                </button>

            </div>

        </aside>
    );
}

export default Sidebar;