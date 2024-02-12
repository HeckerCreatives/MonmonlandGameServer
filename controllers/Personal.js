const Playerdetails = require("../models/Playerdetails")
const Paymentdetails = require("../models/Paymentdetails")
const { default: mongoose } = require("mongoose")
const Gameusers = require("../models/Gameusers")
const Pooldetails = require("../models/Pooldetails")

exports.personalinformation = async (req, res) => {
    const { id } = req.user

    let data = {}

    const player = await Playerdetails.findOne({owner: new mongoose.Types.ObjectId(id)})
    .populate({
        path: "owner",
        select: "username"
    })
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    data["player"] = {
        username: player.owner.username,
        referralid: player.owner._id,
        email: player.email
    }

    const payment = await Paymentdetails.findOne({owner: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    data["payment"] = {
        options: !payment ? "" : payment.paymentoption,
        method: !payment ? "" : payment.paymentmethod,
        currency: !payment ? "" : payment.currency
    }

    res.json({message: "success", data: data})
}

exports.getpearlusers = async (req, res) => {
 
  const pipeline = [
      // Match pooldetails with subscription "Pearl"
      {
        $lookup: {
          from: "pooldetails",
          localField: "_id",
          foreignField: "owner",
          as: "poolDetails",
        },
      },
      {
        $unwind: "$poolDetails",
      },
      {
        $match: {
          "poolDetails.subscription": "Pearl",
        },
      },
      // Project the required fields
      {
        $project: {
          _id: 1,
          username: 1,
          referral: 1,
          subscription: "$poolDetails.subscription",
        },
      },
      // Lookup referral username
      {
          $lookup: {
          from: "gameusers",
          localField: "referral",
          foreignField: "_id",
          as: "referralUser",
          },
      },
      {
          $unwind: "$referralUser"
      },
      // // Lookup Dragonpaymentdetails information
      {
          $lookup: {
          from: "dragonpaymentdetails",
          localField: "_id",
          foreignField: "owner",
          as: "paymentDetails",
          },
      },

      // Unwind to handle cases where there might be multiple payment details
      {
          $unwind: {
              path: "$paymentDetails",
              preserveNullAndEmptyArrays: true, // Preserve data even if there are no payment details
          },
      },
      {
        $lookup: {
          from: "playerdetails",
          localField: "_id",
          foreignField: "owner",
          as: "playerdeets",
          },
      },
      {
        $unwind: {
            path: "$playerdeets",
            preserveNullAndEmptyArrays: true, // Preserve data even if there are no payment details
        },
      },
      // Group by referral ID
      {
          $group: {
          _id: "$referralUser._id",
          leader: { $first: "$referralUser.username" },
          pearls: {
              $push: {
              username: "$username",
              subscription: "$subscription",
              paymentDetails: {
                  firstname: "$paymentDetails.firstname",
                  lastname: "$paymentDetails.lastname",
                  email: "$playerdeets.email",
                  mobilenumber: "$playerdeets.phone",
                  nationality: "$paymentDetails.nationality",
                  address: "$paymentDetails.address",
              },
              },
          },
          },
      },
      {
        $project: {
          _id: 0,
          leader: 1,
          pearls: 1
        }
      }
  ];

  await Gameusers.aggregate(pipeline)
  .then(data => res.json({message: "success", data: data}))
  .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
}