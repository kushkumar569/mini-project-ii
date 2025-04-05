const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const AdminAccount = new Schema({
    email: {type: String,unique: true},
    password: String,
    name: String,
    department: String
})

const TeacherAccount = new Schema({
    email: {type: String,unique: true},
    password: String,
    name: String,
    department: String
})

const StudentAccount = new Schema({
    email: {type: String,unique: true},
    password: String,
    name: String,
    entryNo: String,
    department: String,
    semester: String,
    section: String
})

const TeacherAccountModel = mongoose.model(`Teacher's Account`,TeacherAccount);
const StudentAccountModel = mongoose.model(`Student's Account`,StudentAccount);
const AdminAccountModel = mongoose.model(`Admin's Account`,AdminAccount);

module.exports = {
    Teacher: TeacherAccountModel,
    Student: StudentAccountModel,
    Admin: AdminAccountModel
}