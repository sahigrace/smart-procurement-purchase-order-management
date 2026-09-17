import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import "./App.css";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import Requisitions from "./pages/Requisitions";
import CreateRequisition from "./pages/CreateRequisition";
import RequisitionDetails from "./pages/RequisitionDetails";

import PurchaseOrders from "./pages/PurchaseOrders";

import Analytics from "./pages/Analytics";

import AuditLogs from "./pages/AuditLogs";

import Users from "./pages/Users";

import Departments from "./pages/Departments";

import Suppliers from "./pages/Suppliers";

import Products from "./pages/Products";


function App() {

    return (
        <BrowserRouter>

            <Routes>

                {/* =========================
                    DEFAULT
                ========================= */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

                {/* =========================
                    LOGIN
                ========================= */}

                <Route
                    path="/login"
                    element={
                        <Login />
                    }
                />

                {/* =========================
                    DASHBOARD
                ========================= */}

                <Route
                    path="/dashboard"
                    element={
                        <Dashboard />
                    }
                />

                {/* =========================
                    REQUISITIONS
                ========================= */}

                <Route
                    path="/requisitions"
                    element={
                        <Requisitions />
                    }
                />

                <Route
                    path="/requisitions/create"
                    element={
                        <CreateRequisition />
                    }
                />

                <Route
                    path="/requisitions/:id"
                    element={
                        <RequisitionDetails />
                    }
                />

                {/* =========================
                    PURCHASE ORDERS
                ========================= */}

                <Route
                    path="/purchase-orders"
                    element={
                        <PurchaseOrders />
                    }
                />

                {/* =========================
                    ANALYTICS
                ========================= */}

                <Route
                    path="/analytics"
                    element={
                        <Analytics />
                    }
                />

                {/* =========================
                    AUDIT LOGS
                ========================= */}

                <Route
                    path="/audit-logs"
                    element={
                        <AuditLogs />
                    }
                />

                {/* =========================
                    ADMIN - USERS
                ========================= */}

                <Route
                    path="/admin/users"
                    element={
                        <Users />
                    }
                />

                {/* =========================
                    MASTER DATA - DEPARTMENTS
                ========================= */}

                <Route
                    path="/departments"
                    element={
                        <Departments />
                    }
                />

                {/* =========================
                    MASTER DATA - SUPPLIERS
                ========================= */}

                <Route
                    path="/suppliers"
                    element={
                        <Suppliers />
                    }
                />

                {/* =========================
                    MASTER DATA - PRODUCTS
                ========================= */}

                <Route
                    path="/products"
                    element={
                        <Products />
                    }
                />

                {/* =========================
                    UNKNOWN PAGE
                ========================= */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;