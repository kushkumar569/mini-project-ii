import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { Ids, Date as DateAtom, Time as TimeAtom, Day } from "../atoms/attendence";
import { useNavigate } from "react-router-dom";

function TodayAttendance() {
    const ids = useRecoilValue(Ids);
    const date = useRecoilValue(DateAtom);
    const time = useRecoilValue(TimeAtom);
    const day = useRecoilValue(Day);
    const [todayAttnd, setTodayAttnd] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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


    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await fetch(`${process.env.BACKEND_URL}/get/TodayAttendence`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        courseCode: ids,
                        Date: date,
                        Time: time,
                        Day: day
                    }),
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch Today's Attendance");
                }

                const data = await response.json();
                setTodayAttnd(data);
            } catch (err) {
                console.error("Error fetching attendance:", err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, [ids, date, time, day]);

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Today's Attendance</h2>

            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : todayAttnd ? (
                <div className="bg-gray-50 p-4 rounded-lg text-gray-700 border border-gray-100">
                    <pre className="whitespace-pre-wrap break-words bg-gray-100 p-4 rounded-lg text-sm font-mono text-gray-800 overflow-x-auto border border-gray-300 shadow-sm">
                        {JSON.stringify(todayAttnd, null, 2)}
                    </pre>

                </div>
            ) : (
                <p className="text-red-500">No attendance data found for today.</p>
            )}

            <button
                onClick={() => navigate("/view", { replace: true })}
                className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md"
            >
                View Total Attendance
            </button>
        </div>
    );
}

export default TodayAttendance;
