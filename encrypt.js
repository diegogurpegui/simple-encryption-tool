const fs = require("fs");
const readline = require("readline");
const crypto = require("crypto");

// param constants
const ENCRYPTION_ALGO = "aes-256-cbc";
const SALT_PREFIX = "Salted__"; // standard prefix used by openssl
const KEY_LENGTH = 32;
const PBKDF2_ALGO = "sha256";
const PBKDF2_ROUNDS = 10000;
const ENCRYPTED_CONTENT_ENCODING = "base64";
const UNENCRYPTED_CONTENT_ENCODING = "utf8";

const showHelp = () => {
  console.log("Usage: node encrypt.js [encrypt|decrypt] [options]");
  console.log("");
  console.log("Options:");
  console.log("  --text=<text>           Input text");
  console.log("  --file=<file>           Input file");
  console.log(
    "  --password=<pass>       Password for encryption/decryption. Optional."
  );
  console.log(
    "  --output=<file>         Output file (default: print to stdout)"
  );
  console.log(
    "  --dec-encoding=<enc>    Encoding of the decrypted input/output (base64|utf8) (default: utf8)"
  );
  console.log("  --help                  Show this help message");
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const action = args[0];
  const options = {};
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const [key, value] = arg.slice(2).split(/=(.*)/s); // Split only on the first '='
      options[key] = value ? value.trim() : value;
    }
  }
  return { action, options };
};

const getInputContent = (options) => {
  if (options.file)
    return fs.readFileSync(options.file, UNENCRYPTED_CONTENT_ENCODING);
  if (options.text) return options.text;
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("Enter content: ", (answer) => {
      resolve(answer);
      rl.close();
    });
  });
};

const getPassword = (options) => {
  if (options.password) return options.password;
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("Enter password: ", (answer) => {
      resolve(answer);
      rl.close();
    });
  });
};

const deriveKeyAndIV = (password, salt) => {
  const derivedKey = crypto.pbkdf2Sync(
    password,
    salt,
    PBKDF2_ROUNDS,
    KEY_LENGTH + 16, // 32 bytes for key + 16 bytes for IV
    PBKDF2_ALGO
  );
  const key = derivedKey.subarray(0, KEY_LENGTH);
  const iv = derivedKey.subarray(KEY_LENGTH);

  return { key, iv };
};

const encrypt = async (content, password) => {
  // Generate salt
  const salt = crypto.randomBytes(8);
  // Derive key and IV from password and salt using PBKDF2
  const { key, iv } = deriveKeyAndIV(password, salt);

  const contentBuffer = Buffer.from(content, UNENCRYPTED_CONTENT_ENCODING);

  const cipher = crypto.createCipheriv(ENCRYPTION_ALGO, key, iv);
  cipher.setAutoPadding(true);
  const encryptedContentBuffer = Buffer.concat([
    cipher.update(contentBuffer),
    cipher.final(),
  ]);

  // the final buffer consist of the salt and the encrypted content
  const finalBuffer = Buffer.concat([
    // add the standard prefix that openssl uses for the salt
    Buffer.from(SALT_PREFIX, "utf8"),
    salt,
    encryptedContentBuffer,
  ]);
  const finalB64 = finalBuffer.toString(ENCRYPTED_CONTENT_ENCODING);

  return finalB64;
};

const decrypt = async (encrypted, password) => {
  const buffer = Buffer.from(encrypted, ENCRYPTED_CONTENT_ENCODING);

  // Obtain parts
  // Omit the prefix when getting the salt.
  const salt = buffer.subarray(SALT_PREFIX.length, 16);
  let encryptedContent = buffer.subarray(16);

  // Derive key and IV from password and salt using PBKDF2
  const { key, iv } = deriveKeyAndIV(password, salt);

  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGO, key, iv);
  // padding
  decipher.setAutoPadding(true);

  const decryptedContent = Buffer.concat([
    decipher.update(encryptedContent),
    decipher.final(),
  ]);

  return decryptedContent.toString(UNENCRYPTED_CONTENT_ENCODING);
};

const main = async () => {
  const { action, options } = parseArgs();
  if (!action) {
    showHelp();
    process.exit(1);
  }

  const content = await getInputContent(options);
  const password = await getPassword(options);

  let output;
  if (action === "encrypt") {
    output = await encrypt(content, password);
  } else if (action === "decrypt") {
    output = await decrypt(content, password, options.decEncoding);
  }

  if (options.output) {
    fs.writeFileSync(options.output, output);
  } else {
    console.log(output);
  }
};

main();
