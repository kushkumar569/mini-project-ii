const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

// Info Schema
const Info = new Schema({
    semester: { type: String, required: true },
    department: { type: String, required: true },
});

// Course Schema (Connected to Info)
const course = new Schema({
    ids: { type: ObjectId, ref: "Info", required: true },  //  References Info._id
    courseCode: { type: String, unique: true, required: true },  //  Unique Course Code
    courseName: { type: String, required: true }
});

// Schedule Schema (Connected to Course)
const schedule = new Schema({
    courseCode: { type: String, required: true, ref: "course" }, //  References course.courseCode
    section: { type: String, required: true },
    day: { type: [String], default: [] },
    time: { type: [String], default: [] },
});

//  Compound Unique Index for Schedule (courseCode + section)
schedule.index({ courseCode: 1, section: 1 }, { unique: true });

const InfoModel = mongoose.model('Info', Info);
const CourseModel = mongoose.model('course', course);
const ScheduleModel = mongoose.model('schedule', schedule);

module.exports = {
    Info: InfoModel,
    course: CourseModel,
    schedule: ScheduleModel
};
