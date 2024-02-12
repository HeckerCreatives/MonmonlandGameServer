const router = require("express").Router()
const { personalinformation, getpearlusers } = require("../controllers/Personal")
const { protectplayer } = require("../middleware/middleware")

router
    .get("/personalinformation", protectplayer, personalinformation)
    .get("/getpearlusers", getpearlusers)

module.exports = router;
