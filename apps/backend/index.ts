import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import websiteRouter from "./routes/website.route";
import userRouter from "./routes/user.route";
const app = express();

app.use(cors({
  origin: "http://localhost:3000", // Your frontend URL
  credentials: true, // Allow cookies to be sent with requests
}));
app.use(cookieParser()); // Parse cookies from requests
app.use(express.json());
app.use(urlencoded({ extended: true }));


app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

app.use(userRouter);
app.use(websiteRouter)

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running on port ${process.env.PORT || 8000}`);
});