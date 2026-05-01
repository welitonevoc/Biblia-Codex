const fs = require("fs");
const path = require("path");
const rPath = path.join(__dirname, "src/features/Bible/Reader.tsx");
let content = fs.readFileSync(rPath, "utf8");
// Fix 1: Add console.log after imports
