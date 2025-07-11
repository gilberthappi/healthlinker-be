import {
  Body,
  Get,
  Middlewares,
  Post,
  Put,
  Request,
  Route,
  Security,
  Tags,
  Path,
  Delete,
} from "tsoa";
import { appendAttachments, checkRole } from "../middlewares";
import { CompanyStaffService } from "../services/CompanyStaffService";

import type { CreateCompanyStaffDto, TUser } from "../utils/interfaces/common";
import { roles } from "../utils/roles";
import { Request as ExpressRequest } from "express";
import upload from "../utils/cloudinary";
import validate from "../middlewares/validator";
import { createCompanyStaffSchema } from "../utils/typeSchemas/companyStaff";
import { checkCompanyStaff } from "../middlewares/checkCompanyStaff";
import AppError from "../utils/error";

@Security("jwt")
@Route("/api/staff")
@Tags("Company Staff")
export class CompanyStaffController {
  @Get("/")
  @Middlewares(checkRole(roles.ADMIN, roles.COMPANY_ADMIN))
  public getCompanyStaff(@Request() req: ExpressRequest) {
    return CompanyStaffService.getStaff(req);
  }
  @Get("/my-staff")
  @Middlewares(checkRole(roles.COMPANY_ADMIN))
  public getAllMyStaff(@Request() req: ExpressRequest) {
    return CompanyStaffService.getAllMyStaff(req);
  }
  @Get("/analysis/company/{year}")
  @Security("jwt")
  @Middlewares(checkRole(roles.COMPANY_ADMIN))
  public async getCompanyStaffCountByMonth(
    @Request() request: ExpressRequest,
    @Path() year: number,
  ) {
    const companyId = request.user?.company?.companyId;
    if (!companyId) {
      throw new AppError("Company ID is missing", 400);
    }
    return CompanyStaffService.getCompanyStaffCountByMonth(companyId, year);
  }

  @Post("/")
  @Middlewares(
    checkRole(roles.COMPANY_ADMIN),
    upload.any(),
    appendAttachments,
    validate(createCompanyStaffSchema),
  )
  public async addCompanyStaffMember(
    @Body() companyStaff: CreateCompanyStaffDto,
    @Request() req: ExpressRequest,
  ) {
    const userInfo = req.user as TUser;
    return CompanyStaffService.createCompanyStaff({
      ...companyStaff,
      companyId: userInfo?.company?.companyId,
    });
  }

  @Get("/{id}")
  @Middlewares(checkCompanyStaff)
  public getSchool(id: string) {
    return CompanyStaffService.getCompanyStaff(id);
  }

  @Put("/{id}")
  @Middlewares(
    checkRole(roles.ADMIN, roles.COMPANY_ADMIN),
    upload.any(),
    appendAttachments,
  )
  public updateCompany(
    id: string,
    @Body() companyStaff: CreateCompanyStaffDto,
  ) {
    return CompanyStaffService.updateCompanyStaff(id, companyStaff);
  }

  @Delete("/{id}")
  @Middlewares(checkRole(roles.ADMIN, roles.COMPANY_ADMIN), checkCompanyStaff)
  public deleteCompanyStaff(id: string) {
    return CompanyStaffService.deleteCompanyStaff(id);
  }
}
