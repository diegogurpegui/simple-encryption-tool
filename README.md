# Symmetric Encryption Tool

This tool is a simple symmetric encryption tool that allows you to encrypt and decrypt content using a password. The encryption algorithm used is AES-256-CBC.<br/>
The goal of this project is to have the same encryption/decryption mechamism written in several languages and make them all interoperable.

## Usage

To use the tool, you can run it with the following commands:

### Encrypting Content

To encrypt content, you can run the following command:

```bash
node encrypt.js encrypt --text="Hello, World!" --output=encrypted.txt --password=myPassword
```

This command will encrypt the text "Hello, World!" using the password "myPassword" and save the encrypted content to the file "encrypted.txt".

### Decrypting Content

To decrypt content, you can run the following command:

```bash
node encrypt.js decrypt --file=encrypted.txt --output=decrypted.txt --password=myPassword
```

This command will decrypt the content from the file "encrypted.txt" using the password "myPassword" and save the decrypted content to the file "decrypted.txt".

## Default Parameters

By default, the tool uses the following parameters:

- Encryption algorithm: `AES-256-CBC`
- Salt prefix: `"Salted__"`
- PBKDF2 algorithm: `sha256`
- PBKDF2 rounds: `10000`
- Encrypted content encoding: `base64`
- Unencrypted content encoding: `utf8`

## Interactive Mode

The tool supports both command-line and interactive modes. You can specify the input content and password as arguments or enter them interactively.

## License

This tool is licensed under the MIT License.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvement, please open an issue or submit a pull request.

## Contact

If you have any questions or need further assistance, you can reach out to me at [your_email@example.com](mailto:your_email@example.com).

I hope this helps! Let me know if you have any further questions.
