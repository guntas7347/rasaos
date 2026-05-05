import { Role } from "./generated/prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

export async function main() {
  const adminEmail = "guntas7347@gmail.com";

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`Admin with email ${adminEmail} already exists.`);
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      role: Role.ADMIN,
      restaurantId: null,
    },
  });

  console.log(`Successfully created admin: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
