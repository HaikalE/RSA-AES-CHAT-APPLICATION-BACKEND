const express = require("express");
const router = express.Router();
const fetchUser = require("../config/fetchUser");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const crypto = require("crypto");
// creating user signing up  //
router.post(
  "/createUser",
  [
    body("name", "Please enter name").notEmpty(),
    // check whether emails format is correct or not //
    body("email", "Please enter valid email").isEmail(),
    // password must be at least 6 chars long
    body("password", "Please enter valid password").isLength({ min: 6 }),
    body("rsaPublic", "Please enter RSA public key").notEmpty(),
    body("rsaEncryptedPrivateKey", "Please enter RSA encrypted private key").notEmpty(),
  ],
  async (req, res) => {
    try {
      // Log the request body to see incoming data
      console.log("Request Body:", req.body);
      // if there are errors, return bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      // check whether the user with email exists already
      let userr = await User.findOne({ email: req.body.email });
      if (userr) {
        return res.send({ error: [{ msg: "User already exists" }] });
      }

      let user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        salt: req.body.salt,
        rsaPublic: req.body.rsaPublic,
        rsaEncryptedPrivateKey: req.body.rsaEncryptedPrivateKey,
      });

      const data = {
        userId: user._id,
      };

      const authToken = jwt.sign(data, jwtSecret);
      return res.send({ error: false, authToken });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// logging up user //
router.post(
  "/login",
  [
    // check whether emails format is correct or not //
    body("email", "please enter valid email").isEmail(),
    // password must be at least 6 chars long
    body("password", "please enter valid password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const { email, password } = req.body;
    try {
      console.log("Request Body Login:", req.body);
      // finding user exist or not //
      let user = await User.findOne({ email });

      if (!user) {
        // sending error if user does not exist //
        return res.send({
          error: true,
          message: "Please enter valid login credentials",
        });
      } else {
        
        if (password !== user.password) {
          return res.send({
            error: true,
            message: "Please enter valid login credentials",
          });
        }

        const data = {
          userId: user._id,
        };

        // sending jwt token if password and email are verified //
        const authToken = jwt.sign(data, jwtSecret);
        return res.send({ authToken });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Route untuk mendapatkan salt berdasarkan email user
router.get("/getSalt/:email", async (req, res) => {
  try {
    const { email } = req.params;
    console.log("SUKSES YESS")
    // Cari user berdasarkan email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({ error: true, message: "User not found" });
    }

    // Kembalikan salt milik user
    return res.send({ error: false, salt: user.salt });
  } catch (err) {
    console.error("Error fetching salt:", err.message);
    res.status(500).send("Internal Server Error");
  }
});



//fetching log user details //

router.get("/getUser", fetchUser, async (req, res) => {
  try {
    console.log(req.user);
    let userId = req.user;
    let user = await User.findById(userId).select("-password");
    if (user) {
      return res.send(user);
    }

    return res.send("Please enter valid login credentials");
  } catch (error) {
    console.error(error.message);
    res.status(200).send("Internal Server Error");
  }
});

module.exports = router;
