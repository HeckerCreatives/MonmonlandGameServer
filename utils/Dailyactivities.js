exports.getavailabledailyactivities = (substype, activitytype) => {
    const activitiesrank = {
        Pearl: {
            1: "play"
        },
        Pearlplus: {
            1: "play"
        },
        Ruby: {
            1: "play",
            2: "play"
        },
        Emerald: {
            1: "play",
            2: "play",
            3: "play"
        },
        Diamond: {
            1: "play",
            2: "play",
            3: "play",
            4: "play",
            5: "play"
        }
    }

    return (activitiesrank[substype] && activitiesrank[substype][activitytype] || "notplay")
}