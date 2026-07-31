import "dotenv/config";
import { prisma } from "@/lib/prisma";

async function main() {
  const user1 = await prisma.user.create({
    data: {
      name: "Tahir",
      userEmail: "tahir@abc.com"
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Tayyab",
      userEmail: "tayyab@abc.com"
    },
  });

  console.log(`Created! \nUser1: ${user1.name} and User2: ${user2.name}`);

  // Delete everything now
  await prisma.user.deleteMany({
    where: {
        name:{
            in: [user1.name, user2.name]
        }
    }
  });
  console.log("Deleted!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });