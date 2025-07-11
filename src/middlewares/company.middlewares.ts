import type { NextFunction } from "express";
import type { Request, Response } from "express";
import { prisma } from "../utils/client";
import AppError from "../utils/error";

export const appendPhotoAttachments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.files) {
      const files = req.files as Express.Multer.File[];

      // Handle thumbnail
      if (files.some((file) => file.fieldname === "thumbnail")) {
        req.body.thumbnail = files.find(
          (file) => file.fieldname === "thumbnail",
        )?.path;
      }

      // Handle galleryImages
      req.body.galleryImages = files
        .filter((file) => file.fieldname.startsWith("galleryImages"))
        .map((file) => file.path);

      // Ensure galleryImages is an array even if no files are uploaded
      if (!req.body.galleryImages) {
        req.body.galleryImages = [];
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const appendPhoto = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.files) {
      const files = req.files as Express.Multer.File[];
      // Ensure the photo field is correctly extracted
      const photoFile = files.find((file) => file.fieldname === "photo");
      if (photoFile) {
        req.body.photo = photoFile.path;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const appendImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.file) {
      req.body.image = req.file.path;
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const checkCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
    });

    if (!company) {
      return res.status(404).json({
        message: "No Company found ",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while checking the company",
    });
  }
};

export const appendAttachments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.files) {
      const files = req.files as Express.Multer.File[];
      req.body.company.certificate = files.find(
        (file) => file.fieldname == "company[certificate]",
      )?.path;
      req.body.company.logo = files.find(
        (file) => file.fieldname == "company[logo]",
      )?.path;
      req.body.contactPerson.idAttachment = files.find(
        (file) => file.fieldname == "contactPerson[idAttachment]",
      )?.path;
    }
    next();
  } catch (error) {
    next();
  }
};

export const userBelongsToACompany = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.company) {
      throw new AppError("You are not assigned to any company", 403);
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const appendDocumentAttachments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.files) {
      const files = req.files as Express.Multer.File[];
      req.body.documents = files.map((file) => file.path);
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const appendShortListingAttachments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.files) {
      const files = req.files as Express.Multer.File[];
      req.body.studentCard = files.find(
        (file) => file.fieldname == "studentCard",
      )?.path;
      req.body.recommendationLetter = files.find(
        (file) => file.fieldname == "recommendationLetter",
      )?.path;
      req.body.insurance = files.find(
        (file) => file.fieldname == "insurance",
      )?.path;
      req.body.transcript = files.find(
        (file) => file.fieldname == "transcript",
      )?.path;
      req.body.nameTag = files.find(
        (file) => file.fieldname == "nameTag",
      )?.path;
      req.body.passportPhoto = files.find(
        (file) => file.fieldname == "passportPhoto",
      )?.path;
      req.body.birthCertificate = files.find(
        (file) => file.fieldname == "birthCertificate",
      )?.path;
      req.body.medicalReport = files.find(
        (file) => file.fieldname == "medicalReport",
      )?.path;
      req.body.academicCertificate = files.find(
        (file) => file.fieldname == "academicCertificate",
      )?.path;
      req.body.applicationForm = files.find(
        (file) => file.fieldname == "applicationForm",
      )?.path;
      req.body.idCard = files.find((file) => file.fieldname == "idCard")?.path;
      req.body.consentLetter = files.find(
        (file) => file.fieldname == "consentLetter",
      )?.path;
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const appendGallery = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.file) {
      req.body.document = req.file.path;
    }
    next();
  } catch (error) {
    next(error);
  }
};
