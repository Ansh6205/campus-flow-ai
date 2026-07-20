import dotenv from "dotenv";

dotenv.config();

import { prisma } from "./lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  const facultyPassword = await bcrypt.hash("Faculty@123", 10);
  const adminPassword = await bcrypt.hash("Admin@123", 10);

  // Create or update Faculty account
  await prisma.user.upsert({
    where: {
      email: "faculty@test.com",
    },
    update: {
      role: "FACULTY",
      passwordHash: facultyPassword,
    },
    create: {
      name: "Test Faculty",
      email: "faculty@test.com",
      passwordHash: facultyPassword,
      role: "FACULTY",
    },
  });

  // Create or update Admin account
  await prisma.user.upsert({
    where: {
      email: "admin@test.com",
    },
    update: {
      role: "ADMIN",
      passwordHash: adminPassword,
    },
    create: {
      name: "Test Admin",
      email: "admin@test.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  console.log("");
  console.log("✅ Test Faculty account created/updated");
  console.log("Email: faculty@test.com");
  console.log("Password: Faculty@123");

  console.log("");

  console.log("✅ Test Admin account created/updated");
  console.log("Email: admin@test.com");
  console.log("Password: Admin@123");
}

main()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });