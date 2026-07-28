import * as Yup from "yup";

const nameRegex = /^[A-Za-z][A-Za-z\s.'-]{1,49}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const passwordRegex = /^.{6,}$/;
const otpRegex = /^\d{6}$/;
const phoneRegex = /^[0-9+\-()\s]{7,20}$/;

const email = Yup.string()
  .trim()
  .required("Email is required")
  .matches(emailRegex, "Enter a valid email address");

const strongPassword = Yup.string()
  .required("Password is required")
  .matches(passwordRegex, "Password must be at least 6 characters");

export const loginSchema = Yup.object({
  email,
  password: Yup.string().required("Password is required"),
});

export const registerSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Name is required")
    .matches(nameRegex, "Use 2-50 letters, spaces, dot, apostrophe or hyphen"),
  email,
  password: strongPassword,
  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("password")], "Passwords must match"),
});

export const forgotPasswordSchema = Yup.object({
  email,
});

export const verifyUserSchema = Yup.object({
  email,
  otp: Yup.string()
    .trim()
    .required("OTP is required")
    .matches(otpRegex, "OTP must be 6 digits"),
});

export const resetPasswordSchema = Yup.object({
  email,
  otp: Yup.string()
    .trim()
    .required("OTP is required")
    .matches(otpRegex, "OTP must be 6 digits"),
  newPassword: strongPassword,
  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("newPassword")], "Passwords must match"),
});

export const profileSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Name is required")
    .matches(nameRegex, "Use 2-50 letters, spaces, dot, apostrophe or hyphen"),
  email,
});

export const changePasswordSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: strongPassword,
  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("newPassword")], "Passwords must match"),
});

export const contactSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be 80 characters or less"),
  email,
  phone: Yup.string()
    .trim()
    .required("Phone is required")
    .matches(phoneRegex, "Enter a valid phone number"),
  company: Yup.string()
    .trim()
    .required("Company is required")
    .min(2, "Company must be at least 2 characters")
    .max(100, "Company must be 100 characters or less"),
  status: Yup.string()
    .oneOf(["Lead", "Prospect", "Customer"], "Choose a valid status")
    .required("Status is required"),
  notes: Yup.string().trim().max(1000, "Notes must be 1000 characters or less"),
});
