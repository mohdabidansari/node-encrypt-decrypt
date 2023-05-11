const fs = require("node:fs/promises");
const { Transform } = require("node:stream");

class Decrypt extends Transform {
  chunksRead = 0;
  transformCount = 0;

  constructor(totalFileSize) {
    super();
    this.totalFileSize = totalFileSize;
  }

  _transform(chunk, encoding, callback) {
    this.transformCount++;
    for (let index = 0; index < chunk.length; index++) {
      if (chunk[index] !== 255) {
        chunk[index] = chunk[index] - 1;
      }
    }

    this.chunksRead = this.chunksRead + chunk.length;
    console.log(
      `Decrypting... ${Math.floor(
        (this.chunksRead / this.totalFileSize) * 100
      )}%`
    );

    this.push(chunk);
    callback();
  }
}

(async () => {
  const readFileHandle = await fs.open("encrypted.txt", "r");
  const writeFileHandle = await fs.open("decrypted.txt", "w");

  const readStream = readFileHandle.createReadStream();
  const writeStream = writeFileHandle.createWriteStream();

  const info = await readFileHandle.stat();
  const totalFileSize = info.size;

  const decrypt = new Decrypt(totalFileSize);

  readStream.pipe(decrypt).pipe(writeStream);
})();
