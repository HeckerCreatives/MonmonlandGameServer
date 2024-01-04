const router = require("express").Router()
const { getenergyinventory } = require("../controllers/Energyinventory")
const { protectplayer } = require("../middleware/middleware")

router
    .get("/getenergyinventory", protectplayer, getenergyinventory)

module.exports = router;
