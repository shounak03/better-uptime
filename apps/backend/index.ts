import express, { urlencoded } from "express";

import websiteRouter from "./routes/website.route";
import userRouter from "./routes/user.route";
const app = express();


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

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});