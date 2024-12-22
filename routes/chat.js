const express = require("express");
const fetchUser = require("../config/fetchUser");
const router = express.Router();
const chatCont = require("../controller/chatController");
const userCont = require("../controller/userController");

const {
  fetchChat,
  accessChat,
  savemessage,
  fetchMessages,
  countUnseenMssge,
} = chatCont;

router.get("/searchUser", fetchUser, userCont.searchUser);
router.get("/accessChat", fetchUser, accessChat);
router.get("/fetchMessages", fetchUser, fetchMessages);
router.post("/message", fetchUser, savemessage);
router.get("/fetchChats", fetchUser, fetchChat);
router.get("/countMssg", fetchUser, countUnseenMssge);

module.exports = router;
