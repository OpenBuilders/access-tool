import factory
from factory.alchemy import SQLAlchemyModelFactory


class BaseSQLAlchemyModelFactory(SQLAlchemyModelFactory):
    """Base factory for all SQLAlchemy models."""

    class Meta:
        abstract = True
        sqlalchemy_session_persistence = "flush"

    @classmethod
    def with_session(cls, session):
        """Return a factory class configured with the given session."""

        attrs = {}

        # Copy declarations (swap SubFactories)
        for attr_name, attr_value in cls._meta.declarations.items():
            if isinstance(attr_value, factory.SubFactory):
                factory_cls = attr_value.get_factory()
                if hasattr(factory_cls, "with_session"):
                    attrs[attr_name] = factory.SubFactory(
                        factory_cls.with_session(session)
                    )
                else:
                    attrs[attr_name] = attr_value
            else:
                attrs[attr_name] = attr_value

        # Build Meta dynamically
        class Meta:
            model = cls._meta.model
            sqlalchemy_session = session
            sqlalchemy_session_persistence = cls._meta.sqlalchemy_session_persistence

        attrs["Meta"] = Meta

        # Construct a new factory subclass
        return type(f"{cls.__name__}WithSession", (cls,), attrs)
