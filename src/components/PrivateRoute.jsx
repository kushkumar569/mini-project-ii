import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

function PrivateRoute({ allowedRoles }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch(`https://mini-project-ii-ypu6.onrender.com/me`, {
            method: "GET",
            credentials: "include", // Ensures cookies are sent
            headers: {
                "Authorization": `Bearer ${token}`, // Send token in the Authorization header
                "Content-Type": "application/json",
            }
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.user) {
                    console.log(data.user);
                    setIsAuthenticated(true);
                    setUserRole(data.user.role);
                } else {
                    setIsAuthenticated(false);
                }
            })
            .catch(() => setIsAuthenticated(false))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading...</div>;
    
    console.log(isAuthenticated, "Auth", allowedRoles,userRole);
    
    // Redirect if not authenticated or role mismatch
    if (!isAuthenticated || allowedRoles!=userRole) {
        console.log(allowedRoles);
        return <Navigate to="/unauthorized" />;
    }

    return <Outlet />;
}

export default PrivateRoute;
