module.exports.accessChat = async (req, res) => {
    try {
      const { userTwo } = req.query;
      console.log("User two ID received:", userTwo);
  
      // Finding the chat
      let isChat = await Chat.find({
        $and: [
          { users: { $elemMatch: { User: ObjectId(userTwo) } } },
          { users: { $elemMatch: { User: ObjectId(req.User) } } },
        ],
      })
        .populate({
          path: "users",
          populate: {
            path: "User",
            ref: "User",
          },
        })
        .populate({
          path: "latestMessage",
          ref: "message",
          populate: {
            path: "sender",
            ref: "User",
            select: "name,email,avtar",
          },
        });
  
      if (isChat.length > 0) {
        console.log("Chat found between users:", JSON.stringify(isChat, null, 2));
  
        // Check and reset unseen messages for the requesting User
        isChat[0].users.forEach((member, index) => {
          if (!member.User) {
            console.warn(`User object at index ${index} is null.`);
          } else {
            let memberId = member.User._id.toString();
            if (memberId === req.User) {
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
          users: [{ User: req.User }, { User: userTwo }],
        });
  
        console.log("New chat created with ID:", chat._id);
  
        // Populating the new chat with User details
        let fullChat = await Chat.findById(chat._id).populate({
          path: "users",
          populate: {
            path: "User",
            ref: "User",
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