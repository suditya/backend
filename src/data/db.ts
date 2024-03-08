// const mongoose = require("mongoose");
// const connectionStr = "mongodb://0.0.0.0:27017/";

// const DB_NAME = "Poodi-Sabji-dot-com";

// mongoose.connect(connectionStr);

// mongoose.connection.on("error", (error: { message: any }) => {
//   console.error(
//     `could not connect to database ${DB_NAME}, error = `,
//     error.message
//   );
//   process.exit(1);
// });

// mongoose.connection.on("open", function () {
//   console.error(`connected to database ${DB_NAME}`);
// });

import { MongoClient } from "mongodb";
const DB_NAME = "Poodi-Sabji-dot-com";
const uri = `mongodb://0.0.0.0:27017/${DB_NAME}`; // Replace with your connection string
const client = new MongoClient(uri, {});

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(err);
  }
}

connectDB();
