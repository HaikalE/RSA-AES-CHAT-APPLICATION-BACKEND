const chatController = require("../controller/chatController");
const { addCount } = chatController;

module.exports.chatSocket = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: "http://localhost:3000",
    },
  });

  // Setup socket connection
  io.on("connection", (socket) => {
    console.log("connected to socket.io");

    socket.on("setup", (userData) => {
      if (!userData || !userData._id) {
        console.error("Invalid user data:", userData);
        return;
      }
      socket.join(userData._id);
      console.log("user joined", userData.name);
      socket.emit("connected");
    });

    // New message triggered
    socket.on("new_message", (message) => {
      const chat = message.chatId;
      if (!chat || !chat.users) {
        return console.log("chat or chat users not defined");
      }

      chat.users.forEach((members) => {
        if (members.user._id === message.sender._id) return;
        const data = {
          message: message,
          receiverId: members.user._id,
        };
        socket.in(members.user._id).emit("message_recieved", data);
      });

      if (message.removedUserId) {
        const data = {
          message: message,
          receiverId: message.removedUserId,
        };
        socket.in(message.removedUserId).emit("message_recieved", data);
      }
    });

    // Update recent message
    socket.on("update_Chatlist", (message) => {
      const chat = message.chatId;
      if (!chat || !chat.users) {
        return console.log("chat or chat users not defined");
      }

      chat.users.forEach(async (members) => {
        if (members.user._id === message.sender._id) return;
        try {
          const users = await addCount(message.chatId._id, members.user._id);
          const data = {
            message: message,
            users: users,
          };
          socket.in(members.user._id).emit("latest_message", data);
        } catch (error) {
          console.error("Error updating chat list:", error);
        }
      });

      if (message.removedUserId) {
        const data = {
          message: message,
          receiverId: message.removedUserId,
        };
        socket.in(message.removedUserId).emit("latest_message", data);
      }
    });

    // Group creation
    socket.on("group_created", (group) => {
      group.users.forEach((members) => {
        if (members.user._id == group.admin._id) return;
        socket.in(members.user._id).emit("created_group", group);
      });
    });

    // Update user existence in group
    socket.on("member_status", (data) => {
      data.users.forEach((members) => {
        socket.in(members.user).emit("groupRemoved", data);
      });
    });

    // Change group image
    socket.on("changed_groupImage", (data) => {
      data.chat.users.forEach((members) => {
        if (members.user._id == data.logUser._id) return;
        socket.in(members.user._id).emit("toggleImage", data);
      });
    });

    // Change group name
    socket.on("changed_groupName", (data) => {
      data.chat.users.forEach((members) => {
        if (members.user._id == data.logUser._id) return;
        socket.in(members.user._id).emit("toggleName", data);
      });
    });

    // Update users list while removing or adding
    socket.on("change_users", (data) => {
      data.group.users.forEach((members) => {
        if (members.user._id == data.group.admin._id) return;
        socket.in(members.user._id).emit("updateUsers", data);
      });
    });

    // Toggle typing
    socket.on("toggleTyping", (data) => {
      data.chat.users.forEach((members) => {
        if (members.user._id == data.user._id) return;
        socket.in(members.user._id).emit("isTyping", data);
      });
    });
  });
};
