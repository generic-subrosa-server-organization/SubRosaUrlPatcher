"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const file = process.argv[2];
const host = process.argv[3];
if (!file) {
    throw new Error("Please provide a file path");
}
if (!host) {
    throw new Error("Please provide a host");
}
if (host.length > 17) {
    console.warn("Host is too long for Linux Clients and servers, and can only be used for Windows Clients and servers");
}
const fileData = (0, fs_1.readFileSync)(path_1.default.resolve(file), "binary");
let location = 0;
let length = 0;
if (file.endsWith("subrosa.exe")) {
    console.log("Mode: Windows: Client");
    location = 0x0012315c;
    length = 29;
}
else if (file.endsWith("subrosa.x64")) {
    console.log("Mode: Linux: Client");
    location = 0x00115389;
    length = 17;
}
else if (file.endsWith("subrosadedicated.exe")) {
    console.log("Mode: Windows: Dedicated");
    location = 0x00088ef8;
    length = 29;
}
else if (file.endsWith("subrosadedicated.x64")) {
    console.log("Mode: Linux: Dedicated");
    location = 0x000a3c04;
    length = 18;
}
else {
    throw new Error("File is not a Sub Rosa executable");
}
if (host.length > length) {
    throw new Error("Host is too long");
}
const hostBuffer = Buffer.alloc(length, 0x00);
hostBuffer.write(host);
const fileBuffer = Buffer.from(fileData, "binary");
fileBuffer.write(hostBuffer.toString("binary"), location, length, "binary");
const newFile = file.replace(".exe", ".patched.exe");
console.log(`Writing to ${newFile}`);
(0, fs_1.writeFileSync)(newFile, fileBuffer);
console.log("Done");
