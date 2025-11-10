import hashlib
import logging
import time

from nacl.signing import VerifyKey
from nacl.encoding import Base64Encoder

from core.constants import TON_PRICE_CACHE_KEY
from core.dtos.wallet import WalletDetailsWithProofDTO
from core.exceptions.wallet import ProofValidationError
from core.services.superredis import RedisService

logger = logging.getLogger(__name__)


class TonProofService:
    ton_proof_prefix = "ton-proof-item-v2/"
    ton_connect_prefix = "ton-connect"
    valid_auth_time = 15 * 60  # 15 minutes

    @classmethod
    def verify_ton_proof(cls, wallet_details: WalletDetailsWithProofDTO) -> None:
        """
        Verify the ton_proof signature.

        :param wallet_details: wallet details with proof
        :return: True if the proof is valid, False otherwise
        :raises ProofValidationError: if the proof is invalid
        """
        # Extract proof components
        timestamp = wallet_details.ton_proof.timestamp
        domain = wallet_details.ton_proof.domain
        signature_b64 = wallet_details.ton_proof.signature
        payload = wallet_details.ton_proof.payload

        # 2. Check the timestamp
        current_time = int(time.time())
        if abs(current_time - timestamp) > cls.valid_auth_time:
            msg = "Timestamp is not within the valid range."
            logger.error(msg)
            raise ProofValidationError(msg)

        # 3. Construct the message
        domain_length = domain.length_bytes.to_bytes(4, "little")
        domain_value = domain.value.encode("utf-8")
        timestamp_bytes = timestamp.to_bytes(8, "little")
        payload_bytes = payload.encode("utf-8")

        workchain, address = wallet_details.wallet_address.split(":")
        workchain_id = int(workchain)
        workchain_bytes = workchain_id.to_bytes(4, byteorder="big", signed=True)
        address_bytes = bytes.fromhex(address)

        message = (
            cls.ton_proof_prefix.encode("utf-8")
            + workchain_bytes
            + address_bytes
            + domain_length
            + domain_value
            + timestamp_bytes
            + payload_bytes
        )

        # 4. Hash the message
        message_hash = hashlib.sha256(message).digest()

        # 5. Prepare the data for signature verification
        full_message = (
            b"\xff\xff" + cls.ton_connect_prefix.encode("utf-8") + message_hash
        )

        final_hash = hashlib.sha256(full_message).digest()

        # 6. Verify the signature
        try:
            public_key = VerifyKey(bytes.fromhex(wallet_details.public_key))
            signature = Base64Encoder.decode(signature_b64.encode())
            public_key.verify(final_hash, signature)
        except Exception as e:
            msg = f"Proof is invalid: {e}"
            logger.error(msg)
            raise ProofValidationError(msg) from e


class TonPriceManager:
    def __init__(self) -> None:
        self.redis_service = RedisService()

    def get_ton_price(self) -> float | None:
        try:
            # Handle Redis service unavailability gracefully
            raw_value = self.redis_service.get(TON_PRICE_CACHE_KEY)
            if raw_value is None:
                logger.warning("TON price is not cached yet.")
                return None

            return float(raw_value)
        except Exception as e:
            logger.error("Failed to get TON price: %s", e)
            return None

    def set_ton_price(self, price: float) -> None:
        self.redis_service.set(TON_PRICE_CACHE_KEY, str(price))
