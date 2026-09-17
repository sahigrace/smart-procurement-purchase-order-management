import { useEffect, useState } from "react";
import "./Users.css";

const API = "http://localhost:8080";

const ROLES = [
    "EMPLOYEE",
    "MANAGER",
    "FINANCE",
    "PROCUREMENT_HEAD",
    "ADMIN"
];

function Users() {
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");

    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [form, setForm] = useState({
        userName: "",
        email: "",
        password: "",
        role: "EMPLOYEE",
        departmentId: ""
    });

    const auth = JSON.parse(localStorage.getItem("auth") || "{}");

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth.credentials || ""}`
    };

    // =========================
    // LOAD USERS
    // =========================

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API}/admin/users`, {
                headers
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error(
                        "Access denied. Only ADMIN users can manage users."
                    );
                }

                throw new Error("Failed to load users.");
            }

            const data = await response.json();
            setUsers(data);
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
            const response = await fetch(`${API}/departments`, {
                headers
            });

            if (response.ok) {
                const data = await response.json();
                setDepartments(data);
            }
        } catch (err) {
            console.error("Department loading error:", err);
        }
    };

    useEffect(() => {
        loadUsers();
        loadDepartments();
    }, []);

    // =========================
    // FORM HANDLING
    // =========================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const openCreateForm = () => {
        setEditingUser(null);

        setForm({
            userName: "",
            email: "",
            password: "",
            role: "EMPLOYEE",
            departmentId: ""
        });

        setShowForm(true);
        setError("");
    };

    const openEditForm = (user) => {
        setEditingUser(user);

        setForm({
            userName: user.userName || "",
            email: user.email || "",
            password: "",
            role: user.role || "EMPLOYEE",
            departmentId:
                user.department?.departmentId
                    ? String(user.department.departmentId)
                    : ""
        });

        setShowForm(true);
        setError("");
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingUser(null);
    };

    // =========================
    // CREATE USER
    // =========================

    const createUser = async () => {
        if (!form.userName.trim()) {
            setError("Username is required.");
            return;
        }

        if (!form.email.trim()) {
            setError("Email is required.");
            return;
        }

        if (!form.password.trim()) {
            setError("Password is required.");
            return;
        }

        try {
            setError("");

            const body = {
                userName: form.userName.trim(),
                email: form.email.trim(),
                password: form.password,
                role: form.role
            };

            if (form.departmentId) {
                body.department = {
                    departmentId: Number(form.departmentId)
                };
            }

            const response = await fetch(`${API}/admin/users`, {
                method: "POST",
                headers,
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || "Failed to create user.");
            }

            closeForm();
            await loadUsers();

        } catch (err) {
            setError(err.message);
        }
    };

    // =========================
    // UPDATE USER
    // =========================

    const updateUser = async () => {
        if (!form.userName.trim()) {
            setError("Username is required.");
            return;
        }

        if (!form.email.trim()) {
            setError("Email is required.");
            return;
        }

        try {
            setError("");

            const body = {
                userName: form.userName.trim(),
                email: form.email.trim(),
                role: form.role
            };

            if (form.departmentId) {
                body.department = {
                    departmentId: Number(form.departmentId)
                };
            }

            if (form.password.trim()) {
                body.password = form.password;
            }

            const response = await fetch(
                `${API}/admin/users/${editingUser.userId}`,
                {
                    method: "PUT",
                    headers,
                    body: JSON.stringify(body)
                }
            );

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || "Failed to update user.");
            }

            closeForm();
            await loadUsers();

        } catch (err) {
            setError(err.message);
        }
    };

    // =========================
    // DELETE USER
    // =========================

    const deleteUser = async (user) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete user "${user.userName}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            const response = await fetch(
                `${API}/admin/users/${user.userId}`,
                {
                    method: "DELETE",
                    headers
                }
            );

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || "Failed to delete user.");
            }

            await loadUsers();

        } catch (err) {
            setError(err.message);
        }
    };

    // =========================
    // FILTER USERS
    // =========================

    const filteredUsers = users.filter((user) => {
        const searchText = search.toLowerCase();

        const matchesSearch =
            (user.userName || "")
                .toLowerCase()
                .includes(searchText) ||
            (user.email || "")
                .toLowerCase()
                .includes(searchText);

        const matchesRole =
            roleFilter === "ALL" ||
            user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    // =========================
    // ROLE BADGE
    // =========================

    const getRoleClass = (role) => {
        switch (role) {
            case "ADMIN":
                return "role-admin";

            case "MANAGER":
                return "role-manager";

            case "FINANCE":
                return "role-finance";

            case "PROCUREMENT_HEAD":
                return "role-procurement";

            default:
                return "role-employee";
        }
    };

    // =========================
    // RENDER
    // =========================

    return (
        <div className="users-page">

            <div className="users-header">

                <div>
                    <h1>User Management</h1>

                    <p>
                        Manage users, roles and departments
                        in the Smart Procurement System.
                    </p>
                </div>

                <button
                    className="add-user-btn"
                    onClick={openCreateForm}
                >
                    + Add User
                </button>

            </div>

            {error && (
                <div className="users-error">
                    {error}
                </div>
            )}

            {/* SEARCH / FILTER */}

            <div className="users-toolbar">

                <input
                    type="text"
                    placeholder="Search username or email..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

                <select
                    value={roleFilter}
                    onChange={(e) =>
                        setRoleFilter(e.target.value)
                    }
                >
                    <option value="ALL">
                        All Roles
                    </option>

                    {ROLES.map((role) => (
                        <option
                            key={role}
                            value={role}
                        >
                            {role.replace("_", " ")}
                        </option>
                    ))}
                </select>

                <div className="user-count">
                    {filteredUsers.length} users
                </div>

            </div>

            {/* TABLE */}

            <div className="users-card">

                {loading ? (
                    <div className="users-loading">
                        Loading users...
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="users-empty">
                        No users found.
                    </div>
                ) : (

                    <div className="table-wrapper">

                        <table className="users-table">

                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Department</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredUsers.map((user) => (

                                    <tr key={user.userId}>

                                        <td>
                                            #{user.userId}
                                        </td>

                                        <td>
                                            <div className="user-name">
                                                {user.userName}
                                            </div>
                                        </td>

                                        <td>
                                            {user.email || "-"}
                                        </td>

                                        <td>

                                            <span
                                                className={`role-badge ${getRoleClass(
                                                    user.role
                                                )}`}
                                            >
                                                {user.role
                                                    ? user.role.replace(
                                                          "_",
                                                          " "
                                                      )
                                                    : "NO ROLE"}
                                            </span>

                                        </td>

                                        <td>
                                            {user.department?.departmentName ||
                                                user.department?.name ||
                                                "-"}
                                        </td>

                                        <td>

                                            <div className="action-buttons">

                                                <button
                                                    className="edit-btn"
                                                    onClick={() =>
                                                        openEditForm(user)
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="delete-btn"
                                                    onClick={() =>
                                                        deleteUser(user)
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

            {/* USER FORM MODAL */}

            {showForm && (

                <div className="modal-overlay">

                    <div className="user-modal">

                        <div className="modal-header">

                            <div>
                                <h2>
                                    {editingUser
                                        ? "Edit User"
                                        : "Create User"}
                                </h2>

                                <p>
                                    {editingUser
                                        ? "Update user account details."
                                        : "Create a new system user."}
                                </p>
                            </div>

                            <button
                                className="close-btn"
                                onClick={closeForm}
                            >
                                ×
                            </button>

                        </div>

                        <div className="user-form">

                            <label>
                                Username
                            </label>

                            <input
                                type="text"
                                name="userName"
                                value={form.userName}
                                onChange={handleChange}
                                placeholder="Enter username"
                            />

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Enter email"
                            />

                            <label>
                                {editingUser
                                    ? "New Password (optional)"
                                    : "Password"}
                            </label>

                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder={
                                    editingUser
                                        ? "Leave blank to keep current password"
                                        : "Enter password"
                                }
                            />

                            <label>
                                Role
                            </label>

                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                            >
                                {ROLES.map((role) => (
                                    <option
                                        key={role}
                                        value={role}
                                    >
                                        {role.replace("_", " ")}
                                    </option>
                                ))}
                            </select>

                            <label>
                                Department
                            </label>

                            <select
                                name="departmentId"
                                value={form.departmentId}
                                onChange={handleChange}
                            >
                                <option value="">
                                    No Department
                                </option>

                                {departments.map((department) => (

                                    <option
                                        key={department.departmentId}
                                        value={department.departmentId}
                                    >
                                        {department.departmentName ||
                                            department.name}
                                    </option>

                                ))}

                            </select>

                            <div className="modal-actions">

                                <button
                                    className="cancel-btn"
                                    onClick={closeForm}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="save-btn"
                                    onClick={
                                        editingUser
                                            ? updateUser
                                            : createUser
                                    }
                                >
                                    {editingUser
                                        ? "Update User"
                                        : "Create User"}
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Users;