export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

export enum GenderType {
  MALE = "Male",
  FEMALE = "Female",
  OTHER = "Other"
}

export enum RoleType {
  ADMIN = "Admin",
  USER = "User"
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  EmailVerifyToken,
  ForgotPasswordToken
}
