import { Router } from "express";
import { prismaClient } from "db/client";
import { verifyToken } from "../middleware";
const router = Router();

router.use(verifyToken);

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
    const website = await prismaClient.website.findUnique({
        where: {
            id
        }
    })
    res.status(200).json(website)
})

export default router;