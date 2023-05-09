const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/project1");

const express = require("express");
const app = express();


const userRoute = require('./routes/userRoute');
const user_route = require('./routes/userRoute');
app.use('/',userRoute);

app.get('/', (req, res) => {
    res.send('Welcome to my website!');
  });
app.listen(4000, function(req,res){
    console.log("server is running on port 4000 ......");
});