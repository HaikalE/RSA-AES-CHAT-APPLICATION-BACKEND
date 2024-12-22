const mongoose = require("mongoose");
const mongooseDateFormat = require("mongoose-date-format");

const messageSchema = mongoose.Schema(
  {
    content: { type: String, required: true },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chat",
    },
    encryptedAesKey: { type: String, required: true }, // New field for encrypted AES key
  },
  {
    timestamps: true,
  }
);

messageSchema.plugin(mongooseDateFormat);
const message = mongoose.model("message", messageSchema);
module.exports = message;
