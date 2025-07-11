import type { $Enums, PaymentMethod } from "@prisma/client";
import { TsoaResponse } from "tsoa";
import { Role } from "@prisma/client";

export interface IResponse<T> {
  statusCode: number;
  message: string;
  error?: unknown;
  data?: T;
}

export interface IPaged<T> {
  data: T;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  statusCode: number;
  message: string;
  error?: unknown;
}

export interface Paged<T> {
  data: T;
  totalItems: number;
  statusCode: number;
  message: string;
  error?: unknown;
}

export type TUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phoneNumber: string;
  photo?: Express.Multer.File | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  roles?: { id: string; role: string; userId: string }[];
  company?: { id: string; role: string; userId: string; companyId: string };
};

export interface IUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: IRoles[];
  password: string;
  createdAt: Date;
  phoneNumber: string;
  updatedAt: Date;
  otp: string | null;
  otpExpiresAt: Date | null;
  photo: string;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  roles: string;
  role: string;
  password: string;
  phoneNumber: string;
  photo?: Express.Multer.File | string | null;
}

export interface IRoles {
  id: string;
  userId: string;
  role: string;
}

export type RoleT =
  | "ADMIN"
  | "AGENT"
  | "COMPANY_ADMIN"
  | "COMPANY_USER"
  | "DEVELOPER"
  | "ADMINISTRATOR"
  | "MANAGER"
  | "STAFF"
  | "CLIENT";

export interface IUser extends Omit<TUser, "id" | "createdAt" | "updatedAt"> {}
export interface ILoginResponse
  extends Omit<TUser, "password" | "createdAt" | "updatedAt" | "roles"> {
  token: string;
  roles: $Enums.Role[];
}
export interface ILoginUser extends Pick<IUser, "email" | "password"> {}
export interface ISignUpUser
  extends Pick<
    IUser,
    "email" | "password" | "firstName" | "lastName" | "photo" | "phoneNumber"
  > {}

export type TErrorResponse = TsoaResponse<
  400 | 401 | 500,
  IResponse<{ message: string }>
>;

export type TService = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface CreateServiceDto {
  title: string;
  description: string;
}

export type TTestimony = {
  id: string;
  userId: string | null;
  agentReviewId: string | null;
  reviewsId: string | null;
  name: string;
  message: string;
  rating?: number | null;
  photo?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface CreateTestimonyDto {
  userId?: string | null;
  agentReviewId?: string | null;
  reviewsId?: string | null;
  name: string;
  message: string;
  rating?: number | null;
  photo?: Express.Multer.File | string | null;
}

export type TContact = {
  id: string;
  userId?: string | null;
  enquiryPropertyId?: string | null;
  name: string;
  message: string;
  photo?: string | null;
  location?: string | null;
  phoneNumber?: string | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface CreateContactDto {
  enquiryPropertyId?: string | null;
  userId?: string | null;
  agentId?: string | null;
  name: string;
  message: string;
  photo?: Express.Multer.File | string | null;
  location?: string | null;
  phoneNumber?: string | null;
  email: string;
}
export interface IResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
}

export type TFaq = {
  id: string;
  question: string;
  solution: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface CreateFaqDto {
  question: string;
  solution: string;
}

export type TBlog = {
  id: string;
  title: string;
  thumbnail: Express.Multer.File | string;
  teaser: string;
  description: string;
  category: string;
  likes: number;
  views: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export interface CreateBlogDto {
  title: string;
  thumbnail: Express.Multer.File | string;
  teaser: string;
  description: string;
  category: string;
  likes?: number;
  views?: number;
  featured: boolean;
}

export type TLikes = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TAds = {
  id: string;
  title: string;
  thumbnail: Express.Multer.File | string;
  location: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface CreateAdsDto {
  title: string;
  thumbnail: Express.Multer.File | string;
  location: string;
  description: string;
}

export type TAgent = {
  id: string;
  experience: string;
  description: string;
  speciality: string[];
  whatsapp: string;
  joined: string;
  languages: string;
  about: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface CreateAgentDto {
  experience: string;
  description: string;
  speciality: string[];
  whatsapp: string;
  joined: string;
  languages: string;
  about: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  photo?: Express.Multer.File | string;
}

export type TProduct = {
  id: string;
  name: string;
  isFeatured?: boolean;
  description: string;
  teaser: string;
  model?: string | null;
  warranty?: string | null;
  featuresOne?: string | null;
  featuresTwo?: string | null;
  featuresThree?: string | null;
  featuresFour?: string | null;
  featuresFive?: string | null;
  featuresFix?: string | null;
  featuresSeven?: string | null;
  featuresEight?: string | null;
  featuresNine?: string | null;
  featuresTen?: string | null;
  price: number;
  discountPercentage?: number | null;
  category: string;
  brand?: string | null;
  stockQuantity: number;
  isActive: boolean;
  thumbnail: string;
  galleryImages?: (Express.Multer.File | string)[];
  rating?: number | null;
  createdAt: Date;
  updatedAt: Date;
  reviews?: TReviews;
  orderItems?: TOrderItem[];
};

export type ProductCategory = $Enums.ProductCategory;
export type PaymentStatus = $Enums.PaymentStatus;
export type DeliveryStatus = $Enums.DeliveryStatus;
export type OrderStatus = $Enums.OrderStatus;

export type TOrder = {
  id: string;
  orderNumber: string;
  deliveryFee?: number | null;
  status: string;
  totalAmount: number;
  subTotal: number;
  createdAt: Date;
  updatedAt: Date;
};

export type TOrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  discount?: number | null;
  unitPrice: number;
  order?: TOrder;
  product?: TProduct;
};

export type TPayment = {
  id: string;
  orderId: string;
  kind: string;
  amount: number;
  method: string;
  status: string;
  paidAt?: Date | null;
  accountNumber: string;
  accountProvider?: string | null;
  refId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  order?: TOrder;
};

export interface CreatePaymentDto {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  accountNumber: string;
}

export interface withdrawalPaymentDto {
  amount: number;
  accountNumber: string;
}

export interface UpdatePaymentDto {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  paidAt?: Date;
  accountNumber: string;
  accountProvider?: string;
  refId?: string;
}

export type TDelivery = {
  id: string;
  orderId: string;
  address: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  customerNote?: string | null;
  deliveryStatus: string;
  estimatedDate?: Date | null;
  deliveredAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface CreateDeliveryDto {
  orderId: string;
  address: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  customerNote?: string;
  estimatedDate?: Date;
  deliveredAt?: Date;
}

export interface UpdateDeliveryDto {
  address: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  customerNote?: string;
  estimatedDate?: Date;
  deliveredAt?: Date;
  deliveryStatus: DeliveryStatus;
}

export interface CreateProductDto {
  name: string;
  isFeatured?: boolean;
  teaser: string;
  model?: string;
  warranty?: string;
  featuresOne?: string;
  featuresTwo?: string;
  featuresThree?: string;
  featuresFour?: string;
  featuresFive?: string;
  featuresFix?: string;
  featuresSeven?: string;
  featuresEight?: string;
  featuresNine?: string;
  featuresTen?: string;
  description: string;
  price: number;
  discountPercentage?: number;
  category: string;
  brand?: string;
  stockQuantity: number;
  isActive?: boolean;
  thumbnail: string;
  galleryImages?: string[];
}

export interface CreateOrderDto {
  discount?: number;
  deliveryFee?: number;
  orderItems: {
    productId: string;
    quantity: number;
  }[];
}

export interface CreateOrderItemDto {
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export type TReviews = {
  id: string;
  productId: string;
  count: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
};

export interface CreateReviewsDto {
  count: number;
  rating: number;
}

export type TCompany = {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  TIN: string;
  type: string;
  occupation?: string;
  industry?: string;
  website?: string;
  registrationDate?: string;
  certificate: string;
  logo: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export interface CreateCompanyDto {
  company: {
    name: string;
    address?: string;
    email: string;
    phoneNumber?: string;
    TIN?: string;
    occupation?: string;
    industry?: string;
    website?: string;
    registrationDate?: string;
    certificate?: Express.Multer.File | string;
    logo?: Express.Multer.File | string;
    type?: string;
  };
  contactPerson: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    title?: string;
    role?: string;
    idNumber?: string;
    userId?: string;
    idAttachment?: Express.Multer.File | string;
  };
}

export interface CreateCompanyStaffDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  title?: string;
  role: Role;
  idNumber?: string;
  companyId?: string;
  idAttachment?: Express.Multer.File | string;
}
