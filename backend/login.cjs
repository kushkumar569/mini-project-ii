require("dotenv").config();
const express = require("express");
const {Router} = require("express");
const Login = Router();
const { Teacher, Student, Admin } = require("../DataBase/Account.cjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser()); // Required for reading cookies

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const PORT = process.env.PORT || 3000;

// **🔹 Login Route**
Login.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log("hyyy");
    
    // **1️⃣ Check User in Different Models**
    const models = { Teacher, Student, Admin };
    let userType = null;
    let user = null;

    for (const [role, Model] of Object.entries(models)) {
        user = await Model.findOne({ email });
        if (user) {
            userType = role;
            break; // Stop if found
        }
    }

    // console.log(user);
    
    // **2️⃣ If User Not Found**
    if (!user) {
        return res.status(401).json({ message: "Wrong email or password" });
    }

    // **3️⃣ Validate Password (Using bcrypt)**
    const isPasswordValid = (password ===user.password) ? true : false;
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Wrong email or password...." });
    }

    // **4️⃣ Generate JWT Token**
    const token = jwt.sign({ email, role: userType }, JWT_SECRET, { expiresIn: "7d" });

    console.log(token);
    
    // **5️⃣ Store Token in HTTP-only Cookie**
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Secure in production
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiration
    });

    // **6️⃣ Send Response with User Type**
    res.json({ success: true, role: userType,token: token});
});

const authenticateUser = (req, res, next) => {
    // console.log("Headers:", req.headers); // ✅ Log headers for debugging

    // ✅ Extract token from Authorization header
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized, please login" });
    }

    const token = authHeader.split(" ")[1]; // Extract token after "Bearer"

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token!" });
        }

        req.user = decoded; // Attach user details to request
        next();
    });
};

// **🔹 Auto-Login Route**
Login.get("/me", authenticateUser, (req, res) => {
    // console.log("Authenticated request received.");

    res.json({
        message: `Welcome back, ${req.user.role}!`,
        user: req.user,
    });
});

// **🔹 Logout Route**
Login.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully!" });
});

module.exports = {
    Login: Login
}
