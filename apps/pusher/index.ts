import { prismaClient } from "db/client";
import { addWebsites } from "redis-stream/client"

async function main() {

  const websites = await prismaClient.website.findMany({
    select: {
      id: true,
      url: true,
    }
  }
  )

  await addWebsites(websites.map(w => ({
    url: w.url,
    id: w.id
  })))

}

setTimeout(() => { 
  main() 
}, 3 * 60 * 1000);

main();
