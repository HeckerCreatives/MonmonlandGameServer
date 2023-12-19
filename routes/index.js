const routers = app => {
    console.log("Routers are all available");

    app.use("/auth", require("./Auth"))
}

module.exports = routers