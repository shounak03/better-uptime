import express from "express";
import userRouter from "./routes";
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

app.use(userRouter);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});