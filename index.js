const express = require('express')
require('dotenv').config()
const connectDB = require('./db.js')
const gradeModel = require('./models/grades.js')
const gradeRoute = require('./routes/gradeRoute.js')
const PORT = process.env.PORT
const app = express()

app.use(express.json())
app.use('/grades', gradeRoute)
connectDB();  



app.get('/',async(req,res)=> {  
   res.send('welcome to our grades app')
}) 


app.listen(PORT,()=>{
    console.log('running on port ' + PORT)
})