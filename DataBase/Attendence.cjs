const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const Detail = new Schema({
    semester: String,
    department: String,
    section: String,
    courseCode: String,
    courseName: String,
})

Detail.index({semester:1,department:1,section:1,courseCode:1,courseName:1},{unique:true})

const Attendence = new Schema({
    ids: { type: ObjectId, ref: "Detail", required: true },
    Date: String,
    Time: String,
    Day: String,
    atted: {type: mongoose.Schema.Types.Mixed}
})

const DetailModel = mongoose.model('Details',Detail);
const AttendenceModel = mongoose.model('AttendenceDetail',Attendence);

module.exports = {
    detail: DetailModel,
    Attendence: AttendenceModel,
}

