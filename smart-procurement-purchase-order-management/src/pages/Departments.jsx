import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./Departments.css";

function Departments() {

    const navigate = useNavigate();

    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);

    const [departmentName, setDepartmentName] = useState("");
    const [managerId, setManagerId] = useState("");

    const [users, setUsers] = useState([]);

    const authData = localStorage.getItem("auth");
    const auth = authData ? JSON.parse(authData) : null;

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth?.credentials || ""}`
    };

    // =========================
    // LOAD DEPARTMENTS
    // =========================

    const loadDepartments = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:8080/departments",
                {
                    headers
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to load departments."
                );
            }

            const data = await response.json();

            setDepartments(data);

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);

        }
    };

    // =========================
    // LOAD USERS
    // =========================

    const loadUsers = async () => {

        try {

            const response = await fetch(
                "http://localhost:8080/admin/users",
                {
                    headers
                }
            );

            if (response.ok) {

                const data = await response.json();

                setUsers(data);

            }

        } catch (err) {

            console.error(
                "Unable to load users:",
                err
            );

        }
    };

    useEffect(() => {

        if (!auth) {
            navigate("/login");
            return;
        }

        loadDepartments();
        loadUsers();

    }, [navigate]);

    // =========================
    // OPEN CREATE
    // =========================

    const openCreateForm = () => {

        setEditingDepartment(null);

        setDepartmentName("");
        setManagerId("");

        setShowForm(true);
        setError("");

    };

    // =========================
    // OPEN EDIT
    // =========================

    const openEditForm = (department) => {

        setEditingDepartment(department);

        setDepartmentName(
            department.departmentName ||
            department.name ||
            ""
        );

        setManagerId(
            department.manager?.userId
                ? String(department.manager.userId)
                : ""
        );

        setShowForm(true);
        setError("");

    };

    // =========================
    // CLOSE FORM
    // =========================

    const closeForm = () => {

        setShowForm(false);
        setEditingDepartment(null);

        setDepartmentName("");
        setManagerId("");

    };

    // =========================
    // SAVE
    // =========================

    const saveDepartment = async () => {

        if (!departmentName.trim()) {

            setError(
                "Department name is required."
            );

            return;
        }

        try {

            setError("");

            const body = {
                departmentName:
                    departmentName.trim()
            };

            if (managerId) {

                body.manager = {
                    userId: Number(managerId)
                };

            }

            const url = editingDepartment
                ? `http://localhost:8080/departments/${editingDepartment.departmentId}`
                : "http://localhost:8080/departments";

            const method = editingDepartment
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
                    "Failed to save department."
                );

            }

            closeForm();

            await loadDepartments();

        } catch (err) {

            setError(err.message);

        }

    };

    // =========================
    // DELETE
    // =========================

    const deleteDepartment = async (
        department
    ) => {

        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${department.departmentName}"?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setError("");

            const response = await fetch(
                `http://localhost:8080/departments/${department.departmentId}`,
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
                    "Failed to delete department."
                );

            }

            await loadDepartments();

        } catch (err) {

            setError(err.message);

        }

    };

    // =========================
    // RENDER
    // =========================

    return (
        <div className="app-layout">

            <Sidebar />

            <main className="main-content">

                <div className="departments-header">

                    <div>

                        <h1>
                            Departments
                        </h1>

                        <p>
                            Manage departments and
                            their assigned managers.
                        </p>

                    </div>

                    <button
                        className="add-department-btn"
                        onClick={openCreateForm}
                    >
                        + Add Department
                    </button>

                </div>

                {error && (

                    <div className="department-error">
                        {error}
                    </div>

                )}

                <div className="departments-card">

                    {loading ? (

                        <div className="department-loading">
                            Loading departments...
                        </div>

                    ) : departments.length === 0 ? (

                        <div className="department-empty">
                            No departments found.
                        </div>

                    ) : (

                        <div className="department-table-wrapper">

                            <table className="department-table">

                                <thead>

                                    <tr>

                                        <th>
                                            ID
                                        </th>

                                        <th>
                                            Department
                                        </th>

                                        <th>
                                            Manager
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {departments.map(
                                        (department) => (

                                            <tr
                                                key={
                                                    department.departmentId
                                                }
                                            >

                                                <td>
                                                    #
                                                    {
                                                        department.departmentId
                                                    }
                                                </td>

                                                <td>

                                                    <strong>
                                                        {
                                                            department.departmentName ||
                                                            department.name
                                                        }
                                                    </strong>

                                                </td>

                                                <td>

                                                    {
                                                        department.manager
                                                            ?.userName ||
                                                        department.manager
                                                            ?.username ||
                                                        "Not Assigned"
                                                    }

                                                </td>

                                                <td>

                                                    <div className="department-actions">

                                                        <button
                                                            className="edit-department-btn"
                                                            onClick={() =>
                                                                openEditForm(
                                                                    department
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            className="delete-department-btn"
                                                            onClick={() =>
                                                                deleteDepartment(
                                                                    department
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

                    <div className="department-modal-overlay">

                        <div className="department-modal">

                            <div className="department-modal-header">

                                <div>

                                    <h2>
                                        {editingDepartment
                                            ? "Edit Department"
                                            : "Add Department"}
                                    </h2>

                                    <p>
                                        Configure department
                                        information.
                                    </p>

                                </div>

                                <button
                                    className="department-close-btn"
                                    onClick={closeForm}
                                >
                                    ×
                                </button>

                            </div>

                            <div className="department-form">

                                <label>
                                    Department Name
                                </label>

                                <input
                                    type="text"
                                    value={departmentName}
                                    onChange={(e) =>
                                        setDepartmentName(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter department name"
                                />

                                <label>
                                    Department Manager
                                </label>

                                <select
                                    value={managerId}
                                    onChange={(e) =>
                                        setManagerId(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        No Manager
                                    </option>

                                    {users
                                        .filter(
                                            (user) =>
                                                user.role ===
                                                "MANAGER"
                                        )
                                        .map((user) => (

                                            <option
                                                key={
                                                    user.userId
                                                }
                                                value={
                                                    user.userId
                                                }
                                            >
                                                {
                                                    user.userName
                                                }
                                            </option>

                                        ))}

                                </select>

                                <div className="department-modal-actions">

                                    <button
                                        className="department-cancel-btn"
                                        onClick={closeForm}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className="department-save-btn"
                                        onClick={
                                            saveDepartment
                                        }
                                    >
                                        {editingDepartment
                                            ? "Update Department"
                                            : "Create Department"}
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

export default Departments;