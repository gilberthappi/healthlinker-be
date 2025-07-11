import { hashSync } from "bcrypt";
import { permissions, roles } from "../../src/utils/roles";
import { prisma } from "../../src/utils/client";

async function main() {
  try {
    console.log("SEEDING");
    const developer = await prisma.user.create({
      data: {
        email: "developer@gmail.com",
        firstName: "IRU ",
        lastName: "Developer",
        password: hashSync("Password123!", 10),
      },
    });
    await prisma.userRole.create({
      data: {
        userId: developer.id,
        name: roles.DEVELOPER,
        permission: [permissions.ALL],
      },
    });
    const admin = await prisma.user.create({
      data: {
        email: "admin@gmail.com",
        firstName: "IRU ",
        lastName: "Admin",
        password: hashSync("Password123!", 10),
      },
    });
    await prisma.userRole.create({
      data: {
        userId: admin.id,
        name: roles.ADMIN,
        permission: [permissions.ALL],
      },
    });
    console.log("SEEDING COMPLETE");
  } catch (error) {
    console.log("SEEDING FAILED", error);
  }
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
