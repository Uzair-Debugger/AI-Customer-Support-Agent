require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env'),
  debug: true
});

const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../src/generated/prisma/client');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL }),
});

async function getOwnerDetails(ownerId:string) {
  const owner = await prisma.settings.findUnique({
    where: { ownerId },
  });
  console.log(owner);
  await prisma.$disconnect();
}

getOwnerDetails('usp_137195521990197506');
