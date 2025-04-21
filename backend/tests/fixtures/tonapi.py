import pytest
from pytonapi.schema._address import Address
from pytonapi.schema.jettons import JettonInfo, JettonMetadata, JettonVerificationType


@pytest.fixture()
def dummy_jetton_address() -> Address:
    return Address("0:0000000000000000000000000000000000000000000000000000000000000001")


@pytest.fixture
def dummy_jetton_info(dummy_jetton_address: Address) -> JettonInfo:
    return JettonInfo(
        mintable=True,
        total_supply="1000",
        admin=None,
        metadata=JettonMetadata(
            address=dummy_jetton_address, name="Test Jetton", symbol="JET", decimals="9"
        ),
        verification=JettonVerificationType.none,
        holders_count=1,
    )
