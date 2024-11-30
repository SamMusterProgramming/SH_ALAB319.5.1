const express = require('express')
const connectDB = require('../db')
const gradeModel = require('../models/grades')
const { ObjectId } = require('mongodb');


connectDB();

const route = express.Router();


// access all grades by student_id for student x 
route.get('/match/:id',async(req,res)=>{
    const results = await gradeModel.aggregate([{
        $match : {
            student_id:Number(req.params.id)
        },
    },{
        $set: {
            "learner_id": "$student_id" 
        }
    }])
    res.send(results)
})  


// create a single grade entry
route.post('/',validateGradeEntries,async(req,res)=> {  
    let newGrade = new gradeModel({
        student_id:req.body.sudent_id,
        scores:req.body.scores,
        class_id:req.body.class_id
    })
    await newGrade.save()
    return res.json(newGrade).status(200)
}) 

// get a single grade with _id
route.route('/:id')
   .get(validateMongoObjectId,async(req,res)=> {  
    let results = await gradeModel.findById(req.params.id)
    if(!results) return res.json(`'can't find resource`).status(404)
    return res.json(results).status(200)
  })// delete a single grade with _id
   .delete(validateMongoObjectId,async(req,res)=>{
    const result = await gradeModel.deleteOne({_id:req.params.id})
    if(!result) return res.json(`'can't find resource`).status(404)
    return res.json(result).status(200)
   }) // update existent grade record with _id
   .patch(validateMongoObjectId,async(req,res)=>{
    const id = req.params.id ; 
    const result = await gradeModel.findByIdAndUpdate(id,req.body)
    if(!result) res.status(404).json({error:"can't find the grade record"})
    return res.json(result).status(201)
   })  

   // Add a score to a grade entry using _id
   route.patch('/:id/add',validateMongoObjectId,async(req,res)=>{
    const id = req.params.id 
    if(! req.body.type || !req.body.score) return res.status(404).json({error:"invalid data"})
    const result = await gradeModel.findByIdAndUpdate(id,
      { $push: { scores : req.body } }, 
      { new: true })
    if(!result) return res.json({error:'not found'})  
    return res.status(201).json(result)  
   })

   // remove a score from a grade entry
   route.patch('/:id/remove',validateMongoObjectId,async(req,res)=>{
    const _id = req.params.id;
    if(! req.body.type || !req.body.score) return res.status(404).json({error:"invalid data"})
    const result = await gradeModel.findByIdAndUpdate(
              _id, 
              {
                $pull:{scores:req.body}
              } ,
              { new: true }  
              )
    if(!result) return res.status(404).json({error:"not found"})          
    return res.status(201).json(result)
   })   
   
   // Get a student's grade data by student_id and class query
   route.get('/student/:id',async(req,res)=>{
     const student_id = Number(req.params.id)
     if(!req.query.class) return res.status(404).json({error:"invalid class query"})
     const class_id = Number(req.query.class) 
     const query = {student_id:student_id,class_id:class_id} 
     const result = await gradeModel.findOne(query)  
     if(!result) return res.json({error:"could't find record"})
     // we can just send the scores data here 
     res.status(200).json(result.scores)    
    }) 
   
    // Delete a student's grade data
    route
    

   route.get('/class/:id',async(req,res)=>{
    const class_id = Number(req.params.id)
    const results = await gradeModel.aggregate( 
        [{
            $match:{class_id:class_id}
        }]
        ).exec();
    return res.send(results)
})

//,validateGradeEntries

function validateMongoObjectId(req,res,next) {
   if (!ObjectId.isValid(req.params.id)) return res.status(404).json({Error:"error in request ID"});
   next()
}
   
function validateGradeEntries(req,res,next) {
    if(!req.body.student_id || ! req.body.class_id)
    return res.status(404).json({error:'class id and student id are required'})
    next();
}
   
module.exports = route;