const routers = app => {
    console.log("Routers are all available");

    app.use("/auth", require("./Auth"))
    app.use("/dashboard", require("./Dashboard"))
    app.use("/personal", require("./Personal"))
    app.use("/tools", require("./Tools"))
    app.use("/clocks", require("./Clock"))
    app.use("/cosmetics", require("./Cosmetics"))
    app.use("/energy", require("./Energy"))
    app.use("/energyinventory", require("./Energyinventory"))
    app.use("/subscriptionshop", require("./Subscription"))
    app.use("/gameplay", require("./Gameplay"))
    app.use("/dailyactivities", require("./Dailyactivities"))
    app.use("/gameannouncement", require("./Gameannouncement"))
    app.use("/ads", require("./Ads"))
    app.use("/task", require("./Task"))
    app.use("/Profilepictureuploads", require('./Profilepicture'))
}

module.exports = routers