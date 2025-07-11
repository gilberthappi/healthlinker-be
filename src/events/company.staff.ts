import { permissions, roles } from "../utils/roles";
import { prisma } from "../utils/client";

import { CreateCompanyStaffDto, TUser } from "../utils/interfaces/common";

export const companyStaffCreatedHandler = async (
  user: TUser,
  data: CreateCompanyStaffDto,
) => {
  try {
    await prisma.$transaction(async (tx) => {
      const assignRole = await tx.userRole.create({
        data: {
          userId: user?.id,
          name: roles.COMPANY_USER,
          permission: [permissions.DEFAULT],
        },
      });

      if (!assignRole) {
        throw new Error("Failed to assign role to company user");
      }

      await tx.companyUser.create({
        data: {
          companyId: data.companyId!,
          userId: user?.id,
          phoneNumber: data.phoneNumber,
          title: data.title,
          role: data.role,
          idNumber: data.idNumber,
          idAttachment: data.idAttachment as string,
        },
      });
    });
  } catch (error) {
    prisma.$disconnect();
  }
};

export const companyStaffUpdateHandler = async (
  user: TUser,
  data: CreateCompanyStaffDto,
) => {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.companyUser.update({
        where: { companyId: data?.companyId, userId: user?.id },
        data: {
          companyId: data.companyId!,
          userId: user?.id,
          phoneNumber: data.phoneNumber,
          title: data.title,
          role: data.role,
          idNumber: data.idNumber,
          idAttachment: data.idAttachment as string,
        },
      });
    });
  } catch (error) {
    prisma.$disconnect();
  }
};
