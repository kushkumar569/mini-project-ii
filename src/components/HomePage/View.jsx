import Header from "../Header";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

function View() {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [error, setError] = useState(null);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    useEffect(() => {
        const preventGoBack = () => {
            window.history.pushState(null, "", window.location.href);
        };
    
        preventGoBack(); // Push one state to begin
    
        const handlePopState = () => {
            preventGoBack(); // Push again when user tries to go back
        };
    
        window.addEventListener("popstate", handlePopState);
    
        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);
    
    
    
    

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await fetch(`${proces.env.BACKEND_URL}/get/AllClassDetail`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch class details");
                }

                const data = await response.json();
                setClasses(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchClasses();
    }, []);

    const convertToComparableDate = (dateStr) => {
        const [day, month, year] = dateStr.split("/");
        return new Date(`${year}-${month}-${day}`);
    };

    async function handleSelectCourse(classId) {
        if (!fromDate || !toDate) {
            alert("Please choose both From and To dates before selecting a course.");
            return;
        }

        setSelectedClass(classId);
        try {
            const response = await fetch(`${proces.env.BACKEND_URL}/get/GetAttendence`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: classId }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch attendance details");
            }

            const data = await response.json();
            const from = new Date(fromDate);
            const to = new Date(toDate);

            const filtered = data.filter(entry => {
                const entryDate = convertToComparableDate(entry.Date);
                return entryDate >= from && entryDate <= to;
            });

            setAttendance(filtered);
        } catch (err) {
            console.error("Error fetching attendance:", err.message);
        }
    }

    const downloadPDF = () => {
        if (!selectedClass) {
            alert("Please select a course first!");
            return;
        }

        const doc = new jsPDF();
        const selectedCourse = classes.find((classItem) => classItem._id === selectedClass);

        doc.setFontSize(16);
        doc.text("Attendance Report", 20, 10);

        doc.setFontSize(12);
        doc.text(`Course Code: ${selectedCourse.courseCode}`, 20, 20);
        doc.text(`Course Name: ${selectedCourse.courseName}`, 20, 30);
        doc.text(`Semester: ${selectedCourse.semester}`, 20, 40);
        doc.text(`Department: ${selectedCourse.department}`, 20, 50);
        doc.text(`Section: ${selectedCourse.section}`, 20, 60);

        const tableColumn = ["Roll Number", ...attendance.map((entry) => entry.Date)];
        const tableRows = [];

        for (let roll = 1; roll <= 50; roll++) {
            const rowData = [roll];
            attendance.forEach((entry) => {
                rowData.push(entry.atted.includes(roll) ? "Present" : "Absent");
            });
            tableRows.push(rowData);
        }

        autoTable(doc, {
            startY: 70,
            head: [tableColumn],
            body: tableRows,
        });

        doc.save(`Attendance_${selectedCourse.courseCode}.pdf`);
    };

    return (
        <div className="p-4">
            <h2 className="text-lg font-bold mb-4">Class Details</h2>
            {error && <p className="text-red-500">{error}</p>}

            <div className="flex items-center gap-4 mb-4">
                <label>From: <input type="date" className="border rounded px-2 py-1" value={fromDate} onChange={e => setFromDate(e.target.value)} /></label>
                <label>To: <input type="date" className="border rounded px-2 py-1" value={toDate} onChange={e => setToDate(e.target.value)} /></label>
            </div>

            <div className="overflow-x-auto">
                <table className="table-auto border-collapse border border-gray-400 w-full text-center">
                    <thead>
                        <tr>
                            <th className="border border-gray-400 px-4 py-2">Course Code</th>
                            <th className="border border-gray-400 px-4 py-2">Course Name</th>
                            <th className="border border-gray-400 px-4 py-2">Semester</th>
                            <th className="border border-gray-400 px-4 py-2">Department</th>
                            <th className="border border-gray-400 px-4 py-2">Section</th>
                            <th className="border border-gray-400 px-4 py-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classes.map((classItem, index) => (
                            <tr key={index}>
                                <td className="border border-gray-400 px-4 py-2">{classItem.courseCode}</td>
                                <td className="border border-gray-400 px-4 py-2">{classItem.courseName}</td>
                                <td className="border border-gray-400 px-4 py-2">{classItem.semester}</td>
                                <td className="border border-gray-400 px-4 py-2">{classItem.department}</td>
                                <td className="border border-gray-400 px-4 py-2">{classItem.section}</td>
                                <td className="border border-gray-400 px-4 py-2">
                                    <button 
                                        className={`px-4 py-2 rounded text-white ${selectedClass === classItem._id ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-700'}`}
                                        onClick={() => handleSelectCourse(classItem._id)}
                                    >
                                        {selectedClass === classItem._id ? "Selected" : "Select"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {attendance.length > 0 && (
                <div className="mt-8 overflow-x-auto">
                    <h3 className="text-lg font-bold mb-2">Attendance Record</h3>
                    <button className="mb-4 px-4 py-2 bg-red-500 text-white rounded" onClick={downloadPDF}>
                        Download as PDF
                    </button>
                    <table className="table-auto border-collapse border border-gray-400 w-full text-center">
                        <thead>
                            <tr>
                                <th className="border border-gray-400 px-4 py-2">Roll Number</th>
                                {attendance.map((entry, index) => (
                                    <th key={index} className="border border-gray-400 px-4 py-2">{entry.Date}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 50 }, (_, i) => i + 1).map((roll) => (
                                <tr key={roll}>
                                    <td className="border border-gray-400 px-4 py-2">{roll}</td>
                                    {attendance.map((entry, i) => (
                                        <td key={i} className="border border-gray-400 px-4 py-2">
                                            {entry.atted.includes(roll) ? "✔️" : "❌"}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default View;