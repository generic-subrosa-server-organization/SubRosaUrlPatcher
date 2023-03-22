import { readFileSync, writeFileSync } from "fs";
import path from "path";

const file = process.argv[2];
const host = process.argv[3];
let version = parseInt(process.argv[4]) as 38 | 34;

if (!file) {
  throw new Error("Please provide a file path");
}

if (!host) {
  throw new Error("Please provide a host");
}

const validVersions = [38, 34];

if (!validVersions.includes(version)) {
  throw new Error(
    `Version ${version} is not supported. Please provide a valid version. Valid versions are: ${validVersions.join(
      ", "
    )}`
  );
}

if (!version) {
  version = 38;
}

if (host.length > 17) {
  console.warn(
    "Host is too long for Linux Clients and servers, and can only be used for Windows Clients and servers"
  );
}

const fileData = readFileSync(path.resolve(file), "binary");

let location: number = 0;
let length: number = 0;
let mode = 0;

const dict = {
  38: [
    [0x00274e8a, 19], // Windows: Client
    [0x000f4280, 18], // Windows: Dedicated
    [0x0015f6fd, 17], // Linux: Client
    [0x000d6fe8, 17], // Linux: Dedicated
  ],
  34: [
    [0x0012315c, 29], // Windows: Client
    [0x00088ef8, 29], // Windows: Dedicated
    [0x00115389, 17], // Linux: Client
    [0x000a3c04, 17], // Linux: Dedicated
  ],
};

if (file.endsWith("subrosa.exe")) {
  console.log("Mode: Windows: Client");
  mode = 0;
} else if (file.endsWith("subrosa.x64")) {
  console.log("Mode: Linux: Client");
  mode = 2;
} else if (file.endsWith("subrosadedicated.exe")) {
  console.log("Mode: Windows: Dedicated");
  mode = 1;
} else if (file.endsWith("subrosadedicated.x64")) {
  console.log("Mode: Linux: Dedicated");
  mode = 3;
} else {
  throw new Error("File is not a Sub Rosa executable");
}

location = dict[version][mode][0];
length = dict[version][mode][1];

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
