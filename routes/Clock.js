const router = require("express").Router()
const { getclock, equipclock } = require("../controllers/Clock")
const { protectplayer } = require("../middleware/middleware")

router
    .get("/getclock", protectplayer, getclock)
    .post("/equipclock", protectplayer, equipclock)

module.exports = router;
