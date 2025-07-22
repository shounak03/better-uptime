import { createClient } from "redis";

export const redisClient = createClient().on("error", (err) => console.log("Redis Client Error", err)).connect();

type WebsiteEvent = {
    id: string;
    url: string; 
}

async function xAdd({url,id}: WebsiteEvent) {
    (await redisClient).xAdd(
        "betteruptime:website","*",{
            id:id,url:url
        }
    )
}
export async function addWebsites(websites:WebsiteEvent[]) {
    for (const website of websites) {
        await xAdd({ id: website.id, url: website.url });
    }
}



