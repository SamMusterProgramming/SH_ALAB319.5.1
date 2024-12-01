const express = require('express')
const gradeModel = require('../models/grades')
const { ObjectId } = require('mongodb');

const route = express.Router()


let studentsGradeHigher70 = 0;
let totalStudents = 0;
//create an aggregation pipeline
//The number of learners with a weighted average higher than 70
route.get('/students/stats',async(req,res)=> {
  const results = await gradeModel.aggregate([{
      $unwind: {
            path: "$scores",
            includeArrayIndex: 'string',
     }},
     {
     $group:
      {
     _id:{"student_id":"$student_id","class_id":"$class_id"},
     quiz: {
                 $push: {
                 $cond: {
                     if: { $eq: ["$scores.type", "quiz"] },
                     then: "$scores.score",
                     else: "$$REMOVE",
                 },
                 },
             } ,
     exam :{
         $push :{
         $cond:{
             if:{$eq:["$scores.type","exam"]},
             then:"$scores.score",
             else:"$$REMOVE",
         }
         }
     },
     homework: {
                 $push: {
                 $cond: {
                     if: { $eq: ["$scores.type", "homework"] },
                     then: "$scores.score",
                     else: "$$REMOVE",
                 },
                 },
             },      
     }},
     {
     $project: 
     {
    _id: 0,
          class_id: "$_id.class_id",
         student_id:"$_id.student_id",
         avg: {
            $sum: [
              { $multiply: [{ $avg: "$exam" }, 0.5] },
              { $multiply: [{ $avg: "$quiz" }, 0.3] },
              { $multiply: [{ $avg: "$homework" }, 0.2] },
            ],
          },
      }
    },
    {
        $match: 
        {
       avg:{$gt:70.00}
        }
    },
    {
        $group:
        {
          _id: "$student_id",
        } 
    },
    {
        $group:
        {
          _id: "$null",
          count: {
            $sum:1
          }
        } 
    }
    
  ])
  studentsGradeHigher70 = Number(results[0].count);
  console.log(studentsGradeHigher70)
  res.json(results)
})

//return the number of students
route.get('/students/total',async(req,res)=> {
    const results = await gradeModel.aggregate([
       {
        $group:{
            _id:"$student_id"
        }
       },
       {
        $group:{
            _id:"count",
            count: {
                $sum:1
            }
        }
       } 
    ])
    totalStudents = results[0].count;
    res.json(results)
})

// ratio 
route.get('/students/ratio',async(req,res)=>{
    if(totalStudents == 0 || studentsGradeHigher70 == 0) res.json({error:"can t calculate the ratio"})
    res.send(`The percentage of learners with an average above 70% is ${studentsGradeHigher70/totalStudents *100} %`)
})

//Within this route, mimic the above aggregation pipeline,
// but only for learners within a class that has a class_id equal to the specified :id

route.get('/class/stats/:id',async(req,res)=> {
    const class_id = Number(req.params.id) 
    const results = await gradeModel.aggregate([
        {
        $match:{
            _id:"$class_id"
        }
        },
        {
        $unwind: {
              path: "$scores",
              includeArrayIndex: 'string',
       }},
       {
       $group:
        {
       _id:{"student_id":"$student_id","class_id":"$class_id"},
       quiz: {
                   $push: {
                   $cond: {
                       if: { $eq: ["$scores.type", "quiz"] },
                       then: "$scores.score",
                       else: "$$REMOVE",
                   },
                   },
               } ,
       exam :{
           $push :{
           $cond:{
               if:{$eq:["$scores.type","exam"]},
               then:"$scores.score",
               else:"$$REMOVE",
           }
           }
       },
       homework: {
                   $push: {
                   $cond: {
                       if: { $eq: ["$scores.type", "homework"] },
                       then: "$scores.score",
                       else: "$$REMOVE",
                   },
                   },
               },      
       }},
       {
       $project: 
       {
      _id: 0,
            class_id: "$_id.class_id",
           student_id:"$_id.student_id",
           avg: {
              $sum: [
                { $multiply: [{ $avg: "$exam" }, 0.5] },
                { $multiply: [{ $avg: "$quiz" }, 0.3] },
                { $multiply: [{ $avg: "$homework" }, 0.2] },
              ],
            },
        }
      },
      {
          $match: 
          {
         avg:{$gt:70.00}
          }
      },
      {
          $group:
          {
            _id: "$student_id",
          } 
      },
      {
          $group:
          {
            _id: "$null",
            count: {
              $sum:1
            }
          } 
      }
      
    ])
   
    res.json(results)
  })
  


route.get('/student/:id/avg-class',async(req,res)=> {
    const results = await gradeModel.aggregate([
        {
            $match: { student_id:Number(req.params.id) },
          },
        {
          $unwind: { path: "$scores" },
        },
        {
          $group: {
            _id: "$class_id", 
            quiz: {
              $push: {
                $cond: {
                  if: { $eq: ["$scores.type", "quiz"] },
                  then: "$scores.score",
                  else: "$$REMOVE",
                },
              },
            },
            exam: {
              $push: {
                $cond: {
                  if: { $eq: ["$scores.type", "exam"] },
                  then: "$scores.score",
                  else: "$$REMOVE",
                },
              },
            },
            homework: {
              $push: {
                $cond: {
                  if: { $eq: ["$scores.type", "homework"] },
                  then: "$scores.score",
                  else: "$$REMOVE",
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            class_id: "$_id",
            avg: { 
              $sum: [
                { $multiply: [{ $avg: "$exam" }, 0.5] },
                { $multiply: [{ $avg: "$quiz" }, 0.3] },
                { $multiply: [{ $avg: "$homework" }, 0.2] },
              ],
            
            },
          }
        } ,{
            $match:{
                avg:{ $gt: 70.00}
            }
        } 
      ])   
      res.json(results)

})


module.exports = route ; 