import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./PurchaseOrders.css";

function PurchaseOrders() {

    const navigate = useNavigate();

    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [requisitions, setRequisitions] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    const [showGenerateForm, setShowGenerateForm] = useState(false);

    const [selectedRequisition, setSelectedRequisition] = useState("");
    const [selectedSupplier, setSelectedSupplier] = useState("");

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

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

    const getHeaders = () => {

        const auth = getAuth();

        if (!auth) {
            return null;
        }

        return {
            Authorization: `Basic ${auth.credentials}`,
        };
    };

    const loadPurchaseOrders = async () => {

        const headers = getHeaders();

        if (!headers) {
            return;
        }

        const response = await fetch(
            "http://localhost:8080/purchase-orders",
            {
                headers,
            }
        );

        if (!response.ok) {
            throw new Error(
                "Unable to load purchase orders."
            );
        }

        const data = await response.json();

        setPurchaseOrders(data);
    };

    const loadRequisitions = async () => {

        const headers = getHeaders();

        if (!headers) {
            return;
        }

        const response = await fetch(
            "http://localhost:8080/requisitions",
            {
                headers,
            }
        );

        if (!response.ok) {
            throw new Error(
                "Unable to load requisitions."
            );
        }

        const data = await response.json();

        setRequisitions(
            data.filter(
                (requisition) =>
                    requisition.status === "APPROVED"
            )
        );
    };

    const loadSuppliers = async () => {

        const headers = getHeaders();

        if (!headers) {
            return;
        }

        const response = await fetch(
            "http://localhost:8080/suppliers",
            {
                headers,
            }
        );

        if (!response.ok) {
            throw new Error(
                "Unable to load suppliers."
            );
        }

        const data = await response.json();

        setSuppliers(data);
    };

    const loadAllData = async () => {

        try {

            setLoading(true);
            setError("");

            await Promise.all([
                loadPurchaseOrders(),
                loadRequisitions(),
                loadSuppliers(),
            ]);

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const generatePurchaseOrder = async (e) => {

        e.preventDefault();

        if (!selectedRequisition) {
            setError(
                "Please select an approved requisition."
            );
            return;
        }

        if (!selectedSupplier) {
            setError(
                "Please select a supplier."
            );
            return;
        }

        const headers = getHeaders();

        if (!headers) {
            return;
        }

        try {

            setGenerating(true);
            setError("");
            setSuccess("");

            const response = await fetch(
                `http://localhost:8080/purchase-orders/generate?requisitionId=${selectedRequisition}&supplierId=${selectedSupplier}`,
                {
                    method: "POST",
                    headers,
                }
            );

            const text = await response.text();

            if (!response.ok) {

                let message =
                    "Failed to generate purchase order.";

                try {

                    const data =
                        JSON.parse(text);

                    message =
                        data.message ||
                        data.error ||
                        message;

                } catch {

                    if (text) {
                        message = text;
                    }
                }

                throw new Error(message);
            }

            setSuccess(
                "Purchase Order generated successfully."
            );

            setSelectedRequisition("");
            setSelectedSupplier("");
            setShowGenerateForm(false);

            await loadPurchaseOrders();
            await loadRequisitions();

        } catch (err) {

            setError(err.message);

        } finally {

            setGenerating(false);
        }
    };

    const performPOAction = async (
        poId,
        action,
        url
    ) => {

        const headers = getHeaders();

        if (!headers) {
            return;
        }

        try {

            setActionLoading(`${poId}-${action}`);
            setError("");
            setSuccess("");

            const response = await fetch(
                url,
                {
                    method: "PUT",
                    headers,
                }
            );

            const text = await response.text();

            if (!response.ok) {

                let message =
                    "Purchase Order action failed.";

                try {

                    const data =
                        JSON.parse(text);

                    message =
                        data.message ||
                        data.error ||
                        message;

                } catch {

                    if (text) {
                        message = text;
                    }
                }

                throw new Error(message);
            }

            setSuccess(
                "Purchase Order updated successfully."
            );

            await loadPurchaseOrders();

        } catch (err) {

            setError(err.message);

        } finally {

            setActionLoading(null);
        }
    };

    const handleSend = (poId) => {

        performPOAction(
            poId,
            "send",
            `http://localhost:8080/purchase-orders/${poId}/send`
        );
    };

    const handleShipment = (
        poId,
        shipmentStatus
    ) => {

        performPOAction(
            poId,
            shipmentStatus,
            `http://localhost:8080/purchase-orders/${poId}/shipment?shipmentStatus=${shipmentStatus}`
        );
    };

    const handleClose = (poId) => {

        performPOAction(
            poId,
            "close",
            `http://localhost:8080/purchase-orders/${poId}/close`
        );
    };

    const getStatusClass = (status) => {

        switch (status) {

            case "GENERATED":
                return "po-generated";

            case "SENT_TO_SUPPLIER":
                return "po-sent";

            case "SHIPMENT_IN_PROGRESS":
                return "po-progress";

            case "DELIVERED":
                return "po-delivered";

            case "CLOSED":
                return "po-closed";

            default:
                return "po-default";
        }
    };

    const getShipmentClass = (status) => {

        switch (status) {

            case "IN_PROGRESS":
                return "shipment-progress";

            case "DELIVERED":
                return "shipment-delivered";

            default:
                return "shipment-default";
        }
    };

    const formatStatus = (status) => {

        if (!status) {
            return "N/A";
        }

        return status
            .replaceAll("_", " ");
    };

    if (loading) {

        return (
            <div className="dashboard-loading">
                Loading purchase orders...
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
                            Purchase Orders
                        </h1>

                        <p>
                            Generate and track purchase orders
                            and shipments.
                        </p>

                    </div>

                    <button
                        className="primary-button"
                        onClick={() =>
                            setShowGenerateForm(
                                !showGenerateForm
                            )
                        }
                    >
                        {showGenerateForm
                            ? "Cancel"
                            : "+ Generate Purchase Order"}
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

                {showGenerateForm && (

                    <div className="generate-card">

                        <h2>
                            Generate Purchase Order
                        </h2>

                        <p>
                            Select an approved requisition
                            and supplier.
                        </p>

                        <form
                            onSubmit={
                                generatePurchaseOrder
                            }
                        >

                            <div className="generate-grid">

                                <div className="form-group">

                                    <label>
                                        Approved Requisition
                                    </label>

                                    <select
                                        value={
                                            selectedRequisition
                                        }
                                        onChange={(e) =>
                                            setSelectedRequisition(
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            Select Requisition
                                        </option>

                                        {requisitions.map(
                                            (requisition) => (

                                                <option
                                                    key={
                                                        requisition.requisitionId
                                                    }
                                                    value={
                                                        requisition.requisitionId
                                                    }
                                                >
                                                    #
                                                    {
                                                        requisition.requisitionId
                                                    }
                                                    {" - "}
                                                    {
                                                        requisition.description
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                                <div className="form-group">

                                    <label>
                                        Supplier
                                    </label>

                                    <select
                                        value={
                                            selectedSupplier
                                        }
                                        onChange={(e) =>
                                            setSelectedSupplier(
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            Select Supplier
                                        </option>

                                        {suppliers.map(
                                            (supplier) => (

                                                <option
                                                    key={
                                                        supplier.supplierId
                                                    }
                                                    value={
                                                        supplier.supplierId
                                                    }
                                                >
                                                    {
                                                        supplier.name
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                            </div>

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={generating}
                            >
                                {generating
                                    ? "Generating..."
                                    : "Generate Purchase Order"}
                            </button>

                        </form>

                    </div>
                )}

                <div className="po-table-container">

                    <table className="po-table">

                        <thead>

                            <tr>

                                <th>
                                    PO ID
                                </th>

                                <th>
                                    Requisition
                                </th>

                                <th>
                                    Supplier
                                </th>

                                <th>
                                    Amount
                                </th>

                                <th>
                                    PO Status
                                </th>

                                <th>
                                    Shipment
                                </th>

                                <th>
                                    Date
                                </th>

                                <th>
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {purchaseOrders.length ===
                                0 ? (

                                <tr>

                                    <td
                                        colSpan="8"
                                        className="no-data"
                                    >
                                        No purchase orders
                                        found.
                                    </td>

                                </tr>

                            ) : (

                                purchaseOrders.map(
                                    (po) => {

                                        const quantity =
                                            po.requisition
                                                ?.quantity || 0;

                                        const price =
                                            po.requisition
                                                ?.product
                                                ?.pricePerProduct ||
                                            0;

                                        const amount =
                                            quantity * price;

                                        return (

                                            <tr
                                                key={
                                                    po.poId
                                                }
                                            >

                                                <td>
                                                    <strong>
                                                        PO-
                                                        {
                                                            po.poId
                                                        }
                                                    </strong>
                                                </td>

                                                <td>

                                                    <div className="po-main-text">
                                                        #
                                                        {
                                                            po
                                                                .requisition
                                                                ?.requisitionId
                                                        }
                                                    </div>

                                                    <div className="po-sub-text">
                                                        {
                                                            po
                                                                .requisition
                                                                ?.description
                                                        }
                                                    </div>

                                                </td>

                                                <td>

                                                    {
                                                        po
                                                            .supplier
                                                            ?.name ||
                                                        "N/A"
                                                    }

                                                </td>

                                                <td>

                                                    ₹
                                                    {Number(
                                                        amount
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}

                                                </td>

                                                <td>

                                                    <span
                                                        className={`po-status ${getStatusClass(
                                                            po.status
                                                        )}`}
                                                    >
                                                        {
                                                            formatStatus(
                                                                po.status
                                                            )
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    <span
                                                        className={`shipment-status ${getShipmentClass(
                                                            po.shipmentStatus
                                                        )}`}
                                                    >
                                                        {
                                                            formatStatus(
                                                                po.shipmentStatus
                                                            )
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    {po.poDate
                                                        ? new Date(
                                                            po.poDate
                                                        ).toLocaleDateString()
                                                        : "N/A"}

                                                </td>

                                                <td>

                                                    <div className="po-actions">

                                                        {po.status ===
                                                            "GENERATED" && (

                                                                <button
                                                                    className="action-blue"
                                                                    disabled={
                                                                        actionLoading ===
                                                                        `${po.poId}-send`
                                                                    }
                                                                    onClick={() =>
                                                                        handleSend(
                                                                            po.poId
                                                                        )
                                                                    }
                                                                >
                                                                    {actionLoading ===
                                                                        `${po.poId}-send`
                                                                        ? "Sending..."
                                                                        : "Send"}
                                                                </button>

                                                            )}

                                                        {po.status ===
                                                            "SENT_TO_SUPPLIER" && (

                                                                <button
                                                                    className="action-orange"
                                                                    disabled={
                                                                        actionLoading ===
                                                                        `${po.poId}-IN_PROGRESS`
                                                                    }
                                                                    onClick={() =>
                                                                        handleShipment(
                                                                            po.poId,
                                                                            "IN_PROGRESS"
                                                                        )
                                                                    }
                                                                >
                                                                    Start Shipment
                                                                </button>

                                                            )}

                                                        {po.status ===
                                                            "SHIPMENT_IN_PROGRESS" && (

                                                                <button
                                                                    className="action-green"
                                                                    disabled={
                                                                        actionLoading ===
                                                                        `${po.poId}-DELIVERED`
                                                                    }
                                                                    onClick={() =>
                                                                        handleShipment(
                                                                            po.poId,
                                                                            "DELIVERED"
                                                                        )
                                                                    }
                                                                >
                                                                    Mark Delivered
                                                                </button>

                                                            )}

                                                        {po.status ===
                                                            "DELIVERED" && (

                                                                <button
                                                                    className="action-dark"
                                                                    disabled={
                                                                        actionLoading ===
                                                                        `${po.poId}-close`
                                                                    }
                                                                    onClick={() =>
                                                                        handleClose(
                                                                            po.poId
                                                                        )
                                                                    }
                                                                >
                                                                    {actionLoading ===
                                                                        `${po.poId}-close`
                                                                        ? "Closing..."
                                                                        : "Close PO"}
                                                                </button>

                                                            )}

                                                        {po.status ===
                                                            "CLOSED" && (

                                                                <span className="closed-label">
                                                                    ✓ Closed
                                                                </span>

                                                            )}

                                                    </div>

                                                </td>

                                            </tr>

                                        );
                                    }
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </main>

        </div>
    );
}

export default PurchaseOrders;