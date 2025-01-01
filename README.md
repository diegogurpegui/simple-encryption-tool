# Symmetric Encryption Tool

This tool is a simple symmetric encryption tool that allows you to encrypt and decrypt content using a password.  
The goal of this project is to have the same encryption/decryption mechamism written in several languages and make them all interoperable.

The encryption algorith used is **AES-256-CBC** and the key and IV is derived from the password using **PBKDF2**. You can see the [default parameters](#default-parameters) below.

## Usage

To use the tool, you can run it with the following commands in the different languages.  
You can run the tool with the `help` command to see all the available options. Below are some examples in each languange.

> [!IMPORTANT]
> It is recomended that, even if the examples shows it, you DO NOT enter the password in the terminal for security reasons. If you do not enter it, the tool will ask for it in the terminal.

### Bash

```sh
./encrypt.sh encrypt --text="Hello, World!" --output=encrypted.txt --password=myPassword
./encrypt.sh decrypt --file=encrypted.txt --output=decrypted.txt --password=myPassword
```

### Node.js (Javascript)

```sh
node encrypt.js encrypt --text="Hello, World!" --output=encrypted.txt --password=myPassword
node encrypt.js decrypt --file=encrypted.txt --output=decrypted.txt --password=myPassword
```

### Python

```sh
python encrypt.py encrypt --text="hello world" --password="mypass"
python encrypt.py decrypt --text="U2FsdGVkX..." --password="mypass"
```

## Default Parameters

By default, the tool uses the following parameters:

- Encryption algorithm: `AES-256-CBC`
- Key length: `32 bytes`
- Salt prefix: `"Salted__"`  
  This is used to follow "openssl" standard.
- PBKDF2 algorithm: `sha256`
- PBKDF2 rounds: `10000`
- Encrypted content encoding: `base64`
- Unencrypted content encoding: `utf8`

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvement, please open an issue or submit a pull request.
