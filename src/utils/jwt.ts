import jwt from "jsonwebtoken"

export const signToken = ({
  payload,
  privateKey,
  options = {
    algorithm: "HS256" // thuật toán mặc định
  }
}: {
  payload: string | Buffer | object
  privateKey: string
  options?: jwt.SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, code) => {
      if (error) {
        return reject(error)
      }
      resolve(code as string)
    })
  })
}

export const verifyToken = ({ token, privateKey }: { token: string; privateKey: string }) => {
  return new Promise<string>((resolve, reject) => {
    jwt.verify(token, privateKey, (error, decode) => {
      if (error) {
        return reject(error)
      }
      resolve(decode as string)
    })
  })
}
