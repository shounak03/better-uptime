import { Router } from "express";
import { prismaClient } from "db/client";
const router = Router();

router.post("/api/v1/addWebsite", async (req, res) => {
  const websiteId = await prismaClient.website.create({
    data: {
      name: req.body.name,
      url: req.body.url,
      userId: req.body.userId,
    },
  });
  res.status(200).json({ message: "OK", websiteId });
});

router.get("/api/v1/website/:id", async(req,res)=>{
    const { id } = req.params;
    res.send(`hey there ${id}`)
    // res.status(200).json({ message: "OK" });
})

export default router;