from pathlib import Path

from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric.types import PrivateKeyTypes
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.serialization import load_pem_private_key
from cryptography.hazmat.backends import default_backend


def load_private_key(file_path: str | Path) -> PrivateKeyTypes:
    """Reads and loads the RSA private key from a PEM file."""
    with open(file_path, "rb") as key_file:
        private_key = load_pem_private_key(
            key_file.read(),
            password=None,  # Add a password here if the key is password-protected
            backend=default_backend(),
        )
    return private_key


def rsa_decrypt_wrapped_dek(wrapped_dek: bytes, private_key: PrivateKeyTypes) -> bytes:
    """Decrypt the wrapped DEK using RSA private key."""
    decrypted_dek = private_key.decrypt(
        wrapped_dek,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )
    return decrypted_dek


def aes_decrypt(nonce: bytes, ciphertext: bytes, dek: bytes, tag: bytes) -> bytes:
    """Decrypt AES-GCM encrypted data."""
    # Create AES cipher
    cipher = Cipher(
        algorithms.AES(dek), modes.GCM(nonce, tag=tag), backend=default_backend()
    )
    decryptor = cipher.decryptor()

    # Decrypt the ciphertext
    plaintext = decryptor.update(ciphertext) + decryptor.finalize()
    return plaintext
