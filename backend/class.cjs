require("dotenv").config();
const express = require("express");
const { Router } = require("express");
const Class = Router();
const { subject } = require("../DataBase/subject.cjs");
const { course, schedule } = require("../DataBase/TImeTable.cjs");

const app = express();
app.use(express.json());

Class.post("/data", async (req, res) => {
    function getCurrentDateTime() {
        const now = new Date();

        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const day = days[now.getDay()]; // Current day (Sunday, Monday, etc.)

        // Time in 24-hour format (HH:MM:SS)
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const times = `${hours}:${minutes}:${seconds}`;

        const date = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is zero-based
        const year = now.getFullYear();
        const formattedDate = `${date}/${month}/${year}`;
        console.log(hours);
        
        return { day, time: hours, formattedDate, times};
    }


    const { day, time, formattedDate,times} = getCurrentDateTime(); //  Fixed variable names
    const { email } = req.body;
    console.log(time,"htyyyy");
    
    try {
        const users = await subject.find({ email }); // Get user subjects
        // console.log(users,"gfsdafsgsd");

        let matchedClasses = [];

        for (const user of users) {
            const matchedSchedule = await schedule.findOne({
                courseCode: user.courseCode,
            });

            if (matchedSchedule) {
                console.log(matchedSchedule)
                // Find the index where the day matches
                const index = matchedSchedule.day.findIndex((d) => d === day);
                console.log(index);
                console.log(matchedSchedule.time[index]);
                console.log(time,"times");
                console.log(matchedSchedule.time[index].startsWith(time));
                                
                
                if (index !== -1 && matchedSchedule.time[index].startsWith(time)) {
                    matchedClasses.push({
                        ...user.toObject(),
                        section: matchedSchedule.section,
                        day:day,
                        Date: formattedDate,
                        time: times
                    });
                }
            }
        }

        console.log(matchedClasses);
        res.status(200).json({ matchedClasses:matchedClasses });
    } catch (error) {
        console.error("Error fetching schedule:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

Class.post("/extra", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await subject.find({ email }); // Await the database query

        if (user.length > 0) {
            res.status(200).json({ Classes: user });
        } else {
            res.status(404).json({ error: "No classes found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = {
    Class: Class
};
