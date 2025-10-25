import logging

from sqlalchemy.orm import Session

from core.services.jetton import JettonService
from indexer.dtos.dyor import VerificationStatus, DyorJettonInfoResponse
from indexer.indexers.dyor import DyorIndexer


VALID_VERIFICATION_STATUSES = (
    VerificationStatus.JVS_APPROVED,
    VerificationStatus.JVS_COMMUNITY_APPROVED,
    VerificationStatus.JVS_VERIFIED,
)
MINIMUM_HOLDERS_COUNT_THRESHOLD = 100
JETTONS_BATCH_UPDATE_SIZE = 20

logger = logging.getLogger(__name__)


class PriceIndexerAction:
    def __init__(self, db_session: Session) -> None:
        self.db_session = db_session


class JettonPriceIndexerAction(PriceIndexerAction):
    def __init__(self, db_session: Session) -> None:
        super().__init__(db_session=db_session)
        self.jetton_service = JettonService(db_session=db_session)
        self.indexer = DyorIndexer()

    @staticmethod
    def _validate_jetton_status(jetton_info: DyorJettonInfoResponse) -> bool:
        """
        Validates the jetton status against predefined criteria. The function checks whether the
        jetton satisfies the minimum holders count threshold and whether its verification status
        is among the valid statuses. If any of these criteria are not met, the function logs a
        warning with specific details and returns False. Otherwise, it returns True.

        :param jetton_info: Information about the jetton to be validated.
        :return: True if the jetton satisfies the validation criteria, otherwise False.
        """
        if jetton_info.details.holders_count < MINIMUM_HOLDERS_COUNT_THRESHOLD:
            logger.warning(
                f"Jetton {jetton_info.details.metadata.address} doesn't meet criteria. "
                f"It has {jetton_info.details.holders_count} holders, "
                f"while {MINIMUM_HOLDERS_COUNT_THRESHOLD} is required"
            )
            return False

        elif jetton_info.details.verification not in VALID_VERIFICATION_STATUSES:
            logger.warning(
                f"Jetton {jetton_info.details.metadata.address} doesn't meet criteria. "
                f"It has {jetton_info.details.verification} status, "
                f"white any of {VALID_VERIFICATION_STATUSES} is required"
            )
            return False

        return True

    async def refresh_jettons_price(self) -> None:
        """
        Asynchronously refreshes the prices of jettons by fetching their latest information
        and updates the database. The method processes all whitelisted jettons available in
        the service, validates their status, and updates prices in batches for efficiency.
        Commits changes to the database after processing all jetton prices and logs the process.
        """
        all_jettons = self.jetton_service.get_all(whitelisted_only=True)
        update_batch: dict[str, float] = {}
        for jetton in all_jettons:
            jetton_info = await self.indexer.get_jetton_info(jetton.address)

            if not self._validate_jetton_status(jetton_info):
                continue

            logger.info(
                f"Got new price for {jetton.name=}: {jetton_info.details.price_usd.value}"
            )
            update_batch[jetton.address] = jetton_info.details.price_usd.value

            if len(update_batch) >= JETTONS_BATCH_UPDATE_SIZE:
                self.jetton_service.batch_update_prices(update_batch)
                update_batch = {}

        # Ensure all jettons are updated, including the last batch
        self.jetton_service.batch_update_prices(update_batch)
        self.db_session.commit()
        logger.info("Successfully refreshed jettons prices")
