const router = require("express").Router()
const { personalinformation } = require("../controllers/Personal")
const { protectplayer } = require("../middleware/middleware")

router
    .get("/personalinformation", protectplayer, personalinformation)

module.exports = router;
