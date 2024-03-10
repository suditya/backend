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
import PDFDocument from "pdfkit";
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

// app.get("/api/generate-pdf", (req, res) => {
//   // Create a new PDF document
//   const doc = new PDFDocument({ margin: 50 });

//   // Set response headers for PDF
//   res.setHeader("Content-Type", "application/pdf");
//   res.setHeader("Content-Disposition", "inline; filename=bill.pdf");

//   // Example: Add your company logo

//   // doc.image(
//   //   "/home/sudityagupta/Documents/Poodi-Sabji-dot-com/backend/src/assets/5528439.jpg",
//   //   50,
//   //   50,
//   //   { width: 100 }
//   // );

//   doc
//     .image("logo.png", 50, 45, { width: 50 })
//     .fillColor("#444444")
//     .fontSize(20)
//     .text("ACME Inc.", 110, 57)
//     .fontSize(10)
//     .text("123 Main Street", 200, 65, { align: "right" })
//     .text("New York, NY, 10025", 200, 80, { align: "right" })
//     .moveDown();

//   // Move down for spacing
//   doc.moveDown(5);

//   // Add billing information
//   doc
//     .fontSize(18)
//     .text("Billing Information", { align: "center" })
//     .moveDown(0.5);

//   // Example: Add dummy billing data
//   doc.fontSize(12).text("Invoice Date: 2024-03-01", { align: "left" });
//   doc.text("Due Date: 2024-03-15", { align: "left" });
//   doc.text("Invoice Number: INV-123456", { align: "left" });

//   // Add a table for itemized billing
//   const items = [
//     { description: "Product 1", quantity: 2, price: 50 },
//     { description: "Product 2", quantity: 1, price: 30 },
//     // Add more items as needed
//   ];

//   doc.moveDown(2);
//   doc.fontSize(14).text("Itemized Billing:", { align: "left" }).moveDown(0.5);

//   // Table headers
//   doc.fontSize(12).text("Description", 50, doc.y);
//   doc.text("Quantity", 250, doc.y);
//   doc.text("Price", 350, doc.y);

//   // Table rows
//   items.forEach((item) => {
//     doc.moveDown(0.5);
//     doc.fontSize(12).text(item.description, 50, doc.y);
//     doc.text(item.quantity.toString(), 250, doc.y);
//     doc.text("$" + (item.quantity * item.price).toFixed(2), 350, doc.y);
//   });

//   // Calculate total
//   const total = items.reduce(
//     (sum, item) => sum + item.quantity * item.price,
//     0
//   );

//   doc.moveDown(2);
//   doc.fontSize(14).text("Total: $" + total.toFixed(2), { align: "left" });

//   // Pipe the PDF to the response
//   doc.pipe(res);
//   doc.end();
// });

import * as fs from "fs";
// import * as PDFDocument from "pdfkit";

interface InvoiceItem {
  item: string;
  description: string;
  quantity: number;
  amountSum: number;
}

interface Client {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pricePerSession: number;
}

interface Invoice {
  invoiceNumber: string;
  client: Client;
  items: InvoiceItem[];
  subtotal: number;
  paid: number;
}

function generateBillPdf(bill: Invoice, path: string) {
  let doc = new PDFDocument({ size: "A4", margin: 50 });

  generateHeader(doc);
  generateCustomerInformation(doc, bill);
  generateInvoiceTable(doc, bill);
  // generateFooter(doc);

  doc.end();
  doc.pipe(fs.createWriteStream(path));
}

function generateHeader(doc: PDFKit.PDFDocument) {
  doc
    .image(
      "/home/sudityagupta/Documents/Poodi-Sabji-dot-com/backend/src/assets/5528439.jpg",
      50,
      45,
      { width: 50 }
    )
    .fillColor("#444444")
    .fontSize(20)
    .text("Poodi Sabji dot-com", 110, 57)
    .fontSize(10)
    .text("Lives in your heart and tummy", 200, 65, { align: "right" })
    .text("Tummy", 200, 80, { align: "right" })
    .moveDown();
}

function generateCustomerInformation(doc: PDFKit.PDFDocument, bill: Invoice) {
  doc.fillColor("#444444").fontSize(20).text("Bill", 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text("Bill no:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(bill.invoiceNumber, 150, customerInformationTop)
    .font("Helvetica")
    .text("Bill Date:", 50, customerInformationTop + 15)
    .text(formatDate(new Date()), 150, customerInformationTop + 15)

    .font("Helvetica-Bold")
    .text(bill.client.name, 300, customerInformationTop)
    .font("Helvetica")
    .text(bill.client.address, 300, customerInformationTop + 15)
    .text(
      bill.client.city + ", " + bill.client.state + ", " + bill.client.country,
      300,
      customerInformationTop + 30
    )
    .moveDown();

  generateHr(doc, 252);
}

const generateInvoiceTable = (doc: PDFKit.PDFDocument, bill: Invoice) => {
  let i;
  const invoiceTableTop = 330;
  const { client } = bill;
  const { pricePerSession } = client;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Item",
    "Description",
    "Unit Cost",
    "Quantity",
    "Line Total"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  for (i = 0; i < bill.items.length; i++) {
    const item = bill.items[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.item,
      item.description,
      formatCurrency(pricePerSession),
      item.quantity,
      formatCurrency(item.amountSum)
    );

    generateHr(doc, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "Subtotal",
    "",
    formatCurrency(bill.subtotal)
  );

  const paidToDatePosition = subtotalPosition + 20;
  generateTableRow(
    doc,
    paidToDatePosition,
    "",
    "",
    "Paid To Date",
    "",
    formatCurrency(bill.paid)
  );
  doc.font("Helvetica");
};

function generateTableRow(
  doc: PDFKit.PDFDocument,
  y: number,
  item: string,
  description: string,
  unitCost: string,
  quantity: number | string,
  lineTotal: string
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 150, y)
    .text(unitCost, 280, y, { width: 90, align: "right" })
    .text(quantity.toString(), 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc: PDFKit.PDFDocument, y: number) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

function formatCurrency(val: number) {
  return "€" + val.toFixed(2);
}

function formatDate(date: Date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + "/" + month + "/" + day;
}

// Generate dummy data
const dummyClient: Client = {
  name: "John Doe",
  address: "123 Main St",
  city: "Anytown",
  state: "CA",
  country: "USA",
  pricePerSession: 50,
};

const dummyItems: InvoiceItem[] = [
  { item: "1", description: "Product A", quantity: 2, amountSum: 100 },
  { item: "2", description: "Product B", quantity: 1, amountSum: 50 },
];

const dummyInvoice: Invoice = {
  invoiceNumber: "INV-123456",
  client: dummyClient,
  items: dummyItems,
  subtotal: 150,
  paid: 50,
};

app.get("/api/generate-pdf", async (_req, res) => {
  const bill = dummyInvoice;
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  generateHeader(doc);
  generateCustomerInformation(doc, bill);
  generateInvoiceTable(doc, bill);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline; filename=bill.pdf");
  doc.pipe(res);
  doc.end();
});

// export { generateBillPdf, Invoice, InvoiceItem, Client };

app.listen(port, () => {
  console.log("backend listening on port : " + port);
});
