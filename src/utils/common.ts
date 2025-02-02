export const convertEnumToArray = (enumObject: { [key: string]: string | number }) => {
  return Object.values(enumObject).filter((value) => typeof value === "string") as string[]
}

export const convertEnumToArrayNumber = (enumObject: { [key: string]: string | number }) => {
  return Object.values(enumObject).filter((value) => typeof value === "number") as number[]
}

export const getNameImage = (fileName: string) => {
  return fileName.split(".")[0]
}