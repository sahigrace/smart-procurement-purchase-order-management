import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./AuditLogs.css";

function AuditLogs() {

    const navigate = useNavigate();

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const authData = localStorage.getItem("auth");
    const auth = authData ? JSON.parse(authData) : null;

    useEffect(() => {

        if (!auth) {
            navigate("/login");
            return;
        }

        fetch("http://localhost:8080/audit-logs", {
            method: "GET",
            headers: {
                Authorization: `Basic ${auth.credentials}`,
            },
        })
            .then((response) => {

                if (!response.ok) {

                    if (response.status === 403) {
                        throw new Error(
                            "Access denied. Only ADMIN users can view audit logs."
                        );
                    }

                    throw new Error(
                        "Failed to load audit logs."
                    );
                }

                return response.json();
            })
            .then((data) => {

                setLogs(data);
                setLoading(false);

            })
            .catch((err) => {

                setError(err.message);
                setLoading(false);

            });

    }, [navigate]);

    const formatDate = (dateValue) => {

        if (!dateValue) {
            return "-";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return dateValue;
        }

        return date.toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    const getActionClass = (action) => {

        if (!action) {
            return "action-default";
        }

        const value = action.toUpperCase();

        if (value.includes("APPROV")) {
            return "action-approved";
        }

        if (value.includes("REJECT")) {
            return "action-rejected";
        }

        if (value.includes("CREATE")) {
            return "action-created";
        }

        if (
            value.includes("UPDATE") ||
            value.includes("SHIP")
        ) {
            return "action-updated";
        }

        if (value.includes("CLOSE")) {
            return "action-closed";
        }

        return "action-default";
    };

    if (loading) {

        return (
            <div className="audit-loading">
                Loading audit logs...
            </div>
        );
    }

    return (
        <div className="app-layout">

            <Sidebar />

            <main className="main-content">

                {/* HEADER */}

                <div className="audit-header">

                    <div>
                        <h1>
                            Audit Logs
                        </h1>

                        <p>
                            Track system activities,
                            approvals and procurement actions.
                        </p>
                    </div>

                    <button
                        className="back-btn"
                        onClick={() => navigate("/dashboard")}
                    >
                        ← Dashboard
                    </button>

                </div>

                {/* ERROR */}

                {error && (
                    <div className="audit-error">

                        <h3>
                            Unable to load audit logs
                        </h3>

                        <p>
                            {error}
                        </p>

                    </div>
                )}

                {/* SUMMARY */}

                {!error && (

                    <div className="audit-summary">

                        <div className="audit-summary-card">

                            <span>
                                Total Logs
                            </span>

                            <strong>
                                {logs.length}
                            </strong>

                        </div>

                        <div className="audit-summary-card">

                            <span>
                                Requisition Logs
                            </span>

                            <strong>
                                {
                                    logs.filter(
                                        (log) =>
                                            String(
                                                log.entityType || ""
                                            ).toUpperCase()
                                                .includes("REQUISITION")
                                    ).length
                                }
                            </strong>

                        </div>

                        <div className="audit-summary-card">

                            <span>
                                Purchase Order Logs
                            </span>

                            <strong>
                                {
                                    logs.filter(
                                        (log) =>
                                            String(
                                                log.entityType || ""
                                            ).toUpperCase()
                                                .includes("PURCHASE")
                                    ).length
                                }
                            </strong>

                        </div>

                    </div>

                )}

                {/* TABLE */}

                {!error && (

                    <div className="audit-card">

                        {logs.length === 0 ? (

                            <div className="audit-empty">
                                No audit logs available.
                            </div>

                        ) : (

                            <div className="audit-table-wrapper">

                                <table className="audit-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                ID
                                            </th>

                                            <th>
                                                Action
                                            </th>

                                            <th>
                                                Entity
                                            </th>

                                            <th>
                                                Entity ID
                                            </th>

                                            <th>
                                                Performed By
                                            </th>

                                            <th>
                                                Timestamp
                                            </th>

                                            <th>
                                                Details
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {logs.map((log) => (

                                            <tr
                                                key={
                                                    log.auditLogId ||
                                                    log.id
                                                }
                                            >

                                                <td>
                                                    #
                                                    {
                                                        log.auditLogId ||
                                                        log.id ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>

                                                    <span
                                                        className={`audit-action ${getActionClass(
                                                            log.action
                                                        )}`}
                                                    >
                                                        {
                                                            log.action ||
                                                            "-"
                                                        }
                                                    </span>

                                                </td>

                                                <td>
                                                    {
                                                        log.entityType ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        log.entityId ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    <strong>
                                                        {
                                                            log.performedBy ||
                                                            "System"
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        formatDate(
                                                            log.timestamp ||
                                                            log.createdAt
                                                        )
                                                    }
                                                </td>

                                                <td className="details-cell">

                                                    {
                                                        log.details ||
                                                        "-"
                                                    }

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                )}

            </main>

        </div>
    );
}

export default AuditLogs;