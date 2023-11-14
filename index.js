const express = require("express");
const cors = require("cors");
const connectDB = require("./db/mongooseConnection");
const User = require("./models/User");
const bcrypt = require('bcryptjs');
const { generateToken, authenticateToken } = require("./middleware/jwtAuth")

const app = express();

app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// MongoDB
connectDB();

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Rest API." });
});

app.post("/api/register", async (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email or Password field required" });
  }

  const foundUser = await User.findOne({ email });

  if (foundUser) {
    return res.json({ message: "Email already in use!" });
  }

  try {
    const hashPassword = await bcrypt.hash(password, 10)
    const newUser = new User({ email, password: hashPassword });
    await newUser.save();

    res.status(201).json({ message: "Successfully registered" });

  } catch (err) {
    res.json({ message: "Failed to register something went wrong!", error: err.message });
  }

});

app.post("/api/login", async (req, res) => {

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email or Password field required" });
    }

    const foundUser = await User.findOne({ email });

    if (!foundUser) {
      return res.status(401).json({ message: "Login Failed: Username or Password is Incorrect" });
    }

    const isPasswordMatched = await bcrypt.compare(password, foundUser.password);

    if (isPasswordMatched) {
      
      payload = {
        _id: foundUser._id, 
        email: foundUser.email
      }

      token = generateToken(payload);
      const { _id, email }  = foundUser.toObject();

      return res.status(200).json({ message: "Login Successfull!", _id, email, token: token });
    } else {
      return res.status(401).json({ message: "Login Failed: Username or Password is Incorrect" });
    }
  } catch (err) {
    res.json({ message: "Login Error: Something went wrong", error: err.message });
  }

})

app.get("/api/user", authenticateToken, async (req, res)=>{
  // const foundUser = await User.findOne({_id: req.user._id});

  res.status(200).send(req.user);
})


// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});