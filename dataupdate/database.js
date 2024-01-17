const { MongoClient } = require('mongodb');
require("dotenv").config();

let client;

exports.connecttodatabase = async() => {
    client = new MongoClient(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });

    await client.connect();
    console.log("connected to MongoDB");

    return client;
}

exports.closedatabase = async() => {
    await client.close();
    console.log("disconnected to MongoDB");
}