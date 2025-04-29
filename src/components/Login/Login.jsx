import "tailwindcss";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    // Auto-Login Check
    useEffect(() => {
        const token = localStorage.getItem("token");
        console.log(token);
        
        fetch(`https://mini-project-ii-ypu6.onrender.com/me`, {
            method: "GET",
            credentials: "include", // Ensures cookies are sent
            headers: {
                "Authorization": `Bearer ${token}`, // Send token in the Authorization header
                "Content-Type": "application/json",
            }
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch user");
                return res.json();
            })
            .then((data) => {
                if (data.user) {
                    navigate(`/${data.user.role.toLowerCase()}`);
                }
            })
            .catch((error) => console.error("Auto-login failed:-", error));

        // console.log(import.meta.env.VITE_BACKEND_URL); // Moved outside to avoid execution issues
    }, [navigate]);

    async function loginReq() {
        try {
            const response = await fetch(`https://mini-project-ii-ypu6.onrender.com/login`, {
                method: "POST",
                credentials: "include", // Ensures cookies are stored
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            console.log("Login Response:", data.role);
            console.log(typeof data.token);
            
            if (data.success && data.role) {
                localStorage.setItem("token",data.token)
                navigate(`/${data.role}`);
            } else {
                alert(data.message || "Invalid credentials, please try again.");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert(error.message || "Something went wrong, please try again.");
        }
    }

    return (
        <>
            <div className="bg-white flex">
                <img
                    src="https://smvdu.ac.in/wp-content/uploads/2023/08/cropped-logo-600-1.png"
                    alt="Login Illustration"
                    className="w-8 h-8 object-cover rounded-r-2xl ml-4 mt-2 md:w-20 md:h-20"
                />
                <div className="flex flex-col justify-center items-start mt-3 ml-4">
                    <div className="text-1xl md:text-4xl text-black font-bold">
                        Shri Mata Vaishno Devi University
                    </div>
                </div>
            </div>

            <div className="bg-white flex items-center justify-center mt-10 px-4">
                <div className="relative w-full max-w-4xl bg-gray-200 rounded-2xl shadow-lg flex flex-col md:flex-row min-h-[400px]">

                    <div className="absolute top-4 left-4 flex items-center space-x-2">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 md:w-14 md:h-14" />
                        <span className="text-gray-500 text-sm sm:text-base md:text-lg font-semibold">
                            Geo-Fencing Attendance Manager
                        </span>
                    </div>

                    <div className="w-full md:w-1/2 flex flex-col justify-center items-start px-6 md:px-12 py-12 text-black">
                        <h2 className="w-full text-2xl md:text-3xl font-bold mb-4 flex flex-col justify-center items-center md:items-start py-5 text-black text-center md:text-left">Welcome Back</h2>
                        <p className="text-gray-500 font-medium mb-6">Please log in to continue</p>

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 mb-4 bg-gray-300 font-semibold rounded-md focus:outline-none"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 mb-4 bg-gray-300 font-semibold rounded-md focus:outline-none"
                        />

                        <button
                            className="w-full bg-green-600 hover:bg-orange-400 text-white py-2 rounded-md font-semibold"
                            onClick={loginReq}
                        >
                            Login
                        </button>
                    </div>

                    <div className="hidden md:block md:w-1/2">
                        <img
                            src="/logo.png"
                            alt="Login Illustration"
                            className="w-full h-full object-cover rounded-b-2xl md:rounded-none md:rounded-r-2xl"
                        />
                    </div>
                </div>
            </div>

        </>
    );
}

export default Login;
