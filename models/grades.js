const mongoose = require('mongoose')

const gradeSchema = new mongoose.Schema({
   student_id :{
     type:Number,
     min: 0,
     require:true
   },
   scores: Array(4),
   class_id :{
      type:Number,
      min: [0],
      max: [300, '300 is the max'],
   required:true,
   index: true
  }
},
 { versionKey: false })
gradeSchema.index({class_id:1});
gradeSchema.index({student_id:1});
gradeSchema.index({class_id:1,student_id:1});
const gradeModel = mongoose.model("grades",gradeSchema);

module.exports = gradeModel ;