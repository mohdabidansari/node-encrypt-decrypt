const fs = require("node:fs/promises");
const { Transform } = require("node:stream");

class Encrypt extends Transform {
  chunksRead = 0;
  constructor(totalFileSize) {
    super();
    this.totalFileSize = totalFileSize;
  }

  _transform(chunk, encoding, callback) {
    // console.log(chunk);
    // console.log(chunk.toString("utf-8"));

    for (let index = 0; index < chunk.length; index++) {
      if (chunk[index] !== 255) {
        chunk[index] = chunk[index] + 1;
      }
    }
    this.chunksRead = this.chunksRead + chunk.length;
    // console.log(`Chunks read`, this.chunksRead);
    console.log(
      `Encrypting... ${Math.floor(
        (this.chunksRead / this.totalFileSize) * 100
      )}%`
    );
    this.push(chunk);
    callback();
  }
}

(async () => {
  const readFileHandle = await fs.open("read.txt", "r");
  const writeFileHandle = await fs.open("encrypted.txt", "w");

  const info = await readFileHandle.stat();
  const totalFileSize = info.size;
  //   console.log("total size", totalFileSize);

  const readStream = readFileHandle.createReadStream();
  const writeStream = writeFileHandle.createWriteStream();

  const encrypt = new Encrypt(totalFileSize);
  readStream.pipe(encrypt).pipe(writeStream);
})();
