import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./Analytics.css";

function Analytics() {
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [departmentSpend, setDepartmentSpend] = useState([]);
    const [categorySpend, setCategorySpend] = useState([]);
    const [supplierRatings, setSupplierRatings] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getAuth = () => {
        const authData = localStorage.getItem("auth");

        if (!authData) {
            navigate("/login");
            return null;
        }

        try {
            return JSON.parse(authData);
        } catch {
            localStorage.removeItem("auth");
            navigate("/login");
            return null;
        }
    };

    const getHeaders = () => {
        const auth = getAuth();

        if (!auth) {
            return null;
        }

        return {
            Authorization: `Basic ${auth.credentials}`,
        };
    };

    const loadAnalytics = async () => {
        const headers = getHeaders();

        if (!headers) {
            return;
        }

        try {
            setLoading(true);
            setError("");

            const [
                dashboardResponse,
                departmentResponse,
                categoryResponse,
                supplierResponse,
            ] = await Promise.all([
                fetch(
                    "http://localhost:8080/analytics/dashboard",
                    { headers }
                ),
                fetch(
                    "http://localhost:8080/analytics/spend-by-department",
                    { headers }
                ),
                fetch(
                    "http://localhost:8080/analytics/spend-by-category",
                    { headers }
                ),
                fetch(
                    "http://localhost:8080/analytics/supplier-ratings",
                    { headers }
                ),
            ]);

            if (
                !dashboardResponse.ok ||
                !departmentResponse.ok ||
                !categoryResponse.ok ||
                !supplierResponse.ok
            ) {
                throw new Error(
                    "Unable to load analytics data."
                );
            }

            const dashboardData =
                await dashboardResponse.json();

            const departmentData =
                await departmentResponse.json();

            const categoryData =
                await categoryResponse.json();

            const supplierData =
                await supplierResponse.json();

            setDashboard(dashboardData);
            setDepartmentSpend(departmentData);
            setCategorySpend(categoryData);
            setSupplierRatings(supplierData);

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnalytics();
    }, []);

    const formatCurrency = (value) => {
        return `₹${Number(value || 0).toLocaleString(
            "en-IN"
        )}`;
    };

    const formatNumber = (value) => {
        return Number(value || 0).toLocaleString(
            "en-IN"
        );
    };

    const downloadReport = async (type) => {
        const headers = getHeaders();

        if (!headers) {
            return;
        }

        try {
            const endpoint =
                type === "pdf"
                    ? "http://localhost:8080/analytics/report/pdf"
                    : "http://localhost:8080/analytics/report/excel";

            const response = await fetch(endpoint, {
                headers,
            });

            if (!response.ok) {
                throw new Error(
                    `Unable to download ${type.toUpperCase()} report.`
                );
            }

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;

            link.download =
                type === "pdf"
                    ? "procurement-report.pdf"
                    : "procurement-report.xlsx";

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="analytics-loading">
                Loading analytics...
            </div>
        );
    }

    return (
        <div className="app-layout">

            <Sidebar />

            <main className="main-content">

                <div className="page-header">

                    <div>
                        <h1>Analytics & Reports</h1>

                        <p>
                            Procurement spending,
                            supplier performance and
                            business KPIs.
                        </p>
                    </div>

                    <div className="report-buttons">

                        <button
                            className="pdf-button"
                            onClick={() =>
                                downloadReport("pdf")
                            }
                        >
                            ↓ PDF Report
                        </button>

                        <button
                            className="excel-button"
                            onClick={() =>
                                downloadReport("excel")
                            }
                        >
                            ↓ Excel Report
                        </button>

                    </div>

                </div>

                {error && (
                    <div className="analytics-error">
                        {error}
                    </div>
                )}

                {dashboard && (
                    <section>

                        <h2 className="section-title">
                            Dashboard KPIs
                        </h2>

                        <div className="kpi-grid">

                            <div className="kpi-card">

                                <div className="kpi-label">
                                    Total Requisitions
                                </div>

                                <div className="kpi-value">
                                    {formatNumber(
                                        dashboard.totalRequisitions
                                    )}
                                </div>

                            </div>

                            <div className="kpi-card approved">

                                <div className="kpi-label">
                                    Approved Requisitions
                                </div>

                                <div className="kpi-value">
                                    {formatNumber(
                                        dashboard.approvedRequisitions
                                    )}
                                </div>

                            </div>

                            <div className="kpi-card rejected">

                                <div className="kpi-label">
                                    Rejected Requisitions
                                </div>

                                <div className="kpi-value">
                                    {formatNumber(
                                        dashboard.rejectedRequisitions
                                    )}
                                </div>

                            </div>

                            <div className="kpi-card spend">

                                <div className="kpi-label">
                                    Total Spend
                                </div>

                                <div className="kpi-value">
                                    {formatCurrency(
                                        dashboard.totalSpend
                                    )}
                                </div>

                            </div>

                            <div className="kpi-card">

                                <div className="kpi-label">
                                    Total Purchase Orders
                                </div>

                                <div className="kpi-value">
                                    {formatNumber(
                                        dashboard.totalPurchaseOrders
                                    )}
                                </div>

                            </div>

                            <div className="kpi-card closed">

                                <div className="kpi-label">
                                    Closed Purchase Orders
                                </div>

                                <div className="kpi-value">
                                    {formatNumber(
                                        dashboard.closedPurchaseOrders
                                    )}
                                </div>

                            </div>

                        </div>

                    </section>
                )}

                <section>

                    <h2 className="section-title">
                        Spend by Department
                    </h2>

                    <div className="analytics-card">

                        {departmentSpend.length === 0 ? (

                            <div className="empty-state">
                                No department spending data available.
                            </div>

                        ) : (

                            <table className="analytics-table">

                                <thead>
                                    <tr>
                                        <th>
                                            Department
                                        </th>

                                        <th>
                                            Total Spend
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {departmentSpend.map(
                                        (item, index) => (

                                            <tr key={index}>

                                                <td>
                                                    {item.department}
                                                </td>

                                                <td className="money">
                                                    {formatCurrency(
                                                        item.totalSpend
                                                    )}
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        )}

                    </div>

                </section>

                <section>

                    <h2 className="section-title">
                        Spend by Category
                    </h2>

                    <div className="analytics-card">

                        {categorySpend.length === 0 ? (

                            <div className="empty-state">
                                No category spending data available.
                            </div>

                        ) : (

                            <table className="analytics-table">

                                <thead>
                                    <tr>
                                        <th>
                                            Category
                                        </th>

                                        <th>
                                            Total Spend
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {categorySpend.map(
                                        (item, index) => (

                                            <tr key={index}>

                                                <td>
                                                    {item.category}
                                                </td>

                                                <td className="money">
                                                    {formatCurrency(
                                                        item.totalSpend
                                                    )}
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        )}

                    </div>

                </section>

                <section>

                    <h2 className="section-title">
                        Supplier Ratings
                    </h2>

                    <div className="analytics-card">

                        {supplierRatings.length === 0 ? (

                            <div className="empty-state">
                                No supplier rating data available.
                            </div>

                        ) : (

                            <table className="analytics-table">

                                <thead>
                                    <tr>
                                        <th>
                                            Supplier
                                        </th>

                                        <th>
                                            Supplier ID
                                        </th>

                                        <th>
                                            Rating
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {supplierRatings.map(
                                        (supplier, index) => (

                                            <tr key={index}>

                                                <td>
                                                    <strong>
                                                        {
                                                            supplier.supplierName
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        supplier.supplierId
                                                    }
                                                </td>

                                                <td>

                                                    <span className="rating">
                                                        ★{" "}
                                                        {
                                                            supplier.rating
                                                        }
                                                    </span>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        )}

                    </div>

                </section>

                <section className="report-section">

                    <h2 className="section-title">
                        Reports
                    </h2>

                    <div className="report-card">

                        <div>

                            <h3>
                                Procurement Report
                            </h3>

                            <p>
                                Download a complete report
                                containing dashboard KPIs,
                                spending analysis, supplier
                                ratings and purchase orders.
                            </p>

                        </div>

                        <div className="report-buttons">

                            <button
                                className="pdf-button"
                                onClick={() =>
                                    downloadReport("pdf")
                                }
                            >
                                Download PDF
                            </button>

                            <button
                                className="excel-button"
                                onClick={() =>
                                    downloadReport("excel")
                                }
                            >
                                Download Excel
                            </button>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default Analytics;