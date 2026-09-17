import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./Products.css";

function Products() {

    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        name: "",
        pricePerProduct: "",
        numberOfQuantities: "",
        departmentId: "",
        description: "",
        status: "ACTIVE"
    });

    const authData = localStorage.getItem("auth");
    const auth = authData
        ? JSON.parse(authData)
        : null;

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth?.credentials || ""}`
    };

    // =========================
    // LOAD PRODUCTS
    // =========================

    const loadProducts = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:8080/products",
                {
                    method: "GET",
                    headers
                }
            );

            if (!response.ok) {

                if (response.status === 403) {
                    throw new Error(
                        "Access denied. You do not have permission to view products."
                    );
                }

                throw new Error(
                    "Failed to load products."
                );
            }

            const data = await response.json();

            setProducts(data);

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);

        }
    };

    // =========================
    // LOAD DEPARTMENTS
    // =========================

    const loadDepartments = async () => {

        try {

            const response = await fetch(
                "http://localhost:8080/departments",
                {
                    method: "GET",
                    headers
                }
            );

            if (response.ok) {

                const data =
                    await response.json();

                setDepartments(data);

            }

        } catch (err) {

            console.error(
                "Unable to load departments:",
                err
            );

        }
    };

    useEffect(() => {

        if (!auth) {
            navigate("/login");
            return;
        }

        loadProducts();
        loadDepartments();

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
    // OPEN FORM
    // =========================

    const openCreateForm = () => {

        setForm({
            name: "",
            pricePerProduct: "",
            numberOfQuantities: "",
            departmentId: "",
            description: "",
            status: "ACTIVE"
        });

        setError("");
        setShowForm(true);

    };

    // =========================
    // CLOSE FORM
    // =========================

    const closeForm = () => {

        setShowForm(false);

        setForm({
            name: "",
            pricePerProduct: "",
            numberOfQuantities: "",
            departmentId: "",
            description: "",
            status: "ACTIVE"
        });

    };

    // =========================
    // CREATE PRODUCT
    // =========================

    const createProduct = async () => {

        if (!form.name.trim()) {

            setError(
                "Product name is required."
            );

            return;
        }

        if (form.pricePerProduct === "") {

            setError(
                "Price per product is required."
            );

            return;
        }

        if (form.numberOfQuantities === "") {

            setError(
                "Quantity is required."
            );

            return;
        }

        try {

            setError("");

            const body = {

                name: form.name.trim(),

                pricePerProduct:
                    Number(
                        form.pricePerProduct
                    ),

                numberOfQuantities:
                    Number(
                        form.numberOfQuantities
                    ),

                description:
                    form.description.trim(),

                status:
                    form.status

            };

            if (form.departmentId) {

                body.department = {
                    departmentId:
                        Number(
                            form.departmentId
                        )
                };

            }

            const response = await fetch(
                "http://localhost:8080/products",
                {
                    method: "POST",
                    headers,
                    body: JSON.stringify(body)
                }
            );

            if (!response.ok) {

                const text =
                    await response.text();

                throw new Error(
                    text ||
                    "Failed to create product."
                );

            }

            closeForm();

            await loadProducts();

        } catch (err) {

            setError(err.message);

        }

    };

    // =========================
    // FILTER PRODUCTS
    // =========================

    const filteredProducts =
        products.filter((product) => {

            const searchText =
                search.toLowerCase();

            const matchesSearch =
                (product.name || "")
                    .toLowerCase()
                    .includes(searchText) ||

                (product.description || "")
                    .toLowerCase()
                    .includes(searchText);

            const matchesStatus =
                statusFilter === "ALL" ||
                product.status === statusFilter;

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
                return "product-status-active";

            case "CLOSED":
                return "product-status-closed";

            case "PENDING_FOR_APPROVAL":
                return "product-status-pending";

            default:
                return "product-status-default";

        }

    };

    // =========================
    // FORMAT DATE
    // =========================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        const value =
            new Date(date);

        if (Number.isNaN(value.getTime())) {
            return "-";
        }

        return value.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

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

                <div className="products-header">

                    <div>

                        <h1>
                            Products
                        </h1>

                        <p>
                            Manage procurement products,
                            pricing and available quantities.
                        </p>

                    </div>

                    <button
                        className="add-product-btn"
                        onClick={openCreateForm}
                    >
                        + Add Product
                    </button>

                </div>

                {/* =========================
                    ERROR
                ========================= */}

                {error && (

                    <div className="product-error">
                        {error}
                    </div>

                )}

                {/* =========================
                    TOOLBAR
                ========================= */}

                <div className="product-toolbar">

                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
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

                        <option value="CLOSED">
                            Closed
                        </option>

                        <option value="PENDING_FOR_APPROVAL">
                            Pending for Approval
                        </option>

                    </select>

                    <span className="product-count">
                        {filteredProducts.length} products
                    </span>

                </div>

                {/* =========================
                    PRODUCT TABLE
                ========================= */}

                <div className="products-card">

                    {loading ? (

                        <div className="product-loading">
                            Loading products...
                        </div>

                    ) : filteredProducts.length === 0 ? (

                        <div className="product-empty">
                            No products found.
                        </div>

                    ) : (

                        <div className="product-table-wrapper">

                            <table className="product-table">

                                <thead>

                                    <tr>

                                        <th>
                                            ID
                                        </th>

                                        <th>
                                            Product
                                        </th>

                                        <th>
                                            Price
                                        </th>

                                        <th>
                                            Quantity
                                        </th>

                                        <th>
                                            Department
                                        </th>

                                        <th>
                                            Category
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Created
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredProducts.map(
                                        (product) => (

                                            <tr
                                                key={
                                                    product.productId
                                                }
                                            >

                                                <td>
                                                    #
                                                    {
                                                        product.productId
                                                    }
                                                </td>

                                                <td>

                                                    <strong>
                                                        {
                                                            product.name ||
                                                            "-"
                                                        }
                                                    </strong>

                                                    <small className="product-description">
                                                        {
                                                            product.description ||
                                                            "-"
                                                        }
                                                    </small>

                                                </td>

                                                <td>

                                                    <strong>
                                                        ₹
                                                        {Number(
                                                            product.pricePerProduct ||
                                                            0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </strong>

                                                </td>

                                                <td>

                                                    {
                                                        product.numberOfQuantities ??
                                                        0
                                                    }

                                                </td>

                                                <td>

                                                    {
                                                        product.department
                                                            ?.departmentName ||
                                                        product.department
                                                            ?.name ||
                                                        "-"
                                                    }

                                                </td>

                                                <td>

                                                    {
                                                        product.category
                                                            ?.categoryName ||
                                                        product.category
                                                            ?.name ||
                                                        "-"
                                                    }

                                                </td>

                                                <td>

                                                    <span
                                                        className={`product-status ${getStatusClass(
                                                            product.status
                                                        )}`}
                                                    >
                                                        {
                                                            product.status
                                                                ?.replaceAll(
                                                                    "_",
                                                                    " "
                                                                ) ||
                                                            "UNKNOWN"
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    {
                                                        formatDate(
                                                            product.createdDate
                                                        )
                                                    }

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
                    CREATE PRODUCT MODAL
                ========================= */}

                {showForm && (

                    <div className="product-modal-overlay">

                        <div className="product-modal">

                            <div className="product-modal-header">

                                <div>

                                    <h2>
                                        Add Product
                                    </h2>

                                    <p>
                                        Enter product information
                                        for procurement.
                                    </p>

                                </div>

                                <button
                                    className="product-close-btn"
                                    onClick={closeForm}
                                >
                                    ×
                                </button>

                            </div>

                            <div className="product-form">

                                {/* NAME */}

                                <div className="form-group">

                                    <label>
                                        Product Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            form.name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter product name"
                                    />

                                </div>

                                {/* PRICE + QUANTITY */}

                                <div className="form-row">

                                    <div className="form-group">

                                        <label>
                                            Price Per Product
                                        </label>

                                        <input
                                            type="number"
                                            name="pricePerProduct"
                                            value={
                                                form.pricePerProduct
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter price"
                                            min="0"
                                            step="0.01"
                                        />

                                    </div>

                                    <div className="form-group">

                                        <label>
                                            Quantity
                                        </label>

                                        <input
                                            type="number"
                                            name="numberOfQuantities"
                                            value={
                                                form.numberOfQuantities
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter quantity"
                                            min="0"
                                        />

                                    </div>

                                </div>

                                {/* DEPARTMENT + STATUS */}

                                <div className="form-row">

                                    <div className="form-group">

                                        <label>
                                            Department
                                        </label>

                                        <select
                                            name="departmentId"
                                            value={
                                                form.departmentId
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        >

                                            <option value="">
                                                No Department
                                            </option>

                                            {departments.map(
                                                (
                                                    department
                                                ) => (

                                                    <option
                                                        key={
                                                            department.departmentId
                                                        }
                                                        value={
                                                            department.departmentId
                                                        }
                                                    >
                                                        {
                                                            department.departmentName ||
                                                            department.name
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

                                            <option value="CLOSED">
                                                Closed
                                            </option>

                                            <option value="PENDING_FOR_APPROVAL">
                                                Pending for Approval
                                            </option>

                                        </select>

                                    </div>

                                </div>

                                {/* DESCRIPTION */}

                                <div className="form-group">

                                    <label>
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={
                                            form.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter product description"
                                        rows="4"
                                    />

                                </div>

                                {/* BUTTONS */}

                                <div className="product-modal-actions">

                                    <button
                                        className="product-cancel-btn"
                                        onClick={closeForm}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className="product-save-btn"
                                        onClick={
                                            createProduct
                                        }
                                    >
                                        Create Product
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

export default Products;