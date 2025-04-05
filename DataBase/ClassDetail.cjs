const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const ClassDetail = new Schema({
    courseCode: String,
    courseName:String,
    semester: String,
    department: String,
    section: String,
    day: String,
    date: String,
    time: String,
    Attend: []
})

const Live = new Schema({
    TeacherLatitude: Number,
    TeacherLongitude: Number,
    isLive: Boolean,
    time: String
})

const ClassModel = mongoose.model('ClassDetail',ClassDetail);
const LiveModel = mongoose.model('IsLIve',Live);

module.exports = {
    ClassDetail: ClassModel,
    Live: LiveModel
};