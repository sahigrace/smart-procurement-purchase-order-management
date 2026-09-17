import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");

        if (!username || !password) {
            setError("Please enter username and password.");
            return;
        }

        try {
            const credentials = btoa(`${username}:${password}`);

            const response = await fetch(
                "http://localhost:8080/auth/login",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Basic ${credentials}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Invalid username or password");
            }

            const data = await response.json();

            localStorage.setItem(
                "auth",
                JSON.stringify({
                    username: data.username,
                    authorities: data.authorities,
                    credentials: credentials,
                })
            );

            navigate("/dashboard");

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                <div className="login-header">
                    <h1>Smart Procurement</h1>
                    <p>Procurement Management System</p>
                </div>

                <form onSubmit={handleLogin}>

                    <div className="form-group">
                        <label>Username</label>

                        <input
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                        />
                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <button type="submit">
                        Login
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Login;