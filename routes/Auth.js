const router = require("express").Router()
const { authlogin } = require("../controllers/Auth")
const { protectplayer } = require("../middleware/middleware")

router
    .get("/login", protectplayer, authlogin)


module.exports = router;
