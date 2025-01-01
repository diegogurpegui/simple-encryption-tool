import sys
import getpass
from pathlib import Path
import base64
import secrets
from hashlib import pbkdf2_hmac
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

# Constants
ENCRYPTION_ALGO = "aes-256-cbc"
SALT_PREFIX = b"Salted__"
KEY_LENGTH = 32
PBKDF2_ROUNDS = 10000

def show_help():
    print("Usage: python encrypt.py [encrypt|decrypt] [options]")
    print("")
    print("Options:")
    print("  --text=<text>           Input text")
    print("  --file=<file>           Input file")
    print("  --password=<pass>       Password for encryption/decryption")
    print("  --output=<file>         Output file (default: print to stdout)")
    print("  --help                  Show this help message")

def parse_args():
    args = sys.argv[1:]
    if not args or '--help' in args:
        show_help()
        sys.exit(1)
        
    action = args[0]
    options = {}
    
    for arg in args[1:]:
        if arg.startswith('--'):
            if '=' in arg:
                key, value = arg[2:].split('=', 1)
                options[key] = value.strip()
            else:
                options[arg[2:]] = True
                
    return action, options

def derive_key_and_iv(password: str, salt: bytes) -> tuple[bytes, bytes]:
    derived = pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt,
        PBKDF2_ROUNDS,
        KEY_LENGTH + 16
    )
    return derived[:KEY_LENGTH], derived[KEY_LENGTH:]

def encrypt(content: str, password: str) -> str:
    salt = secrets.token_bytes(8)
    key, iv = derive_key_and_iv(password, salt)
    
    cipher = Cipher(
        algorithms.AES(key),
        modes.CBC(iv),
        backend=default_backend()
    )
    encryptor = cipher.encryptor()
    
    content_bytes = content.encode('utf-8')
    padding_length = 16 - (len(content_bytes) % 16)
    padded_content = content_bytes + bytes([padding_length] * padding_length)
    
    encrypted_content = encryptor.update(padded_content) + encryptor.finalize()
    final_buffer = SALT_PREFIX + salt + encrypted_content
    
    return base64.b64encode(final_buffer).decode('utf-8')

def decrypt(encrypted: str, password: str) -> str:
    buffer = base64.b64decode(encrypted)
    
    salt = buffer[len(SALT_PREFIX):16]
    encrypted_content = buffer[16:]
    
    key, iv = derive_key_and_iv(password, salt)
    
    cipher = Cipher(
        algorithms.AES(key),
        modes.CBC(iv),
        backend=default_backend()
    )
    decryptor = cipher.decryptor()
    
    decrypted_content = decryptor.update(encrypted_content) + decryptor.finalize()
    padding_length = decrypted_content[-1]
    unpadded_content = decrypted_content[:-padding_length]
    
    return unpadded_content.decode('utf-8')

def get_input_content(options: dict) -> str:
    if 'file' in options:
        return Path(options['file']).read_text()
    if 'text' in options:
        return options['text']
    return input("Enter content: ")

def get_password(options: dict) -> str:
    if 'password' in options:
        return options['password']
    return getpass.getpass("Enter password: ")

def main():
    action, options = parse_args()
    
    content = get_input_content(options)
    password = get_password(options)
    
    if action == 'encrypt':
        output = encrypt(content, password)
    elif action == 'decrypt':
        output = decrypt(content, password)
    else:
        show_help()
        sys.exit(1)
    
    if 'output' in options:
        Path(options['output']).write_text(output)
    else:
        print(output)

if __name__ == '__main__':
    main()