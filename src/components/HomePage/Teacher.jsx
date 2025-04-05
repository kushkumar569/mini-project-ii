import { useState, useEffect, useRef } from "react";
import Header from "../Header";
import Main from "./Main.jsx"
import showToast from "./alert.js";
import Logout from "../Login/Logout.jsx";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { Ids, Date as DateAtom, Time as TimeAtom, Day } from "../atoms/attendence.js";

function Teacher() {
    const navigate = useNavigate();
    const [isRunning, setIsRunning] = useState(false);
    const [msg, setMsg] = useState("");
    const [showMain, setShowMain] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [view, setView] = useState(false);
    const [email, setEmail] = useState("");
    const numbers = useRef([]);
    // console.log(typeof numbers);

    useEffect(() => {
        setView(false);
    }, []);

    useEffect(() => {
        const fetchEmail = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${proces.env.BACKEND_URL}/me`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) throw new Error("Failed to fetch user");

                const data = await response.json();
                if (data.user) {
                    console.log(data.user.email, "heloooo");
                    setEmail(data.user.email);
                }
            } catch (error) {
                console.error("Auto-login failed:", error);
            }
        };

        fetchEmail();
    }, []);


    useEffect(() => {
        if (!email) return;

        const fetchData = async () => {
            try {
                console.log(email, "Fetching class data...");

                const response = await fetch(`${proces.env.BACKEND_URL}/class/data`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                });

                if (!response.ok) {
                    setShowMain(false);
                    return;
                }

                const data = await response.json();

                if (data.matchedClasses.length === 0) {
                    setMsg("There are no classes at this time");
                    setShowMain(false);
                } else {
                    const use = data.matchedClasses[0];
                    const set = async () => {
                        try {
                            const response = await fetch(`${proces.env.BACKEND_URL}/setData/set`, {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json",  // Fix: Add headers
                                },
                                body: JSON.stringify({
                                    _id: "67e71048258dbe80e2a60117",
                                    courseCode: use.courseCode,
                                    courseName: use.courseName,
                                    semester: use.semester,
                                    department: use.department,
                                    section: use.section,
                                    day: use.day,
                                    date: use.Date,
                                    time: use.time
                                })
                            });
                            console.log(response);

                            if (!response.ok) {
                                throw new Error("Failed to update user");
                            }

                            const data = await response.json();  // Fix: Call json() once
                            console.log("Updated Class:", data);

                        } catch (error) {
                            console.error("Error:", error);
                        }
                    };


                    setShowMain(true);
                    setMsg("Class");

                    setSelectedCourse({
                        cc: use.courseCode,
                        cn: use.courseName,
                        sec: use.section,
                        date: use.Date,
                        dep: use.department,
                        sem: use.semester,
                        day: use.day,
                        time: use.time
                    });
                    await set();
                    console.log("Class Data:", use);
                }
            } catch (error) {
                console.error("Error fetching schedule:", error);
                setMsg("Error fetching schedule");
                setShowMain(false);
            }
        };

        fetchData();
    }, [email]); // Runs when `email` is set

    function viewAttnd() {
        navigate("/view")
    }

    function TodayClass() {
        console.log(email);     
        navigate("/TodaySchedule",{
            state: {email: email},
        })
    }

    return (
        <>
            <Header />
            {isRunning && <Time {...selectedCourse} isRunning={isRunning} setIsRunning={setIsRunning} setShowMain={setShowMain} setView={setView} numbers={numbers} />}

            {showMain ? (
                <Main {...selectedCourse} isRunning={isRunning} setIsRunning={setIsRunning} numbers={numbers} />
            ) : (
                <>
                    <NoClass msg={msg} setShowMain={setShowMain} setSelectedCourse={setSelectedCourse} email={email} />
                    <div className="flex flex-col justify-center items-center">
                        <button className="bg-green-600 hover:bg-orange-400 active:bg-orange-400 text-white py-2 px-6 rounded-md font-semibold mb-4" onClick={TodayClass}>
                            Today's Schedule
                        </button>
                    </div>
                </>
            )}
            <div className="flex flex-col justify-center items-center">
                <button className="bg-green-600 hover:bg-orange-400 active:bg-orange-400 text-white py-2 px-6 rounded-md font-semibold mb-4" onClick={viewAttnd}>
                    View Attendance
                </button>
                <Logout />
            </div>
        </>
    );

}


function NoClass({ msg, setShowMain, setSelectedCourse, email }) {
    const [find, setFind] = useState(false);
    const [classes, setClasses] = useState([]); // Store fetched classes
    async function FindClass() {
        try {
            const response = await fetch(`${proces.env.BACKEND_URL}/class/extra`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                console.error("Failed to fetch extra classes");
                setFind(false);
                return;
            }

            const data = await response.json();
            console.log("Extra Classes:", data.Classes);
            setClasses(data.Classes); // Store classes in state
            setFind(true);

        } catch (error) {
            setFind(false);
            console.error("Error fetching schedule:", error);
        }
    }

    return (
        <div className="bg-white flex items-start justify-center">
            <div className="w-full max-w-lg bg-gray-200 rounded-2xl shadow-lg flex flex-col p-6 items-center space-y-4">
                {!find ? <span>{msg}</span> : null}

                {!find ? (
                    <button
                        className="bg-green-600 hover:bg-orange-400 text-white py-2 px-6 rounded-md font-semibold w-full"
                        onClick={FindClass}
                    >
                        Extra Class/Reschedule
                    </button>

                ) : (
                    <div className="flex flex-row flex-wrap gap-4 justify-center">
                        {classes.map((course, index) => (
                            <Extra key={index} course={course} setShowMain={setShowMain} setSelectedCourse={setSelectedCourse} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function Extra({ course, setShowMain, setSelectedCourse }) {
    const [sect, setSect] = useState("A"); // Default section (Hard coded)

    let days = null
    let time = null
    let formattedDate = null

    async function find() {
        const now = new Date();

        const dayss = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        days = dayss[now.getDay()]; // Current day (Sunday, Monday, etc.)

        // Time in 24-hour format (HH:MM:SS)
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        time = `${hours}:${minutes}:${seconds}`;

        const date = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is zero-based
        const year = now.getFullYear();
        formattedDate = `${date}/${month}/${year}`;

        const set = async () => {
            try {
                const response = await fetch(`${proces.env.BACKEND_URL}/setData/set`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",  // Fix: Add headers
                    },
                    body: JSON.stringify({
                        _id: "67e71048258dbe80e2a60117",
                        courseCode: course.courseCode,
                        courseName: course.courseName,
                        semester: course.semester,
                        department: course.department,
                        section: sect,
                        day: days,
                        date: formattedDate,
                        time: time
                    })
                });
                console.log(response);

                if (!response.ok) {
                    throw new Error("Failed to update user");
                }

                const data = await response.json();  // Fix: Call json() once
                console.log("Updated Class:", data);

            } catch (error) {
                console.error("Error:", error);
            }
        };
        await set();

        setSelectedCourse({
            cc: course.courseCode,
            cn: course.courseName,
            sec: sect,
            date: formattedDate,
            dep: course.department,
            sem: course.semester,
            day: days,
            time: time
        });

        setShowMain(true);
    }
    return (
        <div className="bg-gray-300 p-4 rounded-lg shadow-md text-center w-64">
            <h2 className="text-lg font-bold">{course.courseName}</h2>
            <p><strong>Code:</strong> {course.courseCode}</p>
            <p><strong>Semester:</strong> {course.semester}</p>
            <p><strong>Department:</strong> {course.department}</p>

            {/* Inline Section Dropdown */}
            <div className="flex justify-center items-center gap-2 mt-2">
                <label className="text-lg font-bold">Section:</label>
                <select
                    className="pl-2 pr-2 border rounded-md bg-white"
                    value={sect}
                    onChange={(e) => setSect(e.target.value)}
                >
                    <option value="A">A</option>
                </select>
            </div>

            <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 mt-2 rounded-md font-semibold" onClick={find}>
                Choose Course
            </button>
        </div>
    );
}

function Time({ cc, cn, sec, date, dep, sem, day, time, isRunning, setIsRunning, setShowMain, setView, numbers }) {
    const navigate = useNavigate();
    const [timee, setTimee] = useState(1 * 10);
    const [hasRun, setHasRun] = useState(false);
    const setids = useSetRecoilState(Ids);
    const setdate = useSetRecoilState(DateAtom);
    const settime = useSetRecoilState(TimeAtom);
    const setday = useSetRecoilState(Day);

    const set = async () => {
        try {
            const response = await fetch(`${proces.env.BACKEND_URL}/setData/set`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",  // Fix: Add headers
                },
                body: JSON.stringify({
                    _id: "67e71048258dbe80e2a60117",
                    courseCode: null,
                    courseName: null,
                    semester: null,
                    department: null,
                    section: null,
                    day: null,
                    date: null,
                    time: null
                })
            });
            console.log(response);

            if (!response.ok) {
                throw new Error("Failed to update user");
            }

            const data = await response.json();  // Fix: Call json() once
            console.log("Updated Class:", data);

        } catch (error) {
            console.error("Error:", error);
        }
    };

    async function setTime() {
        try {
            const response = await fetch(`${proces.env.BACKEND_URL}/setData/setTime`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    _id: "67e71052258dbe80e2a60119",
                    TeacherLatitude: 0,
                    TeacherLongitude: 0,
                    isLive: false,
                    time: null
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

    async function setAttendence() {
        try {
            const response = await fetch(`${proces.env.BACKEND_URL}/setData/setAttendence`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    courseCode: cc,
                    courseName: cn,
                    section: sec,
                    Date: date,
                    department: dep,
                    semester: sem,
                    Day: day,
                    Time: time,
                    atted: numbers.current
                })
            });

            console.log(response);

            if (response.ok) {
                const data = await response.json();
                console.log("Updated Time:", data);
                setids(cc);
                settime(time);
                setdate(date);
                setday(day);
            } else {
                const errorText = await response.text();
                console.error("Error Response:", errorText);
                throw new Error(`Failed to update Time: ${errorText}`);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    useEffect(() => {
        let timer;
        if (hasRun) return;
        setHasRun(true);

        const handleTimeout = async () => {
            await set(); // Call your set function
            await setTime(); // Call setTime
            await setAttendence(); // Call attendance update
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds

            setIsRunning(false);
            setShowMain(false);
            setView(true);
            navigate('/TodayAttendence', { replace: true });
        };

        if (isRunning && timee > 0) {
            timer = setInterval(() => {
                setTimee(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(timer);
                        handleTimeout();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, []);

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }

    return timee > 0 ? <div className="text-lg font-bold text-gray-800">Time Remaining: {formatTime(timee)}</div> : null;
}

export default Teacher;
