import "dotenv/config";
import { prisma } from "@/lib/prisma";

async function main() {
  const setting = await prisma.settings.create({
    data: {
      ownerId: "owner_seed_1",
      businessName: "Acme Corp",
      supportEmail: "support@acme.com",
      knowledge: "We provide 24/7 customer support.",
    },
  });

  console.log(`Created! Settings for: ${setting.businessName}`);

  await prisma.settings.delete({ where: { id: setting.id } });
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