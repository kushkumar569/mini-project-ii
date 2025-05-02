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
      
        // Get current UTC time in milliseconds
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      
        // IST is UTC + 5 hours 30 minutes (19800000 ms)
        const istTime = new Date(utc + (5.5 * 60 * 60 * 1000));
      
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const day = dayNames[istTime.getDay()];
      
        const date = String(istTime.getDate()).padStart(2, '0');
        const month = String(istTime.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = istTime.getFullYear();
      
        const hours = String(istTime.getHours()).padStart(2, '0');
        const minutes = String(istTime.getMinutes()).padStart(2, '0');
        const seconds = String(istTime.getSeconds()).padStart(2, '0');
      
        const formattedDate = `${date}/${month}/${year}`;
        const times = `${hours}:${minutes}:${seconds}`;
      
        return { day, time: hours, formattedDate, times };
      }
    

    const { day, time, formattedDate,times} = getCurrentDateTime(); //  Fixed variable names
    const { email } = req.body;
    // console.log(time,"htyyyy");
    
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
                // console.log(index);
                // console.log(matchedSchedule.time[index]);
                // console.log(time,"times");
                // console.log(matchedSchedule.time[index].startsWith(time));
                                
                
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
