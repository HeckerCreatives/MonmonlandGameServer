const { Tasksdataupdate, TaskGameUnlockUpdate, AddMissingTaskToUser, addsupermonmonuserdata, addpalosebodata, recomputemg,dailylimtads } = require("./dataupdate/Newdataupdate")

async function datadd() {
    // await addsupermonmonuserdata()
    await dailylimtads()
}

datadd()