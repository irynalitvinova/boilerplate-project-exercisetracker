const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config();

// const mongoose = require('mongoose');
// mongoose.connect(process.env.MONGO_URL, () => {
//   console.log("Connect to DB Succesefully");
// });



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

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true, useUnifiedTopology: true
},
  function () {
    console.log("Connect to DB Succesefully");
  }
);

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

const exerciseSchema = mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: String,
  userId: String
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// GET request to /api/users 
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.send(users);
});

// POST /api/users username
app.post('/api/users', async (req, res) => {
  //  res.send(req.body.username);
  const username = req.body.username;
  const foundUser = await User.findOne({ username });
  if (foundUser) {
    res.json(foundUser)
  }
  const user = await User.create({
    username,
  });
  res.json(user);
});

// POST to /api/users/:_id/exercises
app.post('/api/users/:_id/exercises', (req, res) => {
  // const id = req.params._id;
  let { _id, description, duration, date } = req.body;
  const userId = req.body[':_id'];
  if (!date) {
    date = new Date();
  } else {
    date = new Date(date)
  }
  res.send({
    _id: userId,
    description,
    duration,
    date: date.toDateString(),
  });
});

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
