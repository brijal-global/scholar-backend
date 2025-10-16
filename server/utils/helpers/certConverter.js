// cert-converter.js
import fs from "fs";

function convertCertToSingleLine(multiLineCert) {
  // Replace all newlines with \n escape sequence
  // Also handles Windows (\r\n) and Linux/macOS (\n) line endings
  const singleLine = multiLineCert
    .replace(/\r\n/g, "\n") // Normalize Windows line endings first
    .replace(/\n/g, "\\n") // Replace newlines with \n
    .replace(/"/g, '\\"'); // Escape any existing quotes

  return singleLine;
}

// Example usage:
const multiLineCert = `-----BEGIN CERTIFICATE-----
abc
-----END CERTIFICATE-----`;

const singleLineCert = convertCertToSingleLine(multiLineCert);
console.info("\nSingle-line certificate:\n");
console.info(singleLineCert);

// If we want to use with a file:
// const certFromFile = fs.readFileSync('path/to/our/cert.pem', 'utf8');
// const converted = convertCertToSingleLine(certFromFile);
// console.info(converted);
