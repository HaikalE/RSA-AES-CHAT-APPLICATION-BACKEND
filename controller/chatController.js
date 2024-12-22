const Chat = require("../models/chat-box");
const ObjectId = require("bson-objectid");
const Message = require("../models/message");
const user = require("../models/user");
var mongoose = require("mongoose");

//saving new message in database  //

module.exports.savemessage = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("user ID:", req.user);

    const { content, chatId, encryptedAesKey } = req.body;

    if (!content || !chatId || !encryptedAesKey) {
      return res.status(400).send("Invalid data. Content, chatId, and encryptedAesKey are required.");
    }

    // Create a new message with encrypted AES key
    let message = await Message.create({
      content,
      sender: req.user,
      chatId,
      encryptedAesKey,
    });

    // Enable 'noty' if it is an announcement message
    if (req.body.noty) {
      message.noty = true;
      await message.save();
    }

    // Update chat with the latest message
    let chat = await Chat.findById(chatId);
    chat.latestMessage = message._id;

    // Increment unseen message count for all users except the sender
    chat.users.forEach((user) => {
      if (user.user.toString() !== req.user.toString()) {
        user.unseenMsg += 1;
      }
    });
    await chat.save();

    // Populate the message with sender and chat details
    let detailedMessage = await Message.findById(message._id)
      .populate("sender", "-password")
      .populate({
        path: "chatId",
        populate: {
          path: "users",
          populate: {
            path: "user",
          },
        },
      });

    console.log("Message successfully saved:", detailedMessage);
    return res.send(detailedMessage);
  } catch (error) {
    console.error("Error in saving messages", error.message);
    res.status(500).send("Internal Server Error");
  }
};


// fetch previous messages of chat //

module.exports.fetchMessages = async (req, res) => {
  try {
    const { Id } = req.query;
    let chatId = mongoose.Types.ObjectId(Id);
    let detailedMessage = await Message.find({ chatId: chatId }).populate(
      "sender",
      "-password"
    );
    return res.send(detailedMessage);
  } catch (error) {
    console.error("error in fetching messages", error.message);
    res.status(400).send("Internal Server Error");
  }
};

// fetch recent chats list  //

module.exports.fetchChat = async (req, res) => {
  try {
    let chats = await Chat.find({
      users: { $elemMatch: { user: ObjectId(req.user) } },
    })
      .populate({
        path: "users",
        populate: {
          path: "user",
        },
      })
      .populate({
        path: "latestMessage",
        ref: "message",
        populate: {
          path: "sender",
        },
      })
      .sort("-updatedAt");

    return res.send(chats);
  } catch (error) {
    console.error("error in fetching recent chats", error.message);
    res.status(500).send("Internal Server Error");
  }
};


// to fetch single chat //

module.exports.accessChat = async (req, res) => {
  try {
    const { userTwo } = req.query;
    console.log("user two ID received:", userTwo);

    // Finding the chat
    let isChat = await Chat.find({
      $and: [
        { users: { $elemMatch: { user: ObjectId(userTwo) } } },
        { users: { $elemMatch: { user: ObjectId(req.user) } } },
      ],
    })
      .populate({
        path: "users",
        populate: {
          path: "user",
          ref: "user",
        },
      })
      .populate({
        path: "latestMessage",
        ref: "message",
        populate: {
          path: "sender",
          ref: "user",
          select: "name,email,avtar",
        },
      });

    if (isChat.length > 0) {
      console.log("Chat found between users:", JSON.stringify(isChat, null, 2));

      // Check and reset unseen messages for the requesting user
      isChat[0].users.forEach((member, index) => {
        if (!member.user) {
          console.warn(`user object at index ${index} is null.`);
        } else {
          let memberId = member.user._id.toString();
          if (memberId === req.user) {
            member.unseenMsg = 0;
          }
        }
      });

      // Save updated chat
      await isChat[0].save();
      console.log("Updated chat with reset unseen messages:", isChat[0]);

      return res.send(isChat[0]);
    } else {
      console.log("No existing chat found, creating a new chat");

      // Creating a new chat
      let chat = await Chat.create({
        users: [{ user: req.user }, { user: userTwo }],
      });
      console.log("ID USER GW ",req.user);
      console.log("New chat created with ID:", chat._id);

      // Populating the new chat with user details
      let fullChat = await Chat.findById(chat._id).populate({
        path: "users",
        populate: {
          path: "user",
          ref: "user",
        },
      });

      console.log("Full chat after population:", fullChat);

      await fullChat.save();

      return res.send(fullChat);
    }
  } catch (error) {
    console.error("Error in accessing chat:", error.message);
    return res.status(500).send("Internal Server Error");
  }
};















// to update count of unseen messages //

module.exports.countUnseenMssge = async (req, res) => {
  try {
    const { chatId, userId } = req.query;
    if (!chatId || !userId) {
      return res.status(400).send("chatId and userId are required");
    }

    let chat = await Chat.findById(chatId).populate({
      path: "users",
      populate: { path: "user" },
    });

    if (!chat) {
      return res.status(404).send("Chat not found");
    }

    let userFound = false;
    chat.users.forEach((members) => {
      if (members.user._id.toString() === userId) {
        members.unseenMsg = 0;
        userFound = true;
      }
    });

    if (!userFound) {
      return res.status(404).send("User not part of the chat");
    }

    await chat.save();
    return res.status(200).send("Unseen message count reset successfully");
  } catch (error) {
    console.error("Error in countUnseenMssge function:", error.message);
    res.status(500).send("Internal Server Error");
  }
};



//to add count of unseen messages //

module.exports.addCount = async (chatId, userId) => {
  try {
    let chat = await Chat.findById(chatId).populate({
      path: "users",
      populate: {
        path: "user",
      },
    });

    chat.users.map((members) => {
      if (members.user._id == userId) {
        members.unseenMsg = members.unseenMsg + 1;
      }
    });

    await chat.save();
    return chat.users;
  } catch (error) {
    console.error(error.message);
  }
};


