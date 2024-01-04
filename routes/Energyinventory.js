const router = require("express").Router()
const { getenergyinventory, useenergyinventory } = require("../controllers/Energyinventory")
const { protectplayer } = require("../middleware/middleware")

router
    .get("/getenergyinventory", protectplayer, getenergyinventory)
    .post("/useenergyinventory", protectplayer, useenergyinventory)

module.exports = router;
