import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./Suppliers.css";

function Suppliers() {

    const navigate = useNavigate();

    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showForm, setShowForm] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);

    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        gstNumber: "",
        productId: "",
        status: "ACTIVE",
        rating: "",
        feedback: ""
    });

    const authData = localStorage.getItem("auth");
    const auth = authData ? JSON.parse(authData) : null;

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth?.credentials || ""}`
    };

    // =========================
    // LOAD SUPPLIERS
    // =========================

    const loadSuppliers = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:8080/suppliers",
                {
                    method: "GET",
                    headers
                }
            );

            if (!response.ok) {

                if (response.status === 403) {
                    throw new Error(
                        "Access denied. You do not have permission to view suppliers."
                    );
                }

                throw new Error(
                    "Failed to load suppliers."
                );
            }

            const data = await response.json();

            setSuppliers(data);

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);

        }
    };

    // =========================
    // LOAD PRODUCTS
    // =========================

    const loadProducts = async () => {

        try {

            const response = await fetch(
                "http://localhost:8080/products",
                {
                    method: "GET",
                    headers
                }
            );

            if (response.ok) {

                const data = await response.json();

                setProducts(data);

            }

        } catch (err) {

            console.error(
                "Unable to load products:",
                err
            );

        }
    };

    // =========================
    // INITIAL LOAD
    // =========================

    useEffect(() => {

        if (!auth) {
            navigate("/login");
            return;
        }

        loadSuppliers();
        loadProducts();

    }, [navigate]);

    // =========================
    // FORM CHANGE
    // =========================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));

    };

    // =========================
    // CREATE FORM
    // =========================

    const openCreateForm = () => {

        setEditingSupplier(null);

        setForm({
            name: "",
            phone: "",
            email: "",
            address: "",
            gstNumber: "",
            productId: "",
            status: "ACTIVE",
            rating: "",
            feedback: ""
        });

        setError("");
        setShowForm(true);

    };

    // =========================
    // EDIT FORM
    // =========================

    const openEditForm = (supplier) => {

        setEditingSupplier(supplier);

        setForm({
            name: supplier.name || "",
            phone: supplier.phone || "",
            email: supplier.email || "",
            address: supplier.address || "",
            gstNumber: supplier.gstNumber || "",
            productId: supplier.product?.productId
                ? String(supplier.product.productId)
                : "",
            status: supplier.status || "ACTIVE",
            rating:
                supplier.rating !== null &&
                supplier.rating !== undefined
                    ? String(supplier.rating)
                    : "",
            feedback: supplier.feedback || ""
        });

        setError("");
        setShowForm(true);

    };

    // =========================
    // CLOSE FORM
    // =========================

    const closeForm = () => {

        setShowForm(false);
        setEditingSupplier(null);

    };

    // =========================
    // SAVE SUPPLIER
    // =========================

    const saveSupplier = async () => {

        if (!form.name.trim()) {

            setError(
                "Supplier name is required."
            );

            return;
        }

        if (!form.email.trim()) {

            setError(
                "Supplier email is required."
            );

            return;
        }

        try {

            setError("");

            const body = {
                name: form.name.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                address: form.address.trim(),
                gstNumber: form.gstNumber.trim(),
                status: form.status,
                feedback: form.feedback.trim()
            };

            // Rating

            if (form.rating !== "") {

                body.rating =
                    Number(form.rating);

            }

            // Product

            if (form.productId) {

                body.product = {
                    productId:
                        Number(form.productId)
                };

            }

            const url = editingSupplier
                ? `http://localhost:8080/suppliers/${editingSupplier.supplierId}`
                : "http://localhost:8080/suppliers";

            const method = editingSupplier
                ? "PUT"
                : "POST";

            const response = await fetch(url, {

                method,
                headers,
                body: JSON.stringify(body)

            });

            if (!response.ok) {

                const text =
                    await response.text();

                throw new Error(
                    text ||
                    "Failed to save supplier."
                );

            }

            closeForm();

            await loadSuppliers();

        } catch (err) {

            setError(err.message);

        }

    };

    // =========================
    // DELETE SUPPLIER
    // =========================

    const deleteSupplier = async (
        supplier
    ) => {

        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${supplier.name}"?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setError("");

            const response = await fetch(
                `http://localhost:8080/suppliers/${supplier.supplierId}`,
                {
                    method: "DELETE",
                    headers
                }
            );

            if (!response.ok) {

                const text =
                    await response.text();

                throw new Error(
                    text ||
                    "Failed to delete supplier."
                );

            }

            await loadSuppliers();

        } catch (err) {

            setError(err.message);

        }

    };

    // =========================
    // FILTER
    // =========================

    const filteredSuppliers =
        suppliers.filter((supplier) => {

            const searchText =
                search.toLowerCase();

            const matchesSearch =
                (supplier.name || "")
                    .toLowerCase()
                    .includes(searchText) ||

                (supplier.email || "")
                    .toLowerCase()
                    .includes(searchText) ||

                (supplier.phone || "")
                    .toLowerCase()
                    .includes(searchText) ||

                (supplier.gstNumber || "")
                    .toLowerCase()
                    .includes(searchText);

            const matchesStatus =
                statusFilter === "ALL" ||
                supplier.status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );

        });

    // =========================
    // STATUS CLASS
    // =========================

    const getStatusClass = (status) => {

        switch (status) {

            case "ACTIVE":
                return "supplier-status-active";

            case "INACTIVE":
                return "supplier-status-inactive";

            case "BLOCKED":
                return "supplier-status-blocked";

            default:
                return "supplier-status-default";
        }
    };

    // =========================
    // RENDER
    // =========================

    return (
        <div className="app-layout">

            <Sidebar />

            <main className="main-content">

                {/* =========================
                    HEADER
                ========================= */}

                <div className="suppliers-header">

                    <div>

                        <h1>
                            Suppliers
                        </h1>

                        <p>
                            Manage supplier information,
                            ratings and procurement relationships.
                        </p>

                    </div>

                    <button
                        className="add-supplier-btn"
                        onClick={openCreateForm}
                    >
                        + Add Supplier
                    </button>

                </div>

                {/* =========================
                    ERROR
                ========================= */}

                {error && (

                    <div className="supplier-error">
                        {error}
                    </div>

                )}

                {/* =========================
                    TOOLBAR
                ========================= */}

                <div className="supplier-toolbar">

                    <input
                        type="text"
                        placeholder="Search supplier, email, phone or GST..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                    >

                        <option value="ALL">
                            All Status
                        </option>

                        <option value="ACTIVE">
                            Active
                        </option>

                        <option value="INACTIVE">
                            Inactive
                        </option>

                        <option value="BLOCKED">
                            Blocked
                        </option>

                    </select>

                    <span className="supplier-count">
                        {filteredSuppliers.length} suppliers
                    </span>

                </div>

                {/* =========================
                    TABLE
                ========================= */}

                <div className="suppliers-card">

                    {loading ? (

                        <div className="supplier-loading">
                            Loading suppliers...
                        </div>

                    ) : filteredSuppliers.length === 0 ? (

                        <div className="supplier-empty">
                            No suppliers found.
                        </div>

                    ) : (

                        <div className="supplier-table-wrapper">

                            <table className="supplier-table">

                                <thead>

                                    <tr>

                                        <th>
                                            ID
                                        </th>

                                        <th>
                                            Supplier
                                        </th>

                                        <th>
                                            Contact
                                        </th>

                                        <th>
                                            GST Number
                                        </th>

                                        <th>
                                            Product
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Rating
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredSuppliers.map(
                                        (supplier) => (

                                            <tr
                                                key={
                                                    supplier.supplierId
                                                }
                                            >

                                                <td>
                                                    #
                                                    {
                                                        supplier.supplierId
                                                    }
                                                </td>

                                                <td>

                                                    <strong>
                                                        {
                                                            supplier.name
                                                        }
                                                    </strong>

                                                    <small className="supplier-address">
                                                        {
                                                            supplier.address ||
                                                            "-"
                                                        }
                                                    </small>

                                                </td>

                                                <td>

                                                    <div>
                                                        {
                                                            supplier.email ||
                                                            "-"
                                                        }
                                                    </div>

                                                    <small className="supplier-phone">
                                                        {
                                                            supplier.phone ||
                                                            "-"
                                                        }
                                                    </small>

                                                </td>

                                                <td>
                                                    {
                                                        supplier.gstNumber ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        supplier.product
                                                            ?.name ||
                                                        supplier.product
                                                            ?.productName ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>

                                                    <span
                                                        className={`supplier-status ${getStatusClass(
                                                            supplier.status
                                                        )}`}
                                                    >
                                                        {
                                                            supplier.status ||
                                                            "UNKNOWN"
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    <span className="supplier-rating">

                                                        ★

                                                        {
                                                            supplier.rating !==
                                                            null &&
                                                            supplier.rating !==
                                                            undefined
                                                                ? Number(
                                                                      supplier.rating
                                                                  ).toFixed(1)
                                                                : "N/A"
                                                        }

                                                    </span>

                                                </td>

                                                <td>

                                                    <div className="supplier-actions">

                                                        <button
                                                            className="edit-supplier-btn"
                                                            onClick={() =>
                                                                openEditForm(
                                                                    supplier
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            className="delete-supplier-btn"
                                                            onClick={() =>
                                                                deleteSupplier(
                                                                    supplier
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

                {/* =========================
                    MODAL
                ========================= */}

                {showForm && (

                    <div className="supplier-modal-overlay">

                        <div className="supplier-modal">

                            <div className="supplier-modal-header">

                                <div>

                                    <h2>
                                        {editingSupplier
                                            ? "Edit Supplier"
                                            : "Add Supplier"}
                                    </h2>

                                    <p>
                                        Enter supplier information
                                        and procurement details.
                                    </p>

                                </div>

                                <button
                                    className="supplier-close-btn"
                                    onClick={closeForm}
                                >
                                    ×
                                </button>

                            </div>

                            <div className="supplier-form">

                                <div className="form-row">

                                    <div className="form-group">

                                        <label>
                                            Supplier Name
                                        </label>

                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter supplier name"
                                        />

                                    </div>

                                    <div className="form-group">

                                        <label>
                                            Phone
                                        </label>

                                        <input
                                            type="text"
                                            name="phone"
                                            value={form.phone}
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter phone number"
                                        />

                                    </div>

                                </div>

                                <div className="form-row">

                                    <div className="form-group">

                                        <label>
                                            Email
                                        </label>

                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter email"
                                        />

                                    </div>

                                    <div className="form-group">

                                        <label>
                                            GST Number
                                        </label>

                                        <input
                                            type="text"
                                            name="gstNumber"
                                            value={
                                                form.gstNumber
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter GST number"
                                        />

                                    </div>

                                </div>

                                <div className="form-group">

                                    <label>
                                        Address
                                    </label>

                                    <textarea
                                        name="address"
                                        value={
                                            form.address
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter supplier address"
                                        rows="3"
                                    />

                                </div>

                                <div className="form-row">

                                    <div className="form-group">

                                        <label>
                                            Product
                                        </label>

                                        <select
                                            name="productId"
                                            value={
                                                form.productId
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        >

                                            <option value="">
                                                No Product
                                            </option>

                                            {products.map(
                                                (product) => (

                                                    <option
                                                        key={
                                                            product.productId
                                                        }
                                                        value={
                                                            product.productId
                                                        }
                                                    >
                                                        {
                                                            product.name ||
                                                            product.productName
                                                        }
                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>

                                    <div className="form-group">

                                        <label>
                                            Status
                                        </label>

                                        <select
                                            name="status"
                                            value={
                                                form.status
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        >

                                            <option value="ACTIVE">
                                                Active
                                            </option>

                                            <option value="INACTIVE">
                                                Inactive
                                            </option>

                                            <option value="BLOCKED">
                                                Blocked
                                            </option>

                                        </select>

                                    </div>

                                </div>

                                <div className="form-row">

                                    <div className="form-group">

                                        <label>
                                            Rating
                                        </label>

                                        <input
                                            type="number"
                                            name="rating"
                                            value={
                                                form.rating
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="0 - 5"
                                            min="0"
                                            max="5"
                                            step="0.1"
                                        />

                                    </div>

                                    <div className="form-group">

                                        <label>
                                            Feedback
                                        </label>

                                        <input
                                            type="text"
                                            name="feedback"
                                            value={
                                                form.feedback
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Supplier feedback"
                                        />

                                    </div>

                                </div>

                                <div className="supplier-modal-actions">

                                    <button
                                        className="supplier-cancel-btn"
                                        onClick={closeForm}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className="supplier-save-btn"
                                        onClick={
                                            saveSupplier
                                        }
                                    >
                                        {editingSupplier
                                            ? "Update Supplier"
                                            : "Create Supplier"}
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                )}

            </main>

        </div>
    );
}

export default Suppliers;