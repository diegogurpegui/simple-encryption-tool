#!/bin/bash

function show_help() {
    echo "Usage: $0 [encrypt|decrypt] [options]"
    echo
    echo "It is recommended that you don't pass the password as an argument "
    echo "so it don't reside in memory."
    echo "If the input content is sensible, you might want to avoid passing it as argument,"
    echo "and instead enter it when asked."
    echo
    echo "Options:"
    echo "  -t, --text=<text>           Input text"
    echo "  -f, --file=<file>           Input file"
    echo "  -p, --password=<pass>       Password for encryption/decryption. "
    echo "                              If not specified, will be asked interactively."
    echo "  -o, --output=<file>         Output file (default: print to stdout)"
    echo "  --dec-encoding=<enc>        Encoding of the decrypted input/output (base64|utf8) (default: utf8)"
    echo "  -h, --help                  Show this help message"
    echo
    echo "Algorithms:"
    echo "  AES-256-CBC cipher"
    echo "  PBKDF2 for password hashing (default sha256, 10000 rounds)"
}

if [[ $# -eq 0 ]]; then
    show_help
    exit 1
fi

# Prepare variables from args
ACTION=""
PASSWORD=""
TEXT=""
FILE=""
OUTPUT=""
DEC_ENCODING="utf8"

while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        encrypt|decrypt)
            ACTION="$key"
            shift
            ;;
        -t)
            TEXT="$2"
            shift 2
            ;;
        -f)
            FILE="$2"
            shift 2
            ;;
        -p)
            PASSWORD="$2"
            shift 2
            ;;
        -o)
            OUTPUT="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        --)
            shift
            break
            ;;
        --*)
            long_option="${1#--}"
            if [[ "$long_option" == *=* ]]; then
                value="${long_option#*=}"
                long_option="${long_option%%=*}"
            else
                value="$2"
                shift
            fi
            case "$long_option" in
                text)
                    TEXT="$value"
                    ;;
                file)
                    FILE="$value"
                    ;;
                password)
                    PASSWORD="$value"
                    ;;
                output)
                    OUTPUT="$value"
                    ;;
                dec-encoding)
                    DEC_ENCODING="$value"
                    ;;
                *)
                    echo "Unknown option: $1"
                    show_help
                    exit 1
                    ;;
            esac
            shift
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# -- Validations
if [[ -z "$ACTION" ]]; then
    echo "Error: Action must be specified."
    show_help
    exit 1
fi

if [[ -n "$TEXT" && -n "$FILE" ]]; then
    echo "Error: Only one of text and file can be specified."
    show_help
    exit 1
fi

# -- Get content
if [[ -n "$FILE" ]]; then
    if [[ ! -f "$FILE" ]]; then
        echo "Error: Input file does not exist: $FILE"
        exit 1
    fi
    INPUT_CONTENT=$(cat "$FILE")
else
    INPUT_CONTENT="$TEXT"
fi

# Ask for the content interactively if not entered as arg
if [[ -z "$INPUT_CONTENT" ]]; then
    read -p "Enter content: " INPUT_CONTENT
fi

# -- Get password

# Ask for the password if not entered as arg
if [[ -z "$PASSWORD" ]]; then
    read -s -p "Enter password: " PASSWORD
    echo
fi

# -- Actions
if [[ "$ACTION" == "encrypt" ]]; then
    ENCRYPTED=$(echo -n "$INPUT_CONTENT" | openssl enc -aes-256-cbc -a -A -salt -pass pass:"$PASSWORD" -pbkdf2)
    OUTPUT_CONTENT="$ENCRYPTED"
elif [[ "$ACTION" == "decrypt" ]]; then
    DECRYPTED=$(echo "$INPUT_CONTENT" | openssl enc -aes-256-cbc -a -A -d -pass pass:"$PASSWORD" -pbkdf2)
    if [[ "$DEC_ENCODING" == "base64" ]]; then
        OUTPUT_CONTENT=$(echo -n "$DECRYPTED" | base64)
    else
        OUTPUT_CONTENT="$DECRYPTED"
    fi
else
    echo "Invalid action: $ACTION"
    show_help
    exit 1
fi

# -- Output
if [[ -n "$OUTPUT" ]]; then
    echo "$OUTPUT_CONTENT" > "$OUTPUT"
else
    echo "$OUTPUT_CONTENT"
fi

