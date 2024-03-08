"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./data/db");
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongodb_1 = require("mongodb");
const validation_1 = require("./services/validation");
const DB_NAME = "Poodi-Sabji-dot-com";
const uri = `mongodb://0.0.0.0:27017/${DB_NAME}`;
const client = new mongodb_1.MongoClient(uri, {});
const db = client.db(DB_NAME);
const usersColl = db.collection("users");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware to parse JSON bodies
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Middleware to parse URL-encoded bodies
app.use(express_1.default.urlencoded({ extended: true }));
const port = 3000;
app.get("/", (_req, res) => {
    res.send("Hello World From Nodejs Server And Typescript");
});
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield usersColl.findOne({
        email: email,
    });
    console.log(user);
    if (user) {
        const isEqual = yield bcryptjs_1.default.compare(password, user.password);
        if (isEqual) {
            res.status(200).send({ message: "Login successfull" });
        }
        else {
            res.status(400).send({ message: "InvalidPassword" });
        }
    }
    else {
        res.status(401).send({ message: "User does not exists!" });
    }
}));
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const validationErrors = (0, validation_1.validateCredentials)(email, password);
    if (validationErrors) {
        res.send({ message: "Validation error : " + validationErrors }).status(400);
    }
    else {
        try {
            const existingUser = yield usersColl.findOne({ email: email });
            if (existingUser) {
                console.log(existingUser);
                throw new Error("Email already exists");
            }
            const salt = 10;
            const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
            // const user = new User({ email, hashedPassword });
            console.log(hashedPassword);
            const document = { email, password: hashedPassword };
            const result = yield usersColl.insertOne(document);
            // JWT token creation
            const token = jsonwebtoken_1.default.sign({ email, password }, "suditya_gupta", {
                expiresIn: "4h",
            });
            // Send back as a cookie
            res
                .status(200)
                .cookie("token", token, { httpOnly: true })
                .json({ message: "User created successfully!", result: result });
        }
        catch (error) {
            console.log(error);
            res
                .status(500)
                .json({ message: "Internal Server Error due to: " + error });
        }
    }
}));
app.listen(port, () => {
    console.log("backend listening on port : " + port);
});
