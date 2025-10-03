import factory

from core.models.rule import TelegramChatRuleGroup
from tests.factories.base import BaseSQLAlchemyModelFactory


class TelegramChatRuleGroupFactory(BaseSQLAlchemyModelFactory):
    class Meta:
        model = TelegramChatRuleGroup
        sqlalchemy_session_persistence = "flush"

    id = factory.Sequence(lambda n: n + 1)
    chat_id = factory.SelfAttribute("chat.id")
    chat = factory.SubFactory("tests.factories.chat.TelegramChatFactory")
    order = factory.Sequence(lambda n: n + 1)
    created_at = factory.Faker("date_time_this_year")
