const mongoose = require("mongoose");

const chatBoxSchema = mongoose.Schema(
  {
    // Nama chat otomatis disetel menjadi nama pengguna
    chatname: {
      type: String,
      trim: true,
    },
    users: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        unseenMsg: {
          type: Number,
          default: 0,
        },
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "message",
    },
    profilePic: {
      type: String,
      default:
        "https://cdn6.aptoide.com/imgs/1/2/2/1221bc0bdd2354b42b293317ff2adbcf_icon.png",
    },
  },
  {
    timestamps: true,
  }
);

// Membuat model berdasarkan schema single chat
const singleChat = mongoose.model("chat", chatBoxSchema);
module.exports = singleChat;