const router = require("express").Router()
const { getdailyactivities, claimdaily } = require("../controllers/Dailyactivities")
const { protectplayer } = require("../middleware/middleware")

router
    .get("/getdailyactivities", protectplayer, getdailyactivities)
    .post("/claimdaily", protectplayer, claimdaily)

module.exports = router;
