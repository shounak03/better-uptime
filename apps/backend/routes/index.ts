import { Router } from "express";

const router = Router();

router.get("/api/v1/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

export default router;