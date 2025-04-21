import pytest
from factory.alchemy import SQLAlchemyModelFactory
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from core.db import Base
from core.settings import core_settings


from tests.factories import *  # noqa


# pytest fixture to create the engine
@pytest.fixture(scope="session")
def db_engine():
    # Use the MySQL Docker service
    connection_url = f"mysql+mysqlconnector://root:{core_settings.mysql_root_password}@{core_settings.mysql_host}:{core_settings.mysql_port}"
    root_engine = create_engine(connection_url)
    with root_engine.connect() as connection:
        connection.execute(text("CREATE DATABASE IF NOT EXISTS gateway_test"))
    # Create all tables at the beginning of the test session
    engine = create_engine(f"{connection_url}/gateway_test?charset=utf8mb4")
    Base.metadata.create_all(engine)
    try:
        yield engine
    finally:
        # Dispose of the engine after the session
        engine.dispose()
        with root_engine.connect() as connection:
            connection.execute(text("DROP DATABASE gateway_test"))


# pytest fixture for managing database sessions with rollback
@pytest.fixture(scope="function")
def db_session(db_engine):
    # Create a new session
    connection = db_engine.connect()
    transaction = connection.begin()  # Start a transaction
    Session = sessionmaker(bind=connection, expire_on_commit=False)
    session = Session()

    for factory in SQLAlchemyModelFactory.__subclasses__():
        factory._meta.sqlalchemy_session = session

    yield session  # Run the test with the session

    # Roll back the transaction and close the session
    session.close()
    transaction.rollback()
    connection.close()
