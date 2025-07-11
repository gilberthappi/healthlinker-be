/* eslint-disable @typescript-eslint/no-explicit-any */
import { companyValidations } from "./../varifications/company";
import { Emitter } from "../events";
import { EventType } from "../events/types";

import { prisma } from "../utils/client";
import AppError, { ValidationError } from "../utils/error";
import {
  CreateCompanyDto,
  IResponse,
  TCompany,
} from "../utils/interfaces/common";
import { roles } from "../utils/roles";

export class companyService {
  public static async getCompanies() {
    try {
      const companies = await prisma.company.findMany({
        include: {
          CompanyUser: {
            where: {
              user: {
                userRoles: {
                  some: {
                    name: roles.COMPANY_ADMIN,
                  },
                },
              },
            },
            take: 1,
            include: {
              user: true,
            },
          },
        },
      });
      const response = companies.map((company) => ({
        company: {
          id: company!.id,
          name: company!.name,
          address: company!.address,
          phoneNumber: company!.phoneNumber,
          email: company!.email,
          occupation: company!.occupation,
          industry: company!.industry,
          website: company!.website,
          registrationDate: company!.registrationDate,
          TIN: company!.TIN,
          type: company!.type,
          certificate: company!.certificate,
          logo: company!.logo,
          isActive: company!.isActive,
        },
        contactPerson:
          company.CompanyUser.length > 0
            ? {
                id: company.CompanyUser[0].user.id,
                firstName: company.CompanyUser[0].user.firstName,
                lastName: company.CompanyUser[0].user.lastName,
                email: company.CompanyUser[0].user.email,
                phoneNumber: company.CompanyUser[0].phoneNumber,
                title: company.CompanyUser[0].title,
                role: company.CompanyUser[0].role,
                idNumber: company.CompanyUser[0].idNumber,
                idAttachment: company.CompanyUser[0].idAttachment,
                isActive: company.CompanyUser[0].isActive,
              }
            : null,
      }));

      return {
        message: "companies fetched successfully",
        statusCode: 200,
        data: response,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }
  public static async getCompany(id: string) {
    const company = await prisma.company.findUnique({
      where: { id: id },
      include: {
        CompanyUser: {
          where: {
            user: {
              userRoles: {
                some: {
                  name: roles.COMPANY_ADMIN,
                },
              },
            },
          },
          take: 1,
          include: {
            user: true,
          },
        },
      },
    });
    const response = {
      company: {
        id: company!.id,
        name: company!.name,
        address: company!.address,
        phoneNumber: company!.phoneNumber,
        email: company!.email,
        occupation: company!.occupation,
        industry: company!.industry,
        website: company!.website,
        registrationDate: company!.registrationDate,
        TIN: company!.TIN,
        type: company!.type,
        certificate: company!.certificate,
        logo: company!.logo,
        isActive: company!.isActive,
      },
      contactPerson: {
        id: company!.CompanyUser[0].user.id,
        firstName: company!.CompanyUser[0].user.firstName,
        lastName: company!.CompanyUser[0].user.lastName,
        email: company!.CompanyUser[0].user.email,
        phoneNumber: company!.CompanyUser[0].phoneNumber,
        title: company!.CompanyUser[0].title,
        role: company!.CompanyUser[0].role,
        idNumber: company!.CompanyUser[0].idNumber,
        idAttachment: company!.CompanyUser[0].idAttachment,
        isActive: company!.CompanyUser[0].isActive,
      },
    };
    return {
      message: "company fetched successfully",
      statusCode: 200,
      data: response,
    };
  }
  // Get companies count by month, filtered by year
  public static async getCompaniesCountByMonth(
    year: number,
  ): Promise<IResponse<any>> {
    try {
      const companies = await prisma.company.findMany({
        where: {
          createdAt: {
            gte: new Date(`${year}-01-01`),
            lt: new Date(`${year + 1}-01-01`),
          },
        },
        select: {
          createdAt: true,
        },
      });

      // Initialize an array with 12 months (0 for each month)
      const companiesByMonth = Array(12).fill(0);

      // Group by month using JavaScript
      companies.forEach((company) => {
        const month = new Date(company.createdAt).getMonth(); // getMonth returns 0-based month
        companiesByMonth[month]++;
      });

      return {
        message: "Companies count by month fetched successfully",
        statusCode: 200,
        data: companiesByMonth,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  static async createCompany(data: CreateCompanyDto) {
    const errors = await companyValidations.onCreate(data);
    if (errors[0]) {
      throw new ValidationError(errors);
    }
    const newCompany = await prisma.company.create({
      data: {
        ...data.company,
        address: data.company.address ?? "",
        phoneNumber: data.company.phoneNumber ?? "",
        email: data.company.email ?? "",
        occupation: data.company.occupation ?? "",
        industry: data.company.industry ?? "",
        website: data.company.website ?? "",
        registrationDate: data.company.registrationDate ?? "",
        TIN: data.company.TIN ?? "",
        type: data.company.type ?? "",
        certificate: (data.company.certificate as string) ?? "",
        logo: (data.company.logo as string) ?? "",
      },
    });
    Emitter.emit(EventType.COMPANY_CREATED, newCompany, data);
    return {
      message: "Company Created Successfully!!",
      statusCode: 201,
      data: newCompany,
    };
  }

  public static async updateCompany(id: string, data: CreateCompanyDto) {
    try {
      const updatedCompany = await prisma.company.update({
        where: { id },
        data: {
          ...(data?.company as TCompany),
        },
      });

      Emitter.emit(EventType.COMPANY_UPDATED, updatedCompany, data);

      return {
        message: "Company updated successfully",
        statusCode: 200,
        data: updatedCompany,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async deleteCompanyWithRelations(id: string) {
    try {
      // Delete related data first (e.g., CompanyUser, etc.)
      await prisma.companyUser.deleteMany({
        where: { companyId: id },
      });

      // Delete the company itself
      const deletedCompany = await prisma.company.delete({
        where: { id },
      });

      Emitter.emit(EventType.COMPANY_DELETED, deletedCompany);

      return {
        message: "Company and related data deleted successfully",
        statusCode: 200,
        data: deletedCompany,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }
}
