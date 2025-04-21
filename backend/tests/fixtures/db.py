from collections.abc import Iterator

import pytest
from factory.alchemy import SQLAlchemyModelFactory
from sqlalchemy import create_engine, text, Engine
from sqlalchemy.orm import sessionmaker, Session
from core.db import Base
from core.settings import core_settings

from tests.factories import *  # noqa


@pytest.fixture(scope="session")
def db_engine() -> Iterator[Engine]:
    """
    Creates a database engine fixture for use within the test session.

    This fixture sets up a MySQL database engine connected to a test database. The
    test database is created at the beginning of the test session and destroyed
    after all tests have completed. Before the test database is set up, a root
    engine with no database context is used to ensure that the test database exists.
    Once the test database is created, all database tables are created based on
    defined SQLAlchemy models. After the test session ends, the test database is
    dropped to clean up.

    The `db_engine` yields a single `Engine` instance that can be reused across
    all tests in the session.

    :return: An SQLAlchemy `Engine` object connected to the test database.
    """
    # Use the MySQL Docker service and root engine with no database context
    #  to create the test database first
    connection_url = f"mysql+mysqlconnector://root:{core_settings.mysql_root_password}@{core_settings.mysql_host}:{core_settings.mysql_port}"
    root_engine = create_engine(connection_url)
    with root_engine.connect() as connection:
        connection.execute(text("CREATE DATABASE IF NOT EXISTS gateway_test"))
    # Create all tables at the beginning of the test session using the test database context
    engine = create_engine(f"{connection_url}/gateway_test?charset=utf8mb4")
    Base.metadata.create_all(engine)
    try:
        yield engine
    finally:
        # Dispose of the engine after the session
        engine.dispose()
        # After all tests are finished - remove the test database
        with root_engine.connect() as connection:
            connection.execute(text("DROP DATABASE gateway_test"))


@pytest.fixture(scope="function")
def db_session(db_engine: Engine) -> Iterator[Session]:
    """
    This fixture provides a database session suitable for testing purposes. It ensures that
    each test starts with a clean session by creating a new transaction and rolling it back
    afterward. The fixture also patches SQLAlchemy model factories with this session, allowing
    them to use the same session during tests.

    :param db_engine: The database engine instance is used to establish a connection for the
                      session.
    :return: An SQLAlchemy session for testing, with a transaction that is rolled back after
            test execution.
    """
    connection = db_engine.connect()
    transaction = connection.begin()  # Start a transaction
    session = sessionmaker(bind=connection, expire_on_commit=False)()

    # Factories should be patched with a created session
    for factory in SQLAlchemyModelFactory.__subclasses__():
        factory._meta.sqlalchemy_session = session

    yield session  # Run the test with the session

    # Roll back the transaction and close the session after the test
    session.close()
    transaction.rollback()
    connection.close()
