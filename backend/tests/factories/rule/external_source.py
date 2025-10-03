import factory

from core.models.rule import TelegramChatWhitelistExternalSource
from tests.factories.rule.base import TelegramChatRuleBaseFactory


class TelegramChatWhitelistExternalSourceFactory(TelegramChatRuleBaseFactory):
    class Meta:
        abstract = False
        model = TelegramChatWhitelistExternalSource
        sqlalchemy_session_persistence = "flush"

    url = factory.Faker("url")
    name = factory.Faker("pystr")
