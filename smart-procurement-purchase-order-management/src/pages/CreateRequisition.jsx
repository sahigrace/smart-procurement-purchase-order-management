import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./CreateRequisition.css";

function CreateRequisition() {

    const navigate = useNavigate();

    const [description, setDescription] = useState("");
    const [quantity, setQuantity] = useState(1);

    const [departments, setDepartments] = useState([]);
    const [products, setProducts] = useState([]);

    const [departmentId, setDepartmentId] = useState("");
    const [productId, setProductId] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {

        const authData = localStorage.getItem("auth");

        if (!authData) {
            navigate("/login");
            return;
        }

        const auth = JSON.parse(authData);

        const headers = {
            Authorization: `Basic ${auth.credentials}`,
        };

        Promise.all([
            fetch(
                "http://localhost:8080/departments",
                {
                    headers
                }
            ),
            fetch(
                "http://localhost:8080/products",
                {
                    headers
                }
            )
        ])
            .then(async ([departmentResponse, productResponse]) => {

                if (!departmentResponse.ok) {
                    throw new Error(
                        "Unable to load departments."
                    );
                }

                if (!productResponse.ok) {
                    throw new Error(
                        "Unable to load products."
                    );
                }

                const departmentData =
                    await departmentResponse.json();

                const productData =
                    await productResponse.json();

                setDepartments(departmentData);
                setProducts(productData);

            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });

    }, [navigate]);

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        if (!description.trim()) {
            setError("Description is required.");
            return;
        }

        if (!quantity || quantity < 1) {
            setError("Quantity must be at least 1.");
            return;
        }

        if (!departmentId) {
            setError("Please select a department.");
            return;
        }

        if (!productId) {
            setError("Please select a product.");
            return;
        }

        const authData = localStorage.getItem("auth");

        if (!authData) {
            navigate("/login");
            return;
        }

        const auth = JSON.parse(authData);

        try {

            setSaving(true);

            const userResponse = await fetch(
                "http://localhost:8080/auth/me",
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            `Basic ${auth.credentials}`,
                    },
                }
            );

            if (!userResponse.ok) {
                throw new Error(
                    "Unable to identify logged-in user."
                );
            }

            const currentUser =
                await userResponse.json();

            const requestBody = {
                description: description.trim(),
                quantity: Number(quantity),

                user: {
                    userId: currentUser.userId
                },

                department: {
                    departmentId: Number(departmentId)
                },

                product: {
                    productId: Number(productId)
                }
            };

            const response = await fetch(
                "http://localhost:8080/requisitions",
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Basic ${auth.credentials}`,
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify(requestBody),
                }
            );

            if (!response.ok) {

                const errorText =
                    await response.text();

                throw new Error(
                    errorText ||
                    "Failed to create requisition."
                );
            }

            const createdRequisition =
                await response.json();

            navigate(
                `/requisitions/${createdRequisition.requisitionId}`
            );

        } catch (err) {

            setError(err.message);

        } finally {

            setSaving(false);
        }
    };

    if (loading) {

        return (
            <div className="dashboard-loading">
                Loading form...
            </div>
        );
    }

    return (
        <div className="app-layout">

            <Sidebar />

            <main className="main-content">

                <div className="page-header">

                    <div>
                        <h1>Create Requisition</h1>

                        <p>
                            Create a new procurement requisition.
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

                <div className="requisition-form-card">

                    <form onSubmit={handleSubmit}>

                        <div className="form-group">

                            <label>
                                Description
                            </label>

                            <textarea
                                placeholder="Enter requisition description"
                                value={description}
                                onChange={(e) =>
                                    setDescription(
                                        e.target.value
                                    )
                                }
                                rows="4"
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Quantity
                            </label>

                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) =>
                                    setQuantity(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Department
                            </label>

                            <select
                                value={departmentId}
                                onChange={(e) =>
                                    setDepartmentId(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="">
                                    Select Department
                                </option>

                                {departments.map(
                                    (department) => (

                                        <option
                                            key={
                                                department.departmentId
                                            }
                                            value={
                                                department.departmentId
                                            }
                                        >
                                            {
                                                department.departmentName
                                            }
                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                        <div className="form-group">

                            <label>
                                Product
                            </label>

                            <select
                                value={productId}
                                onChange={(e) =>
                                    setProductId(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="">
                                    Select Product
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
                                            {product.name}
                                            {" - ₹"}
                                            {
                                                Number(
                                                    product.pricePerProduct
                                                ).toLocaleString(
                                                    "en-IN"
                                                )
                                            }
                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <div className="form-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() =>
                                    navigate(
                                        "/requisitions"
                                    )
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Creating..."
                                    : "Create Requisition"}
                            </button>

                        </div>

                    </form>

                </div>

            </main>

        </div>
    );
}

export default CreateRequisition;