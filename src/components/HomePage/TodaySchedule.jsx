import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function TodaySchedule() {
    const location = useLocation();
    const { email } = location.state || {};
    
    const [schedule, setSchedule] = useState(null);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await fetch(`${process.env.BACKEND_URL}/get/TodaySchedule`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch Today's Schedule");
                }

                const data = await response.json();
                console.log(data);
                setSchedule(data);
            } catch (err) {
                console.error("Error fetching schedule:", err.message);
            }
        };

        fetchClasses();
    }, []);

    return (
        <div className="p-6 min-h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-6 text-center">Today's Classes</h1>
            {schedule?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schedule.map((cls, index) => (
                        <div
                            key={index}
                            className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300"
                        >
                            <h2 className="text-xl font-semibold text-blue-700 mb-2">{cls.courseName}</h2>
                            <p className="text-gray-600">
                                <strong>Course Code:</strong> {cls.courseCode}
                            </p>
                            <p className="text-gray-600">
                                <strong>Time:</strong> {cls.time}
                            </p>
                            <p className="text-gray-600">
                                <strong>Department:</strong> {cls.department}
                            </p>
                            <p className="text-gray-600">
                                <strong>Semester:</strong> {cls.semester}
                            </p>
                            <p className="text-gray-600">
                                <strong>Section:</strong> {cls.section}
                            </p>
                            <p className="text-gray-600 text-sm mt-2 italic">
                                <strong>Faculty:</strong> {cls.email}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 text-lg">No classes scheduled for today.</p>
            )}
        </div>
    );
}

export default TodaySchedule;
