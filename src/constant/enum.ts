export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
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

export enum MediaType {
  Image,
  Video
}
