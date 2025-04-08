import { useState, useEffect } from "react";
import showToast from "./alert.js";

// https://mini-project-ii-ypu6.onrender.com

function Main({ cc, cn, sec, date, dep, sem, day, time, isRunning, setIsRunning, numbers, setNumbers }) {
    const venueOptions = ["TC-126-S", "D-107", "COE-206"];
    const [selectedVenue, setSelectedVenue] = useState(venueOptions[0]);
    const [venueChosen, setVenueChosen] = useState(false);

    const [message, setMessage] = useState("process");
    const [isMark, setIsMark] = useState(false);
    const [entryNumber, setEntryNumber] = useState("");
    const [msg, setMsg] = useState("");

    const [lat, setLat] = useState("");
    const [lon, setLon] = useState("");
    const [live, setLive] = useState(false);

    useEffect(() => {
        const handlePopState = () => {
            window.history.pushState(null, "", window.location.href);
        };

        // Push the initial state
        window.history.pushState(null, "", window.location.href);
        // Add the listener
        window.addEventListener("popstate", handlePopState);

        // Cleanup on unmount
        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    async function setTime(latitude, longitude, liveStatus) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const times = `${hours}:${minutes}:${seconds}`;

        try {
            const response = await fetch(`https://mini-project-ii-ypu6.onrender.com/setData/setTime`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    _id: "67e71052258dbe80e2a60119",
                    TeacherLatitude: Number(latitude),
                    TeacherLongitude: Number(longitude),
                    isLive: Boolean(liveStatus),
                    time: times
                })
            });

            console.log(response);

            if (response.ok) {
                const data = await response.json();
                console.log("Updated Time:", data);
            } else {
                const errorText = await response.text();
                console.error("Error Response:", errorText);
                throw new Error(`Failed to update Time: ${errorText}`);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async function startTimer() {
        if (!venueChosen) {
            showToast("Please choose a venue first.");
            return;
        }
    
        try {
            setIsMark(true);
            setLive(true);
            const newMessage = "Attendance Marked Successfully";
            setMessage(newMessage);
            showToast(newMessage);
    
            if (!isRunning) {
                await setTime(lat, lon, true);
                setIsRunning(true);
            }
        } catch (error) {
            showToast(error.message || "An error occurred while marking attendance.");
            window.location.reload();
        }
    }
    

    async function chooseVanue() {
        if(isRunning){
            showToast("Attendence is running. You can't change venue");
            return;
        }
        try {
            const response = await fetch(`https://mini-project-ii-ypu6.onrender.com/get/getVanue`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    vanue: selectedVenue
                })
            });
            console.log(response);
            if (response.ok) {
                const data = await response.json();
                setLat(data.latitude);
                setLon(data.longitude);
                showToast(`Venue selected: ${selectedVenue}`);
                setVenueChosen(true);
                console.log("Selected Venue:", data);
            } else {
                showToast("Failed to select venue.");
                setVenueChosen(false);
                const errorText = await response.text();
                console.error("Error Response:", errorText);
                throw new Error(`Failed to update Time: ${errorText}`);
            }
        } catch (error) {
            showToast("Failed to select venue.");
            setVenueChosen(false);
            console.error("Error:", error);
        }
    }
    

    const handleAddNumber = () => {
        const num = Number(entryNumber.trim());

        if (!entryNumber.trim()) {
            setMsg("Input cannot be empty.");
        } else if (isNaN(num)) {
            setMsg("Please enter a valid number.");
        } else if (num < 1 || num > 50) {
            setMsg("Number must be between 1 and 50.");
        } else if (numbers.current.includes(num)) {
            setMsg("Number already exists.");
        } else {
            const updatedNumbers = [...numbers.current, num].sort((a, b) => a - b);
            numbers.current = (updatedNumbers);
            setMsg("Number added successfully.");
            setEntryNumber("");
            // console.log(numbers.current);
        }
    };

    return (
        <>
            <div className="bg-white flex items-center justify-center p-6">
                <div className="relative w-full max-w-lg bg-gray-200 rounded-2xl shadow-lg flex flex-col p-6 items-center">
                    <div className="absolute top-1 left-2 flex items-center space-x-1">
                        <img src="/logo.png" alt="Logo" className="w-14 h-14" />
                        <span className="text-gray-500 text-lg font-semibold">
                            Geo-Fencing Attendance Manager
                        </span>
                    </div>
                    <div className="w-full flex flex-col items-center mt-4">
                        <label className="text-gray-800 font-semibold mb-1">Select Venue</label>
                        <select
                            value={selectedVenue}
                            onChange={(e) => setSelectedVenue(e.target.value)}
                            className="w-full px-4 py-2 mb-2 bg-gray-300 font-semibold rounded-md focus:outline-none"
                        >
                            {venueOptions.map((venue, index) => (
                                <option key={index} value={venue}>
                                    {venue}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={chooseVanue}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md font-semibold w-full"
                        >
                            Select
                        </button>
                    </div>


                    <div className="text-gray-800 font-semibold mt-8">
                        <span>Date: {date}</span><br />
                        <span>Semester: {sem}</span><br />
                        <span>Section: {sec}</span><br />
                        <span>Course Code: {cc}</span><br />
                        <span>Course Name: {cn}</span><br />
                    </div>
                    <button
                        className={`${isRunning ? "bg-orange-400" : "bg-green-600"} hover:bg-orange-400 active:bg-orange-400 text-white py-2 px-6 rounded-md font-semibold mb-4 w-full mt-16`}
                        onClick={startTimer}
                    >
                        {isRunning ? `Attendance Running` : "Mark Attendance"}
                    </button>
                    <span className="text-gray-800 font-semibold mb-3">Mark Attendance Manually</span>
                    <div className="w-full flex flex-col items-center">
                        <input
                            type="text"
                            value={entryNumber}
                            onChange={(e) => setEntryNumber(e.target.value)}
                            className="w-full px-4 py-2 mb-2 bg-gray-300 font-semibold rounded-md focus:outline-none text-center"
                            placeholder="Entry Number"
                        />
                        <button
                            onClick={live ? handleAddNumber : () => { alert("Mark Attendance First") }}
                            className="bg-green-600 hover:bg-orange-400 text-white py-2 px-6 rounded-md font-semibold w-full"
                        >
                            Add
                        </button>
                        {msg && <p className="mt-2 text-red-600">{msg}</p>}
                        <div className="mt-2 text-black font-semibold">
                            {numbers.current.length > 0 && <p>Added Numbers: {numbers.current.join(", ")}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Main;