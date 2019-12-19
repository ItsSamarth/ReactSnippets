const express = require("express");
const router = express.Router();
const AuthenticationController = require('../controller/authentication');

//LOGIN USER
router.post("/login", AuthenticationController.user_login);

module.exports = router;