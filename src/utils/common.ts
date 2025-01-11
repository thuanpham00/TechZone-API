export const convertEnumToArray = (enumObject: { [key: string]: string | number }) => {
  return Object.values(enumObject).filter((value) => typeof value === "string") as string[]
}
