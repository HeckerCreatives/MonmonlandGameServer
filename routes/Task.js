const router = require("express").Router()
const { gettaskdata, claimtask } = require("../controllers/Task")
const { protectplayer } = require("../middleware/middleware")

router
    .get("/gettaskdata", protectplayer, gettaskdata)
    .post("/claimtask", protectplayer, claimtask)

module.exports = router;
