/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../utils/client";
import AppError, { ValidationError } from "../utils/error";
import type { CreateCompanyStaffDto } from "../utils/interfaces/common";
import { IResponse } from "../utils/interfaces/common";
import { roles } from "../utils/roles";
import type { Request } from "express";
import { companyStaffValidations } from "./../varifications/companyStaff";
import { hashSync } from "bcrypt";

import { Emitter } from "../events";
import { EventType } from "../events/types";

export class CompanyStaffService {
  public static async getStaff(req: Request) {
    const requestingUser = await prisma.companyUser.findFirst({
      where: {
        userId: req.user?.company?.companyId,
      },
    });

    const selection = {
      user: {
        select: { email: true, id: true, lastName: true, firstName: true },
      },
    };
    const companyUser = req.user?.roles?.some(
      (role) => role.role === roles.ADMIN,
    )
      ? await prisma.companyUser.findMany({
          include: selection,
        })
      : await prisma.companyUser.findMany({
          where: {
            companyId: requestingUser?.companyId,
          },
          include: selection,
        });

    if (!companyUser) {
      throw new AppError("Company does not exist or has no staff members", 400);
    }

    const staff = companyUser.map((staff) => staff.user);
    return {
      data: staff,
      statusCode: 200,
      message: "staff members retrieved successfully",
    };
  }

  public static async getCompanyStaff(id: string) {
    const staffInfo = await prisma.companyUser.findUnique({
      where: { userId: id },
      include: {
        user: true,
      },
    });
    const response = {
      id: staffInfo!.id,
      firstName: staffInfo!.user.firstName,
      lastName: staffInfo!.user.lastName,
      email: staffInfo!.user.email,
      phoneNumber: staffInfo!.phoneNumber,
      title: staffInfo!.title,
      role: staffInfo!.role,
      idNumber: staffInfo!.idNumber,
      idAttachment: staffInfo!.idAttachment,
    };
    return {
      message: "company fetched successfully",
      statusCode: 200,
      data: response,
    };
  }

  public static async getAllMyStaff(req: Request) {
    const requestingUser = await prisma.companyUser.findFirst({
      where: {
        userId: req.user?.id,
      },
      include: {
        company: true,
      },
    });

    if (!requestingUser || !requestingUser.company) {
      throw new AppError(
        "Company does not exist or you do not have access",
        400,
      );
    }

    const companyId = requestingUser.company.id;

    const companyUsers = await prisma.companyUser.findMany({
      where: {
        companyId: companyId,
      },
      include: {
        user: {
          select: {
            email: true,
            id: true,
            firstName: true,
            lastName: true,
            roles: true,
          },
        },
      },
    });

    if (companyUsers.length === 0) {
      throw new AppError("No staff members found for your company", 404);
    }

    const staff = companyUsers.map((companyUser) => ({
      id: companyUser.user.id,
      firstName: companyUser.user.firstName,
      lastName: companyUser.user.lastName,
      email: companyUser.user.email,
      role: companyUser.user.roles.map((role) => role.role).join(", "),
    }));

    return {
      data: staff,
      statusCode: 200,
      message: "Staff members retrieved successfully",
    };
  }
  public static async getCompanyStaffCountByMonth(
    companyId: string,
    year: number,
  ): Promise<IResponse<any>> {
    try {
      const companyStaff = await prisma.companyUser.findMany({
        where: {
          companyId: companyId,
          createdAt: {
            gte: new Date(`${year}-01-01`),
            lt: new Date(`${year + 1}-01-01`),
          },
        },
        select: {
          createdAt: true,
        },
      });

      const staffByMonth = Array(12).fill(0);

      companyStaff.forEach((staff) => {
        const month = new Date(staff.createdAt).getMonth();
        staffByMonth[month]++;
      });

      return {
        message: "Company staff count by month fetched successfully",
        statusCode: 200,
        data: staffByMonth,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }
  static async createCompanyStaff(data: CreateCompanyStaffDto) {
    const errors = await companyStaffValidations.onCreate(data);
    if (errors[0]) {
      throw new ValidationError(errors);
    }
    const userInfo = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashSync("Pa$$word1", 10),
        roles: {
          create: {
            role: data.role,
          },
        },
      },
      include: {
        roles: true,
      },
    });

    // Create the company user entry
    await prisma.companyUser.create({
      data: {
        companyId: data.companyId!,
        userId: userInfo.id,
        title: data.title ?? "N/A",
        role: data.role,
        phoneNumber: data.phoneNumber ?? "N/A",
        idNumber: data.idNumber ?? "N/A",
        idAttachment:
          typeof data.idAttachment === "string" ? data.idAttachment : undefined,
      },
    });

    Emitter.emit(EventType.COMPANY_STAFF_CREATED, userInfo, data);
    return userInfo;
  }

  public static async updateCompanyStaff(
    id: string,
    data: CreateCompanyStaffDto,
  ) {
    try {
      const updatedCompanyStaff = await prisma.user.update({
        where: { id: id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        },
      });

      Emitter.emit(EventType.COMPANY_STAFF_UPDATED, updatedCompanyStaff, data);

      return {
        message: "Company staff updated successfully",
        statusCode: 200,
        data: updatedCompanyStaff,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async deleteCompanyStaff(id: string) {
    try {
      // Delete the company user entry
      await prisma.companyUser.delete({
        where: { userId: id },
      });

      // Delete the user entry
      const deletedUser = await prisma.user.delete({
        where: { id },
      });

      Emitter.emit(EventType.COMPANY_STAFF_DELETED, deletedUser);

      return {
        message: "Company staff member deleted successfully",
        statusCode: 200,
        data: deletedUser,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }
}
