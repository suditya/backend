"use strict";
// const mongoose = require("mongoose");
// const connectionStr = "mongodb://0.0.0.0:27017/";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const mongodb_1 = require("mongodb");
const DB_NAME = "Poodi-Sabji-dot-com";
const uri = `mongodb://0.0.0.0:27017/${DB_NAME}`; // Replace with your connection string
const client = new mongodb_1.MongoClient(uri, {});
function connectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.connect();
            console.log("Connected to MongoDB");
        }
        catch (err) {
            console.error(err);
        }
    });
}
connectDB();
