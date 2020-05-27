const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

let users= [];
let ID= 1;
let listuserexercise = {};
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/exercise/new-user', (req,res)=>{
  
  var userName= req.body.username;
  listuserexercise[""+ID] = {
    _id: ""+ID,
    username: userName,
    log: [],
  }
  users.push({
     username: userName,
     _id : ""+ID
  })
  res.json({
   username: userName,
   _id : ""+ID++
  })
});

app.get('/api/exercise/users', (req,res)=>{
   res.json(users);
});
app.get('/api/exercise/log', (req,res)=>{
  let user = listuserexercise[req.query.userId];
  let from = req.query.from;
  if(from != null){
    from = new Date(from);
  }
  let to = req.query.to;
  if(to != null){
    to = new Date(to);
  }
  let limit = req.query.limit;
  if(limit != null){
    limit = parseInt(limit);
  }
  let log = user.log;
  let temp = [];
  for(let i = 0; i < log.length; ++i){
    if(from != null){
      if(log[i].date < from){
        continue;
      }
    }
    if(to != null){
      if(log[i].date > to){
        continue;
      }
    }
    if(limit != null){
      if(temp.length >= limit){
        continue;
      }
    }
    temp.push(log[i]);
  }
  res.json({
    _id : user._id,
    username : user.username,
    count: temp.length,
    log: temp
  })

})
app.post('/api/exercise/add', (req,res)=>{
  var body = req.body;
  var user;
  if(body.userId === ''){
    res.json({error: 'require _id'});
    return;
  }else{
    var userID = body.userId;
    var found = false;
    var username;
    users.forEach(function(element){
      if(element._id == userID){
        found = true;
        username = element.username;
        user = listuserexercise[userID];
      }
    });
    if(!found){
      res.json({error: 'unkown _id'});
      return;
    }
  }
  if(body.description === ''){
    res.json({error: 'require description'});
    return;
  }else{
    var description = body.description;
  }
  if(body.duration === ''){
    res.json({error: 'require duration'});
    return;
  }else{
    var duration = body.duration;
    if(isNaN(duration) || (Number(duration)<=0)){
      res.json({error: duration + ' is not a possitive number'});
      return;
    }
  }
  var d
  var date = req.body.date;
  var regex = /^\d{4}-\d\d?-\d\d?$/;
  if(date == null|| !regex.test(date)|| isNaN(Date.parse(date))){
    d = new Date();
  }else{
    d = new Date(date);
  }
  date = d.toDateString();
  let exercise = {
    description: ""+description,
    duration: parseInt(duration),
    date: date,
  }
  user.log.push(exercise);
  exercise._id =userID;
  exercise.username = username;
  res.json(exercise);
});

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
