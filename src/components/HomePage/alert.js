function showToast(message) {
    const toast = document.createElement("div");
    toast.innerText = message;
    
    Object.assign(toast.style, {
        position: "fixed",
        top: "10%", // 🔹 Position it at the top
        left: "50%",
        transform: "translateX(-50%)",
        background: "#333",
        color: "white",
        padding: "12px 20px",
        borderRadius: "5px",
        opacity: "0.95",
        transition: "opacity 0.5s ease-in-out, top 0.5s ease-in-out",
        zIndex: "1000",
        fontSize: "16px",
        fontWeight: "bold",
        textAlign: "center",
    });

    document.body.appendChild(toast);

    // Remove the toast after 2 seconds
    setTimeout(() => {
        toast.style.opacity = "0"; // Fade out
        toast.style.top = "5%"; // Move slightly up before disappearing
        setTimeout(() => toast.remove(), 500); // Remove from DOM
    }, 2000);
}


export default showToast;
