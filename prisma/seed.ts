import "dotenv/config";
import { prisma } from "@/lib/prisma";

async function main() {
  const user1 = await prisma.user.create({
    data: {
      name: "Tahir",
      age: 22,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Tayyab",
      age: 14,
    },
  });

  console.log(`Created! \nUser1: ${user1.name} and User2: ${user2.name}`);

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