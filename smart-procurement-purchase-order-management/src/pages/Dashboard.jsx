import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

function Dashboard() {

    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [error, setError] = useState("");

    const [user, setUser] = useState(null);

    useEffect(() => {

        const authData = localStorage.getItem("auth");

        if (!authData) {
            navigate("/login");
            return;
        }

        const auth = JSON.parse(authData);

        // =========================
        // GET CURRENT USER
        // =========================

        fetch("http://localhost:8080/auth/me", {
            method: "GET",
            headers: {
                Authorization: `Basic ${auth.credentials}`,
            },
        })
            .then((response) => {

                if (!response.ok) {
                    throw new Error("Unable to load user information.");
                }

                return response.json();
            })
            .then((data) => {
                setUser(data);
            })
            .catch((err) => {
                console.error(err);
            });

        // =========================
        // GET DASHBOARD
        // =========================

        fetch("http://localhost:8080/analytics/dashboard", {
            method: "GET",
            headers: {
                Authorization: `Basic ${auth.credentials}`,
            },
        })
            .then((response) => {

                if (!response.ok) {
                    throw new Error(
                        "You do not have permission to view analytics."
                    );
                }

                return response.json();
            })
            .then((data) => {
                setDashboard(data);
            })
            .catch((err) => {
                setError(err.message);
            });

    }, [navigate]);

    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {

        localStorage.removeItem("auth");

        navigate("/login");
    };

    // =========================
    // LOADING
    // =========================

    if (!dashboard && !error) {
        return (
            <div className="dashboard-loading">
                Loading dashboard...
            </div>
        );
    }

    // =========================
    // ERROR
    // =========================

    if (error) {
        return (
            <div className="dashboard-error">

                <h2>{error}</h2>

                <button
                    onClick={() => navigate("/login")}
                >
                    Back to Login
                </button>

            </div>
        );
    }

    return (
        <div className="app-layout">

            {/* SIDEBAR */}

            <Sidebar />

            {/* MAIN CONTENT */}

            <main className="main-content">

                {/* =========================
                    HEADER
                ========================= */}

                <div className="page-header">

                    <div>

                        <h1>
                            Dashboard Overview
                        </h1>

                        <p>
                            Development of Smart Procurement & Purchase
                            Order Management System — Group 2
                        </p>

                    </div>

                    <div className="user-info">

                        <div className="user-avatar">
                            {(user?.userName || "U")
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div className="user-details">

                            <strong>
                                {user?.userName || "User"}
                            </strong>

                            <span>
                                {user?.role || "USER"}
                            </span>

                        </div>

                        <button
                            className="logout-btn"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </div>

                {/* =========================
                    WELCOME
                ========================= */}

                <div className="welcome-banner">

                    <div>

                        <h2>
                            Welcome back,{" "}
                            {user?.userName || "User"} 👋
                        </h2>

                        <p>
                            Here's an overview of your procurement
                            activities and purchase orders.
                        </p>

                    </div>

                </div>

                {/* =========================
                    KPI CARDS
                ========================= */}

                <div className="kpi-grid">

                    <div className="kpi-card">

                        <div className="kpi-icon">
                            📋
                        </div>

                        <div>
                            <h3>
                                Total Requisitions
                            </h3>

                            <p>
                                {dashboard.totalRequisitions}
                            </p>
                        </div>

                    </div>

                    <div className="kpi-card approved">

                        <div className="kpi-icon">
                            ✓
                        </div>

                        <div>
                            <h3>
                                Approved
                            </h3>

                            <p>
                                {dashboard.approvedRequisitions}
                            </p>
                        </div>

                    </div>

                    <div className="kpi-card rejected">

                        <div className="kpi-icon">
                            ✕
                        </div>

                        <div>
                            <h3>
                                Rejected
                            </h3>

                            <p>
                                {dashboard.rejectedRequisitions}
                            </p>
                        </div>

                    </div>

                    <div className="kpi-card spending">

                        <div className="kpi-icon">
                            ₹
                        </div>

                        <div>
                            <h3>
                                Total Spend
                            </h3>

                            <p>
                                ₹
                                {Number(
                                    dashboard.totalSpend
                                ).toLocaleString("en-IN")}
                            </p>
                        </div>

                    </div>

                    <div className="kpi-card">

                        <div className="kpi-icon">
                            🛒
                        </div>

                        <div>
                            <h3>
                                Total Purchase Orders
                            </h3>

                            <p>
                                {dashboard.totalPurchaseOrders}
                            </p>
                        </div>

                    </div>

                    <div className="kpi-card">

                        <div className="kpi-icon">
                            📦
                        </div>

                        <div>
                            <h3>
                                Closed Purchase Orders
                            </h3>

                            <p>
                                {dashboard.closedPurchaseOrders}
                            </p>
                        </div>

                    </div>

                </div>

                {/* =========================
                    QUICK ACTIONS
                ========================= */}

                <div className="section-title">

                    <h2>
                        Quick Actions
                    </h2>

                    <p>
                        Access the main procurement modules.
                    </p>

                </div>

                <div className="quick-actions">

                    <div
                        className="action-card"
                        onClick={() =>
                            navigate("/requisitions")
                        }
                    >

                        <div className="action-icon">
                            📋
                        </div>

                        <h3>
                            Requisitions
                        </h3>

                        <p>
                            Create, submit and manage
                            procurement requisitions.
                        </p>

                        <span>
                            Open →
                        </span>

                    </div>

                    <div
                        className="action-card"
                        onClick={() =>
                            navigate("/purchase-orders")
                        }
                    >

                        <div className="action-icon">
                            🛒
                        </div>

                        <h3>
                            Purchase Orders
                        </h3>

                        <p>
                            Generate and track purchase
                            orders and shipments.
                        </p>

                        <span>
                            Open →
                        </span>

                    </div>

                    <div
                        className="action-card"
                        onClick={() =>
                            navigate("/analytics")
                        }
                    >

                        <div className="action-icon">
                            📊
                        </div>

                        <h3>
                            Analytics
                        </h3>

                        <p>
                            View procurement analytics,
                            KPIs and reports.
                        </p>

                        <span>
                            Open →
                        </span>

                    </div>

                    <div
                        className="action-card"
                        onClick={() =>
                            navigate("/audit-logs")
                        }
                    >

                        <div className="action-icon">
                            📝
                        </div>

                        <h3>
                            Audit Logs
                        </h3>

                        <p>
                            Track system activities,
                            approvals and changes.
                        </p>

                        <span>
                            Open →
                        </span>

                    </div>

                    {user?.role === "ADMIN" && (

                        <div
                            className="action-card admin-action"
                            onClick={() =>
                                navigate("/admin/users")
                            }
                        >

                            <div className="action-icon">
                                👥
                            </div>

                            <h3>
                                User Management
                            </h3>

                            <p>
                                Manage users, roles and
                                departments.
                            </p>

                            <span>
                                Open →
                            </span>

                        </div>

                    )}

                </div>

            </main>

        </div>
    );
}

export default Dashboard;