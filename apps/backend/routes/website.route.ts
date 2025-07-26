import { Router } from "express";
import { prismaClient } from "db/client";
import { verifyToken } from "../middleware";
const router = Router();

// router.use(verifyToken);

router.post("/api/v1/addWebsite", async (req, res) => {
  // console.log(user);
  
  const websiteId = await prismaClient.website.create({
    data: {
      name: req.body.name,
      url: req.body.url,
      userId: "eaacbf25-913a-4f7a-affe-ca7468bc34de",
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