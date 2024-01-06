exports.checkenergyinventoryprice = (itemtype) => {
    let itemamount = 0;

    switch(itemtype){
        case "1energy":
            itemamount = 1
            break;
        case "2energy":
            itemaount = 3
            break;
        case "3energy":
            itemamount = 6
            break;
        case "4energy":
            itemamount = 10
            break;
        case "5energy":
            itemamount = 25
            break
        default:
            itemamount = 0;
            break;
    }

    return itemamount
}

exports.checkenergyinventoryconsumable = (itemtype) => {
    let itemamount = 0;

    switch(itemtype){
        case "1energy":
            itemamount = 1
            break;
        case "2energy":
            itemaount = 5
            break;
        case "3energy":
            itemamount = 10
            break;
        case "4energy":
            itemamount = 20
            break;
        case "5energy":
            itemamount = 50
            break
        default:
            itemamount = 0;
            break;
    }

    return itemamount
}