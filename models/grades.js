const mongoose = require('mongoose')

const gradeSchema = new mongoose.Schema({
   student_id :{
     type:Number,
     require:true
   },
   scores: Array(4),
   class_id :{
      type:Number,
   required:true
  }
}, { versionKey: false })

const gradeModel = mongoose.model("grades",gradeSchema);

module.exports = gradeModel ;