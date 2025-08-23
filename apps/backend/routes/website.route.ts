import { Router } from "express";
import { prismaClient } from "db/client";
import { verifyToken } from "../middleware";
import { addWebsiteSchema } from "../types";
const router = Router();

router.use(verifyToken);

router.post("/api/v1/addWebsite", async (req, res) => {
  console.log(req.userId);
  const data = addWebsiteSchema.safeParse(req.body);
  if(!data.success) {
    return res.status(400).json({ message: "Invalid data" });
  }
  const { name, url } = data.data;
  const websiteId = await prismaClient.website.create({
    data: {
      name,
      url,
      userId: req.userId!,
      timeAdded: new Date()
    },
  });
  res.status(200).json({ message: "OK", websiteId });
});

router.get("/api/v1/status/:website_id", async(req,res)=>{
    const { website_id } = req.params;
    const website = await prismaClient.website.findUnique({
        where: {
            id: website_id,
            userId: req.userId
        },include:{
          WebsiteTick:{
            orderBy:{
              timeAdded: "desc"
            },take: 1
          }
        }
    })
    if(!website) {
        return res.status(404).json({ message: "Website not found" });
    }
   
    res.status(200).json(website)
})

export default router;