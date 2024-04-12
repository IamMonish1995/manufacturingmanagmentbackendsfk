import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/connectdb.js";
import commonRoutes from "./routes/commonRoutes.js";
import bodyParser from "body-parser";
import path from "path";

const app = express();
const port = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;
// CORS Policy
app.use(cors({ origin: '*' }));

// Database Connection
connectDB(DATABASE_URL);

// JSON
app.use(express.json());

app.use(express.static("public"));

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
//swagger
app.get("/", (req, res) => {
  res.send("working");
});

app.use("/api", commonRoutes);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
