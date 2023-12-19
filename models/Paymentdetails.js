const mongoose = require("mongoose");

const PaymentdetailsSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        paymentoption: {
            type: String
        },
        paymentmethod: {
            type: String
        },
        currency: {
            type: String
        }
        
    },
    {
        timestamps: true
    }
)

const Paymentdetails = mongoose.model("Paymentdetails", PaymentdetailsSchema);
module.exports = Paymentdetails