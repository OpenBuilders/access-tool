import logging

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.orm import Session
from starlette.status import HTTP_404_NOT_FOUND

from core.actions.chat.base import ManagedChatBaseAction
from core.dtos.chat.rule.whitelist import (
    WhitelistRuleDTO,
    WhitelistRuleExternalDTO,
    CreateTelegramChatWhitelistExternalSourceDTO,
    UpdateTelegramChatWhitelistExternalSourceDTO,
    CreateTelegramChatWhitelistDTO,
    UpdateTelegramChatWhitelistDTO,
)
from core.exceptions.rule import TelegramChatRuleExists
from core.models.rule import TelegramChatWhitelistExternalSource, TelegramChatWhitelist
from core.models.user import User
from core.services.chat.rule.whitelist import (
    TelegramChatExternalSourceService,
    TelegramChatWhitelistService,
)

logger = logging.getLogger(__name__)


class TelegramChatWhitelistExternalSourceAction(ManagedChatBaseAction):
    def __init__(self, db_session: Session, requestor: User, chat_slug: str) -> None:
        super().__init__(
            db_session=db_session, requestor=requestor, chat_slug=chat_slug
        )
        self.telegram_chat_external_source_service = TelegramChatExternalSourceService(
            db_session
        )

    def set_content(
        self, rule: TelegramChatWhitelistExternalSource, content: list[int]
    ) -> WhitelistRuleExternalDTO:
        external_source = self.telegram_chat_external_source_service.set_content(
            rule=rule, content=content
        )
        logger.info(f"External source {rule.id!r} updated successfully")
        return WhitelistRuleExternalDTO.from_orm(external_source)

    def get(self, rule_id: int) -> WhitelistRuleExternalDTO:
        external_source = self.telegram_chat_external_source_service.get(
            chat_id=self.chat.id, id_=rule_id
        )
        return WhitelistRuleExternalDTO.from_orm(external_source)

    async def create(
        self,
        group_id: int | None,
        url: str,
        name: str,
        description: str | None,
        auth_key: str | None,
        auth_value: str | None,
    ) -> WhitelistRuleExternalDTO:
        """
        Creates a new external source for a chat and validates it. If validation fails, rolls
        back the database transaction.

        :param group_id: The identifier of the group to which the external source belongs.
        :param url: The URL of the external source to be added.
        :param name: The name of the external source.
        :param description: An optional description of the external source.
        :param auth_key: An authentication key for the external source.
        :param auth_value: An authentication value for the external source.
        :return: An instance of WhitelistRuleExternalDTO representing the created external source.

        :raises TelegramChatInvalidExternalSourceError: If the external source is invalid.
        """
        group_id = self.resolve_group_id(group_id=group_id)

        try:
            external_source = self.telegram_chat_external_source_service.create(
                CreateTelegramChatWhitelistExternalSourceDTO(
                    chat_id=self.chat.id,
                    group_id=group_id,
                    url=url,
                    name=name,
                    description=description,
                    auth_key=auth_key,
                    auth_value=auth_value,
                    is_enabled=True,
                ),
            )
        except IntegrityError as e:
            message = f"External source rule already exists for chat {self.chat.id!r} with url {url!r}. "
            logger.warning(message, exc_info=e)
            raise TelegramChatRuleExists(message) from e
        try:
            result = await self.telegram_chat_external_source_service.validate_external_source(
                source=external_source, raise_for_error=True
            )
        except Exception as e:
            logger.warning(
                "Rolling back transaction as an error occurred while validating the source"
            )
            self.db_session.rollback()
            raise e

        # We could safely set the content, and no action will be required, since it's a creation action
        self.set_content(rule=external_source, content=result.current)

        logger.info(f"External source {external_source.id!r} created successfully")
        # No need for a manual commit, as it's already done in the service during set_content
        return WhitelistRuleExternalDTO.from_orm(external_source)

    async def update(
        self,
        rule_id: int,
        url: str,
        name: str,
        description: str | None,
        auth_key: str | None,
        auth_value: str | None,
        is_enabled: bool,
    ) -> WhitelistRuleExternalDTO:
        """
        Updates an external source for a given chat rule. This method updates the external
        source details such as the URL, name, description, and enables or disables the source
        based on the provided parameters. Additionally, it commits changes or rolls back the
        transaction if an error occurs during the validation of the source.

        :param rule_id: The unique identifier of the rule being updated.
        :param url: The URL of the external source to be updated.
        :param name: The name of the external source being updated.
        :param description: An optional description of the external source.
        :param auth_key: An authentication key for the external source.
        :param auth_value: An authentication value for the external source.
        :param is_enabled: A flag indicating whether the external source should be enabled or
            disabled.
        :return: An instance of `WhitelistRuleExternalDTO` containing the updated external
            source details.

        :raises TelegramChatInvalidExternalSourceError: If the external source is invalid.
        """
        try:
            rule = self.telegram_chat_external_source_service.get(
                chat_id=self.chat.id, id_=rule_id
            )
        except IntegrityError as e:
            message = f"External source rule {rule_id!r} does not exist for chat {self.chat.id!r}. "
            logger.warning(message, exc_info=e)
            raise HTTPException(detail=message, status_code=HTTP_404_NOT_FOUND) from e

        external_source = self.telegram_chat_external_source_service.update(
            rule=rule,
            dto=UpdateTelegramChatWhitelistExternalSourceDTO(
                url=url,
                name=name,
                description=description,
                auth_key=auth_key,
                auth_value=auth_value,
                is_enabled=is_enabled,
            ),
        )
        if is_enabled:
            # No need for a manual commit, as it's already done in the service during set_content
            try:
                await (
                    self.telegram_chat_external_source_service.validate_external_source(
                        source=external_source, raise_for_error=True
                    )
                )
            except Exception as e:
                logger.warning(
                    "Rolling back transaction as an error occurred while validating the source"
                )
                self.db_session.rollback()
                raise e
        else:
            self.db_session.commit()

        # Update should be handled by an async task to ensure that it'll kick all ineligible users.
        # There COULD be a slight delay, but external sources are updated every 10 minutes,
        # so the delay should not take more than 10 minutes
        logger.info(f"External source {rule_id!r} updated successfully")
        return WhitelistRuleExternalDTO.from_orm(external_source)

    async def delete(self, rule_id: int) -> None:
        try:
            group_id = self.telegram_chat_external_source_service.get(
                chat_id=self.chat.id, id_=rule_id
            ).group_id
        except NoResultFound:
            message = f"External source rule {rule_id!r} does not exist for chat {self.chat.id!r}. "
            raise HTTPException(detail=message, status_code=HTTP_404_NOT_FOUND)
        self.telegram_chat_external_source_service.delete(
            chat_id=self.chat.id, rule_id=rule_id
        )
        logger.info(f"External source {rule_id!r} deleted successfully")
        self.remove_group_if_empty(group_id=group_id)


class TelegramChatWhitelistAction(ManagedChatBaseAction):
    def __init__(self, db_session: Session, requestor: User, chat_slug: str) -> None:
        super().__init__(
            db_session=db_session,
            requestor=requestor,
            chat_slug=chat_slug,
        )
        self.telegram_chat_whitelist_service = TelegramChatWhitelistService(db_session)

    def get(self, rule_id: int) -> WhitelistRuleDTO:
        whitelist = self.telegram_chat_whitelist_service.get(
            chat_id=self.chat.id, id_=rule_id
        )
        return WhitelistRuleDTO.from_orm(whitelist)

    def create(
        self, group_id: int | None, name: str, description: str | None = None
    ) -> WhitelistRuleDTO:
        group_id = self.resolve_group_id(group_id=group_id)

        whitelist = self.telegram_chat_whitelist_service.create(
            CreateTelegramChatWhitelistDTO(
                group_id=group_id,
                name=name,
                description=description,
                is_enabled=True,
                chat_id=self.chat.id,
            ),
        )
        logger.info(f"Whitelist {whitelist.id!r} created successfully")
        return WhitelistRuleDTO.from_orm(whitelist)

    def update(
        self, rule_id: int, name: str, description: str | None, is_enabled: bool
    ) -> WhitelistRuleDTO:
        try:
            rule = self.telegram_chat_whitelist_service.get(
                chat_id=self.chat.id, id_=rule_id
            )
        except IntegrityError as e:
            message = (
                f"Whitelist rule {rule_id!r} does not exist for chat {self.chat.id!r}. "
            )
            logger.warning(message, exc_info=e)
            raise HTTPException(detail=message, status_code=HTTP_404_NOT_FOUND) from e

        whitelist = self.telegram_chat_whitelist_service.update(
            rule=rule,
            dto=UpdateTelegramChatWhitelistDTO(
                name=name,
                description=description,
                is_enabled=is_enabled,
            ),
        )
        logger.info(f"Whitelist {rule_id!r} updated successfully")
        return WhitelistRuleDTO.from_orm(whitelist)

    async def set_content(self, rule_id: int, content: list[int]) -> WhitelistRuleDTO:
        """
        Updates the content of a whitelist rule in a Telegram chat. This method checks if the
        content has already been set. If the content exists, it raises an exception, as modifying
        existing whitelist content is not allowed. The update of content is to be managed by
        an asynchronous task to ensure proper handling of ineligible users.

        .. note::
           There could be a slight delay in processing the asynchronous task, but it is expected
           not to exceed 10 minutes as the external sources are refreshed every 10 minutes.

        :param rule_id: The identifier of the whitelist rule to be updated.
        :param content: The list of integers representing the new content to be set in the whitelist.
        :return: A data transfer object (DTO) representing the updated whitelist rule.
        """
        rule: TelegramChatWhitelist = self.telegram_chat_whitelist_service.get(
            chat_id=self.chat.id, id_=rule_id
        )
        whitelist = self.telegram_chat_whitelist_service.set_content(
            rule=rule, content=content
        )
        # FIXME: Move this to the community-manager-tasks worker to avoid calling Telegram synchronously
        #  It'll probably require new queue of users to be added so that hardcoded whitelists
        #  could also be refreshed, and non-eligible users could be kicked
        # difference = WhitelistRuleItemsDifferenceDTO(
        #     previous=rule.content,
        #     current=content,
        # )
        #
        # if difference.removed:
        #     chat_members = self.telegram_chat_user_service.get_all(
        #         user_ids=difference.removed
        #     )
        #     authorization_action = AuthorizationAction(self.db_session)
        #     await authorization_action.kick_ineligible_chat_members(
        #         chat_members=chat_members
        #     )

        logger.info(f"Whitelist {rule_id!r} updated successfully")
        return WhitelistRuleDTO.from_orm(whitelist)

    async def delete(self, rule_id: int) -> None:
        try:
            group_id = self.telegram_chat_whitelist_service.get(
                chat_id=self.chat.id, id_=rule_id
            ).group_id
        except NoResultFound:
            message = (
                f"Whitelist rule {rule_id!r} does not exist for chat {self.chat.id!r}. "
            )
            raise HTTPException(detail=message, status_code=HTTP_404_NOT_FOUND)
        self.telegram_chat_whitelist_service.delete(
            chat_id=self.chat.id,
            rule_id=rule_id,
        )
        logger.info(f"Whitelist {rule_id!r} deleted successfully")
        self.remove_group_if_empty(group_id=group_id)
