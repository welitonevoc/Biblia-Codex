const fs = require('fs');

const data = fs.readFileSync('./VinePro_lazy.bin');
console.log('File size:', data.length);

// Check first bytes for index header
const magic = data.slice(0, 4).toString();
console.log('Magic:', magic);

// Check if it's a valid format
const version = data.readUInt8(4);
console.log('Version:', version);

// Number of entries
const numEntries = data.readUInt32LE(5);
console.log('Number of entries:', numEntries);

// Index starts at byte 9
const indexOffset = 9;
console.log('First entry starts at:', indexOffset);

// Read first few entries
for (let i = 0; i < 3; i++) {
  const offset = indexOffset + i * 12;
  const wordOffset = data.readUInt32LE(offset);
  const wordLen = data.readUInt16LE(offset + 4);
  const defOffset = data.readUInt32LE(offset + 6);
  const defLen = data.readUInt16LE(offset + 10);
  
  console.log(`Entry ${i}: word@${wordOffset}(${wordLen}), def@${defOffset}(${defLen})`);
}

// Try to read first word
const wordOffset = data.readUInt32LE(indexOffset);
const wordLen = data.readUInt16LE(indexOffset + 4);
const word = data.slice(wordOffset, wordOffset + wordLen).toString();
console.log('First word:', word);