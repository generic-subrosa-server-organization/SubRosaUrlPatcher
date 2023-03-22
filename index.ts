import { readFileSync, writeFileSync } from "fs";
import path from "path";

const file = process.argv[2];
const host = process.argv[3];

if (!file) {
  throw new Error("Please provide a file path");
}

if (!host) {
  throw new Error("Please provide a host");
}

if (host.length > 17) {
  console.warn(
    "Host is too long for Linux Clients and servers, and can only be used for Windows Clients and servers"
  );
}

const fileData = readFileSync(path.resolve(file), "binary");

let location: number = 0;
let length: number = 0;

if (file.endsWith("subrosa.exe")) {
  console.log("Mode: Windows: Client");

  location = 0x0012315c;
  length = 29;
} else if (file.endsWith("subrosa.x64")) {
  console.log("Mode: Linux: Client");

  location = 0x00115389;
  length = 17;
} else if (file.endsWith("subrosadedicated.exe")) {
  console.log("Mode: Windows: Dedicated");

  location = 0x00088ef8;
  length = 29;
} else if (file.endsWith("subrosadedicated.x64")) {
  console.log("Mode: Linux: Dedicated");

  location = 0x000a3c04;
  length = 18;
} else {
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

writeFileSync(newFile, fileBuffer);

console.log("Done");
