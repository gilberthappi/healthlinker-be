import {
  Body,
  Post,
  Route,
  Controller,
  Tags,
  Middlewares,
  Security,
  Get,
  Put,
  Delete,
} from "tsoa";
import { companyService } from "../services/companyService";

import { CreateCompanyDto } from "../utils/interfaces/common";
import validate from "../middlewares/validator";
import { createCompanySchema } from "../utils/typeSchemas/company";
import { checkRole } from "../middlewares/checkRole";
import { roles } from "../utils/roles";
import {
  checkCompany,
  appendAttachments,
} from "../middlewares/company.middlewares";
import upload from "../utils/cloudinary";
@Tags("Company")
@Security("jwt")
@Route("/api/company")
export class CompanyController extends Controller {
  @Get("/")
  public getCompanies() {
    return companyService.getCompanies();
  }

  @Get("/analysis/count-by-month/{year}")
  public getSchoolsCountByMonth(year: number) {
    return companyService.getCompaniesCountByMonth(year);
  }

  @Get("/{id}")
  @Middlewares(checkCompany)
  public getSchool(id: string) {
    return companyService.getCompany(id);
  }

  @Post("/")
  @Middlewares(
    checkRole(roles.ADMIN),
    upload.any(),
    appendAttachments,
    validate(createCompanySchema),
  )
  public async addCompany(@Body() company: CreateCompanyDto) {
    return await companyService.createCompany(company);
  }

  @Put("/{id}")
  @Middlewares(checkRole(roles.ADMIN), upload.any(), appendAttachments)
  public updateCompany(id: string, @Body() company: CreateCompanyDto) {
    return companyService.updateCompany(id, company);
  }

  @Delete("/{id}")
  @Middlewares(checkRole(roles.ADMIN), checkCompany)
  public deleteCompany(id: string) {
    return companyService.deleteCompanyWithRelations(id);
  }
}
