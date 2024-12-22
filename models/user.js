const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  rsaPublic: {
    type: String,
    required: true,  // Tambahkan field RSA public key
  },
  rsaEncryptedPrivateKey: {
    type: String,
    required: true,  // Tambahkan field RSA encrypted private key
  },
});

const User = mongoose.model("user", userSchema);

module.exports = User;


// const mongoose = require("mongoose");

// const userSchema = mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//     unique: true,
//     required: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   avtar: {
//     type: String,
//     default: "https://aui.atlassian.com/aui/8.8/docs/images/avatar-person.svg",
//   },
//   salt: {
//     type: String,
//     required: true,
//   },
//   rsaPublic: {
//     type: String,
//     required: true,  // Tambahkan field RSA public key
//   },
//   rsaEncryptedPrivateKey: {
//     type: String,
//     required: true,  // Tambahkan field RSA encrypted private key
//   },
// });

// const User = mongoose.model("user", userSchema);

// module.exports = User;
