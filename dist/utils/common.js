"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValueObject = exports.getNameImage = exports.convertEnumToArrayNumber = exports.convertEnumToArray = void 0;
const convertEnumToArray = (enumObject) => {
    return Object.values(enumObject).filter((value) => typeof value === "string");
};
exports.convertEnumToArray = convertEnumToArray;
const convertEnumToArrayNumber = (enumObject) => {
    return Object.values(enumObject).filter((value) => typeof value === "number");
};
exports.convertEnumToArrayNumber = convertEnumToArrayNumber;
const getNameImage = (fileName) => {
    return fileName.split(".")[0];
};
exports.getNameImage = getNameImage;
const getValueObject = (object) => {
    return Object.keys(object);
};
exports.getValueObject = getValueObject;
