export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

export enum GenderType {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other"
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  EmailVerifyToken,
  ForgotPasswordToken
}
