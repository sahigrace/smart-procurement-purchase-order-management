import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./Requisitions.css";

function Requisitions() {

    const navigate = useNavigate();

    const [requisitions, setRequisitions] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const loadRequisitions = async () => {

        const authData = localStorage.getItem("auth");

        if (!authData) {
            navigate("/login");
            return;
        }

        const auth = JSON.parse(authData);

        try {

            const response = await fetch(
                "http://localhost:8080/requisitions",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Basic ${auth.credentials}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to load requisitions."
                );
            }

            const data = await response.json();

            setRequisitions(data);

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequisitions();
    }, []);

    const getStatusClass = (status) => {

        if (status === "APPROVED") {
            return "status-approved";
        }

        if (status === "REJECTED") {
            return "status-rejected";
        }

        if (status === "DRAFT") {
            return "status-draft";
        }

        return "status-pending";
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                Loading requisitions...
            </div>
        );
    }

    return (
        <div className="app-layout">

            <Sidebar />

            <main className="main-content">

                <div className="page-header">

                    <div>
                        <h1>Requisitions</h1>

                        <p>
                            Create, submit and track procurement
                            requisitions.
                        </p>
                    </div>

                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate("/requisitions/create")
                        }
                    >
                        + Create Requisition
                    </button>

                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="requisition-table-container">

                    <table className="requisition-table">

                        <thead>

                            <tr>
                                <th>ID</th>
                                <th>Description</th>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Department</th>
                                <th>Requested By</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>

                        </thead>

                        <tbody>

                            {requisitions.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="8"
                                        className="no-data"
                                    >
                                        No requisitions found.
                                    </td>

                                </tr>

                            ) : (

                                requisitions.map(
                                    (requisition) => (

                                        <tr
                                            key={
                                                requisition.requisitionId
                                            }
                                        >

                                            <td>
                                                #
                                                {
                                                    requisition.requisitionId
                                                }
                                            </td>

                                            <td>
                                                {
                                                    requisition.description
                                                }
                                            </td>

                                            <td>
                                                {
                                                    requisition.product?.name ||
                                                    "N/A"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    requisition.quantity
                                                }
                                            </td>

                                            <td>
                                                {
                                                    requisition.department
                                                        ?.departmentName ||
                                                    "N/A"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    requisition.user
                                                        ?.userName ||
                                                    "N/A"
                                                }
                                            </td>

                                            <td>

                                                <span
                                                    className={`status-badge ${getStatusClass(
                                                        requisition.status
                                                    )}`}
                                                >
                                                    {
                                                        requisition.status
                                                    }
                                                </span>

                                            </td>

                                            <td>

                                                <button
                                                    className="view-button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/requisitions/${requisition.requisitionId}`
                                                        )
                                                    }
                                                >
                                                    View
                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </main>

        </div>
    );
}

export default Requisitions;