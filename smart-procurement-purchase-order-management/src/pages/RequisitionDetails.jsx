import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./RequisitionDetails.css";

function RequisitionDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [requisition, setRequisition] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const getAuth = () => {

        const authData = localStorage.getItem("auth");

        if (!authData) {
            navigate("/login");
            return null;
        }

        return JSON.parse(authData);
    };

    const loadData = async () => {

        const auth = getAuth();

        if (!auth) {
            return;
        }

        try {

            const headers = {
                Authorization: `Basic ${auth.credentials}`,
            };

            const [requisitionResponse, userResponse] =
                await Promise.all([

                    fetch(
                        `http://localhost:8080/requisitions/${id}`,
                        {
                            headers,
                        }
                    ),

                    fetch(
                        "http://localhost:8080/auth/me",
                        {
                            headers,
                        }
                    ),
                ]);

            if (!requisitionResponse.ok) {
                throw new Error(
                    "Unable to load requisition."
                );
            }

            if (!userResponse.ok) {
                throw new Error(
                    "Unable to identify logged-in user."
                );
            }

            const requisitionData =
                await requisitionResponse.json();

            const userData =
                await userResponse.json();

            setRequisition(requisitionData);
            setCurrentUser(userData);

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const performAction = async (
        url,
        method = "PUT"
    ) => {

        const auth = getAuth();

        if (!auth) {
            return;
        }

        try {

            setActionLoading(true);
            setError("");
            setSuccess("");

            const response = await fetch(
                url,
                {
                    method,
                    headers: {
                        Authorization:
                            `Basic ${auth.credentials}`,
                    },
                }
            );

            const text = await response.text();

            if (!response.ok) {

                let message =
                    "Action failed.";

                try {

                    const errorData =
                        JSON.parse(text);

                    message =
                        errorData.message ||
                        errorData.error ||
                        message;

                } catch {

                    if (text) {
                        message = text;
                    }
                }

                throw new Error(message);
            }

            setSuccess(
                "Requisition updated successfully."
            );

            await loadData();

        } catch (err) {

            setError(err.message);

        } finally {

            setActionLoading(false);
        }
    };

    const handleSubmit = () => {

        performAction(
            `http://localhost:8080/requisitions/${id}/submit`
        );
    };

    const handleApprove = () => {

        if (!currentUser) {
            return;
        }

        performAction(
            `http://localhost:8080/requisitions/${id}/approve/${currentUser.userId}`
        );
    };

    const handleReject = () => {

        performAction(
            `http://localhost:8080/requisitions/${id}/reject`
        );
    };

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

    const canApprove = () => {

        if (!requisition || !currentUser) {
            return false;
        }

        const role =
            currentUser.role?.toUpperCase();

        if (
            requisition.status ===
            "PENDING_LEVEL_1"
        ) {
            return role === "MANAGER";
        }

        if (
            requisition.status ===
            "PENDING_LEVEL_2"
        ) {
            return role === "FINANCE";
        }

        if (
            requisition.status ===
            "PENDING_LEVEL_3"
        ) {
            return role === "PROCUREMENT_HEAD";
        }

        return false;
    };

    const getApprovalText = () => {

        if (!requisition) {
            return "Approve";
        }

        if (
            requisition.status ===
            "PENDING_LEVEL_1"
        ) {
            return "Approve as Manager";
        }

        if (
            requisition.status ===
            "PENDING_LEVEL_2"
        ) {
            return "Approve as Finance";
        }

        if (
            requisition.status ===
            "PENDING_LEVEL_3"
        ) {
            return "Approve as Procurement Head";
        }

        return "Approve";
    };

    if (loading) {

        return (
            <div className="dashboard-loading">
                Loading requisition...
            </div>
        );
    }

    if (!requisition) {

        return (
            <div className="app-layout">

                <Sidebar />

                <main className="main-content">

                    <div className="error-message">
                        {error ||
                            "Requisition not found."}
                    </div>

                    <button
                        className="secondary-button"
                        onClick={() =>
                            navigate("/requisitions")
                        }
                    >
                        ← Back to Requisitions
                    </button>

                </main>

            </div>
        );
    }

    return (
        <div className="app-layout">

            <Sidebar />

            <main className="main-content">

                <div className="page-header">

                    <div>

                        <h1>
                            Requisition #
                            {requisition.requisitionId}
                        </h1>

                        <p>
                            View requisition details and
                            approval status.
                        </p>

                    </div>

                    <button
                        className="secondary-button"
                        onClick={() =>
                            navigate("/requisitions")
                        }
                    >
                        ← Back
                    </button>

                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="success-message">
                        {success}
                    </div>
                )}

                <div className="details-card">

                    <div className="details-header">

                        <div>
                            <h2>
                                Requisition #
                                {requisition.requisitionId}
                            </h2>

                            <span
                                className={`status-badge ${getStatusClass(
                                    requisition.status
                                )}`}
                            >
                                {requisition.status}
                            </span>
                        </div>

                    </div>

                    <div className="details-grid">

                        <div className="detail-item">

                            <span className="detail-label">
                                Description
                            </span>

                            <span className="detail-value">
                                {
                                    requisition.description ||
                                    "N/A"
                                }
                            </span>

                        </div>

                        <div className="detail-item">

                            <span className="detail-label">
                                Quantity
                            </span>

                            <span className="detail-value">
                                {requisition.quantity}
                            </span>

                        </div>

                        <div className="detail-item">

                            <span className="detail-label">
                                Product
                            </span>

                            <span className="detail-value">
                                {
                                    requisition.product?.name ||
                                    "N/A"
                                }
                            </span>

                        </div>

                        <div className="detail-item">

                            <span className="detail-label">
                                Price per Product
                            </span>

                            <span className="detail-value">
                                ₹
                                {Number(
                                    requisition.product
                                        ?.pricePerProduct || 0
                                ).toLocaleString(
                                    "en-IN"
                                )}
                            </span>

                        </div>

                        <div className="detail-item">

                            <span className="detail-label">
                                Department
                            </span>

                            <span className="detail-value">
                                {
                                    requisition.department
                                        ?.departmentName ||
                                    "N/A"
                                }
                            </span>

                        </div>

                        <div className="detail-item">

                            <span className="detail-label">
                                Requested By
                            </span>

                            <span className="detail-value">
                                {
                                    requisition.user
                                        ?.userName ||
                                    "N/A"
                                }
                            </span>

                        </div>

                        <div className="detail-item">

                            <span className="detail-label">
                                Created Date
                            </span>

                            <span className="detail-value">
                                {
                                    requisition.createdDate
                                        ? new Date(
                                            requisition.createdDate
                                        ).toLocaleString()
                                        : "N/A"
                                }
                            </span>

                        </div>

                        <div className="detail-item">

                            <span className="detail-label">
                                Last Updated
                            </span>

                            <span className="detail-value">
                                {
                                    requisition.updatedDate
                                        ? new Date(
                                            requisition.updatedDate
                                        ).toLocaleString()
                                        : "N/A"
                                }
                            </span>

                        </div>

                    </div>

                </div>

                <div className="workflow-card">

                    <h2>
                        Approval Workflow
                    </h2>

                    <div className="workflow">

                        <div
                            className={
                                requisition.status ===
                                    "DRAFT"
                                    ? "workflow-step active"
                                    : "workflow-step completed"
                            }
                        >
                            <div className="step-number">
                                1
                            </div>

                            <div>
                                <strong>
                                    Draft
                                </strong>

                                <span>
                                    Requisition created
                                </span>
                            </div>
                        </div>

                        <div
                            className={
                                requisition.status ===
                                    "PENDING_LEVEL_1"
                                    ? "workflow-step active"
                                    : [
                                        "PENDING_LEVEL_2",
                                        "PENDING_LEVEL_3",
                                        "APPROVED"
                                    ].includes(
                                        requisition.status
                                    )
                                        ? "workflow-step completed"
                                        : "workflow-step"
                            }
                        >
                            <div className="step-number">
                                2
                            </div>

                            <div>
                                <strong>
                                    Manager Approval
                                </strong>

                                <span>
                                    Level 1
                                </span>
                            </div>
                        </div>

                        <div
                            className={
                                requisition.status ===
                                    "PENDING_LEVEL_2"
                                    ? "workflow-step active"
                                    : [
                                        "PENDING_LEVEL_3",
                                        "APPROVED"
                                    ].includes(
                                        requisition.status
                                    )
                                        ? "workflow-step completed"
                                        : "workflow-step"
                            }
                        >
                            <div className="step-number">
                                3
                            </div>

                            <div>
                                <strong>
                                    Finance Approval
                                </strong>

                                <span>
                                    Level 2
                                </span>
                            </div>
                        </div>

                        <div
                            className={
                                requisition.status ===
                                    "PENDING_LEVEL_3"
                                    ? "workflow-step active"
                                    : requisition.status ===
                                        "APPROVED"
                                        ? "workflow-step completed"
                                        : "workflow-step"
                            }
                        >
                            <div className="step-number">
                                4
                            </div>

                            <div>
                                <strong>
                                    Procurement Head
                                </strong>

                                <span>
                                    Level 3
                                </span>
                            </div>
                        </div>

                        <div
                            className={
                                requisition.status ===
                                    "APPROVED"
                                    ? "workflow-step completed"
                                    : "workflow-step"
                            }
                        >
                            <div className="step-number">
                                5
                            </div>

                            <div>
                                <strong>
                                    Approved
                                </strong>

                                <span>
                                    Final approval
                                </span>
                            </div>
                        </div>

                    </div>

                </div>

                <div className="action-card">

                    <h2>
                        Actions
                    </h2>

                    <div className="action-buttons">

                        {requisition.status ===
                            "DRAFT" &&
                            currentUser?.userId ===
                            requisition.user?.userId && (

                                <button
                                    className="primary-button"
                                    onClick={handleSubmit}
                                    disabled={actionLoading}
                                >
                                    {actionLoading
                                        ? "Submitting..."
                                        : "Submit Requisition"}
                                </button>

                            )}

                        {canApprove() && (

                            <button
                                className="approve-button"
                                onClick={handleApprove}
                                disabled={actionLoading}
                            >
                                {actionLoading
                                    ? "Processing..."
                                    : getApprovalText()}
                            </button>

                        )}

                        {requisition.status !==
                            "APPROVED" &&
                            requisition.status !==
                            "REJECTED" &&
                            currentUser?.role &&
                            currentUser.role.toUpperCase() !==
                            "EMPLOYEE" && (

                                <button
                                    className="reject-button"
                                    onClick={handleReject}
                                    disabled={actionLoading}
                                >
                                    {actionLoading
                                        ? "Processing..."
                                        : "Reject Requisition"}
                                </button>

                            )}

                        {requisition.status ===
                            "APPROVED" && (

                                <div className="approved-message">
                                    ✓ Requisition approved.
                                    You can now generate a
                                    Purchase Order.
                                </div>

                            )}

                        {requisition.status ===
                            "REJECTED" && (

                                <div className="rejected-message">
                                    ✕ This requisition has
                                    been rejected.
                                </div>

                            )}

                    </div>

                </div>

            </main>

        </div>
    );
}

export default RequisitionDetails;