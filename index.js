const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config();
// bodyParser is for POST request
let bodyParser = require('body-parser');

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true, useUnifiedTopology: true
},
  function () {
    console.log("Connect to DB Succesefully");
  }
);
const Schema = mongoose.Schema;

// using localhost :
/*
const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:3000/posts", {
  useNewUrlParser: true, useUnifiedTopology: true
},
  function () {
    console.log("Connect to DB Succesefully");
  }
);
*/
// User Schema
const userSchema = new Schema({
  username: { type: String, required: true }
});
let User = mongoose.model('user', userSchema)
/*
const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
    },
  },
  { versionKey: false }
);
const User = mongoose.model('User', userSchema);
*/

// Exercise Schema
/*
const exerciseSchema = mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: String,
  userId: String
});
const Exercise = mongoose.model('Exercise', exerciseSchema);
*/

const exerciseSchema = new Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: new Date() },
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use('/', bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) => {
  // res.json(req.body);
  let username = req.body.username;
  let newUser = User({ username: username });
  newUser.save();
  res.json(newUser);
});
//app.post('/api/users', async (req, res) => {
//  res.send(req.body.username);
//   const username = req.body.username;
//    const foundUser = await User.findOne({ username });
//    if (foundUser) {
//      res.json(foundUser)
//    }
//    const user = await User.create({
//     username,
//    });

//    res.json(user);
//  });

// GET request to /api/users 
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.send(users);
});

// POST /api/users username
//app.post('/api/users', async (req, res) => {
//  res.send(req.body.username);
//   const username = req.body.username;
//   const foundUser = await User.findOne({ username });
//   if (foundUser) {
//     res.json(foundUser)
//   }
//   const user = await User.create({
//     username,
//   });

//   res.json(user);
// });

// app.get('/api/users/:_id/logs', async (req, res) => {
//   const userId = await req.params._id;
//   res.send(userId);
// });

// POST to /api/users/:_id/exercises
app.post('/api/users/:_id/exercises', (req, res) => {
  let userId = req.params._id;
  let exerciseObject = {
    userId: userId,
    description: req.body.description,
    duration: req.body.duration
  }
  if (req.body.date != '') {
    exerciseObject.date = req.body.date;
  }

  let newExercise = new Exercise(exerciseObject);

  User.findById(userId, (err, userFound) => {
    if (err) {
      console.log(err);
    }
    newExercise.save();
    res.json({
      _id: userFound._id,
      username: userFound.username,
      description: newExercise.description,
      duration: newExercise.duration,
      date: newExercise.date.toDateString(),
    });
  });
});

// GET request to /api/users/:_id/logs
app.get('/api/users/:_id/logs', (req, res) => {
  let userId = req.params._id;
  let responseObject = {};
  User.findById(userId, (err, userFound) => {
    if (err) {
      console.log(err);
    }
    let username = userFound.username;
    let userId = userFound._id;

    responseObject = {
      _id: userId,
      username: username
    }
    Exercise.find({ userId: userId }, (err, exercises) => {
      if (err) {
        console.log(err);
      }
      responseObject.log = exercises;
      responseObject.count = exercises.length;
      res.json(responseObject);
    });
  });
});
/*
app.post('/api/users/:_id/exercises', async (req, res) => {

  let { _id, description, duration, date } = req.body;
  const userId = req.body[':_id'];
  const foundUser = await User.findById(userId);
  if (!foundUser) {
    res.json({ message: "No user for that id" })
  }

  if (!date) {
    date = new Date();
  } else {
    date = new Date(date)
  }

  const exercise = await Exercise.create({
    username: foundUser.username,
    description,
    duration,
    date,
    userId,
  });

  res.send({
    username: foundUser.username,
    description,
    duration,
    date: date.toDateString(),
    _id: userId,
  });

});
*/
/* {
  username: "fcc_test",
  description: "test",
  duration: 60,
  date: "Mon Jan 01 1990",
  _id: "5fb5853f734231456ccb3b05"
}
*/

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
