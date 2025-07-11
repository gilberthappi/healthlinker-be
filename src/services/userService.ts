/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseService } from "./Service";
import { prisma } from "../utils/client";
import {
  IPaged,
  ILoginUser,
  ISignUpUser,
  IUserResponse,
  CreateUserDto,
} from "../utils/interfaces/common";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../utils/error";
import { randomBytes } from "crypto";
import { sendEmail } from "../utils/email";
import { hash } from "bcrypt";
import { roles } from "../utils/roles";
import type { Request } from "express";
import { QueryOptions, Paginations } from "../utils/DBHelpers";
import { Role } from "@prisma/client";

export class UserService extends BaseService {
  public static async getUsers(
    searchq?: string,
    limit?: number,
    currentPage?: number,
  ): Promise<IPaged<IUserResponse[]>> {
    try {
      const queryOptions = QueryOptions(
        ["firstName", "lastName", "email"],
        searchq,
      );

      const pagination = Paginations(currentPage, limit);

      const users = await prisma.user.findMany({
        where: queryOptions,
        include: {
          roles: true,
          agents: true,
        },
        ...pagination,
        orderBy: {
          createdAt: "desc",
        },
      });

      const totalItems = await prisma.user.count({
        where: queryOptions,
      });

      return {
        message: "Users fetched successfully",
        statusCode: 200,
        data: users,
        totalItems,
        currentPage: currentPage || 1,
        itemsPerPage: limit || 15,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async loginUser(user: ILoginUser) {
    try {
      const userData = await prisma.user.findFirst({
        where: { email: user.email },
        include: {
          roles: true,
        },
      });
      if (!userData) {
        throw new AppError("user account not found ", 401);
      }

      const isPasswordSimilar = await compare(user.password, userData.password);
      if (isPasswordSimilar) {
        const token = jwt.sign(user.email, process.env.JWT_SECRET!);
        const userRoles = userData.roles.map((roleRecord) => roleRecord.role);
        return {
          message: "",
          statusCode: 200,
          data: {
            token,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            id: userData.id,
            roles: userRoles,
            photo: userData.photo,
          },
        };
      }
      throw new AppError("user account with email or password not found", 401);
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  // user signup
  public static async signUpUser(user: ISignUpUser) {
    try {
      // Check if user already exists
      const userExists = await prisma.user.findFirst({
        where: { email: user.email },
      });
      if (userExists) {
        throw new AppError("User already exists", 409);
      }

      // Hash password
      const hashedPassword = await hash(user.password, 10);
      const token = jwt.sign(user.email, process.env.JWT_SECRET!);
      await prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            email: user.email,
            password: hashedPassword,
            photo: typeof user.photo === "string" ? user.photo : undefined,
          },
        });

        if (!createdUser) {
          throw new Error("Failed to create user");
        }

        // Assign the "USER" role
        const assignRole = await tx.userRoles.create({
          data: {
            userId: createdUser.id,
            role: roles.CLIENT,
          },
        });

        if (!assignRole) {
          throw new Error("Failed to assign role to user");
        }
      });

      const pt = await prisma.user.findFirst({
        where: { email: user.email },
      });

      return {
        message: "User created successfully",
        data: {
          token,
          photo: pt?.photo,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: [roles.CLIENT],
        },
        statusCode: 201,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async createUser(user: CreateUserDto) {
    try {
      const userExists = await prisma.user.findFirst({
        where: { email: user.email },
      });
      if (userExists) {
        throw new AppError("User already exists", 409);
      }

      const hashedPassword = await hash(user.password, 10);
      const createdUser = await prisma.user.create({
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          email: user.email,
          password: hashedPassword,
          photo: typeof user.photo === "string" ? user.photo : undefined,
        },
      });

      await prisma.userRoles.create({
        data: {
          userId: createdUser.id,
          role: user.role as Role,
        },
      });

      return {
        message: "User created successfully",
        data: createdUser,
        statusCode: 201,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async updateUser(id: string, user: Partial<CreateUserDto>) {
    try {
      const existingUser = await prisma.user.findUnique({ where: { id } });
      if (!existingUser) {
        throw new AppError("User not found", 404);
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          firstName: user.firstName || existingUser.firstName,
          lastName: user.lastName || existingUser.lastName,
          phoneNumber: user.phoneNumber || existingUser.phoneNumber,
          email: user.email || existingUser.email,
          photo:
            typeof user.photo === "string" ? user.photo : existingUser.photo,
        },
      });

      if (user.role) {
        await prisma.userRoles.updateMany({
          where: { userId: id },
          data: { role: user.role as Role },
        });
      }

      return {
        message: "User updated successfully",
        data: updatedUser,
        statusCode: 200,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  // Method to request otp
  public static async requestPasswordReset(email: string) {
    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Generate a 6-digit OTP
    const otp = randomBytes(3).toString("hex").toUpperCase();
    const otpExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Update the user with OTP and expiration time
    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiresAt },
    });

    // Send OTP via email (implement sendEmail utility)
    await sendEmail({
      to: user.email,
      subject: "Password Reset - One-Time Password (OTP)",
      body: `
    Dear ${user.firstName || "User"},

    You have requested to reset your password. Please use the following One-Time Password (OTP) to proceed with the password reset process:

    OTP: ${otp}

    This OTP is valid for a limited time. If you did not request a password reset, please disregard this email.

    Best regards,
    KIGALI HOT MARKET Support Team
  `,
    });

    return { message: "OTP sent to your email " };
  }

  // Method to reset password
  public static async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
  ) {
    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (
      !user.otp ||
      user.otp !== otp ||
      !user.otpExpiresAt ||
      user.otpExpiresAt < new Date()
    ) {
      throw new AppError("Invalid or expired OTP", 400);
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 10);

    // Update the user with the new password and clear OTP fields
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, otp: null, otpExpiresAt: null },
    });

    return { message: "Password reset successfully" };
  }
  public static async deleteUser(id: string) {
    try {
      // Check if the user exists and include related records
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          roles: true,
          likes: true,
          testimonials: true,
          agents: {
            include: {
              agentReviews: true,
            },
          },
        },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      await prisma.$transaction(async (tx) => {
        // Delete the user's likes
        await tx.likes.deleteMany({
          where: { userId: id },
        });

        // Delete the user's testimonials
        await tx.testimony.deleteMany({
          where: { userId: id },
        });

        // Delete the user's agent reviews if they exist
        for (const agent of user.agents) {
          if (agent.agentReviews) {
            await tx.agentReview.delete({
              where: { id: agent.agentReviews.id },
            });
          }
        }

        // Delete the user's agent records
        if (user.agents.length > 0) {
          await tx.agents.deleteMany({
            where: { userId: id },
          });
        }

        // Delete the user's roles
        await tx.userRoles.deleteMany({
          where: { userId: id },
        });

        // Delete the user
        await tx.user.delete({
          where: { id },
        });
      });

      return { message: "User and related activities deleted successfully" };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async getMe(req: Request) {
    try {
      const userId = req.user!.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: true,
        },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      const userRoles = user.roles.map((roleRecord) => roleRecord.role);
      return {
        message: "User fetched successfully",
        statusCode: 200,
        data: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          roles: userRoles,
        },
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }
}
