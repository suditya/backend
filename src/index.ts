import { Request, Response } from "express";

require("./data/db");
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import { MongoClient } from "mongodb";
import { IUser } from "../interfaces/User";
import { validateCredentials } from "./services/validation";

const DB_NAME = "Poodi-Sabji-dot-com";
const uri = `mongodb://0.0.0.0:27017/${DB_NAME}`;
const client = new MongoClient(uri, {});
const db = client.db(DB_NAME);
const usersColl = db.collection("users");
dotenv.config();

const app = express();
// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
app.use(cors());
// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

const port = 3000;

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello World From Nodejs Server And Typescript");
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await usersColl.findOne<IUser>({
    email: email,
  });
  console.log(user);
  if (user) {
    const isEqual = await bcrypt.compare(password, user.password);
    if (isEqual) {
      res.status(200).send({ message: "Login successfull" });
    } else {
      res.status(400).send({ message: "InvalidPassword" });
    }
  } else {
    res.status(401).send({ message: "User does not exists!" });
  }
});

app.post("/api/register", async (req, res) => {
  console.log("got the request", req.body);
  const { email, password } = req.body as { email: string; password: string };
  const validationErrors = validateCredentials(email, password);
  if (validationErrors) {
    return res
      .status(400)
      .send({ message: "Validation error : " + validationErrors });
  } else {
    try {
      const existingUser = await usersColl.findOne({ email: email });
      if (existingUser) {
        console.log(existingUser);
        // throw new Error("Email already exists");
        return res.status(400).json({ message: "Email already exists" });
      }

      const salt = 10;
      const hashedPassword = await bcrypt.hash(password, salt);
      // const user = new User({ email, hashedPassword });
      console.log(hashedPassword);
      const document = { email, password: hashedPassword } as IUser;
      const result = await usersColl.insertOne(document);

      // JWT token creation
      const token = jwt.sign({ email, password }, "suditya_gupta", {
        expiresIn: "4h",
      });

      // Send back as a cookie
      return res
        .status(200)
        .cookie("token", token, { httpOnly: true })
        .json({ message: "User created successfully!", result: result });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error due to: " + error,
      });
    }
  }
});

app.listen(port, () => {
  console.log("backend listening on port : " + port);
});
