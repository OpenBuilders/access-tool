# This service is not currently used because it's impossible to automate Telegram Signup with Telethon
import asyncio
import logging
import re
import time

import httpx
from pydantic import BaseModel

RECEIVE_SMS_TIMEOUT = 60
ORDER_NUMBER_REGEX = re.compile(
    r"^ORDER_ID_(?P<order_id>\d+)_NUMBER_(?P<phone_number>.+>)$"
)
SUCCESS_SMS_CODE_REGEX = re.compile(r"^SUCCESS_.*(?P<code>\d{5}).*$")
logger = logging.getLogger(__name__)


class SuccessfulOrder(BaseModel):
    order_id: int
    phone_number: str


class JuicySMS:
    api_key: str
    base_url: str = "https://juicysms.com/api"
    service_id: int = 5  # Check JuicySMS main page
    country: str = "NL"  # Check JuicySMS for options
    client: httpx.AsyncClient = httpx.AsyncClient()

    def __init__(self, api_key: str) -> None:
        self.api_key = api_key

    async def make_order(self) -> SuccessfulOrder:
        """
        Creates an order using the client and parses the response to extract order details.

        This method sends an asynchronous HTTP GET request to the `makeorder` endpoint using
        the provided client. The request includes certain parameters such as API key,
        service ID, and country. The function validates the response and extracts the
        order ID and phone number from the response using a predefined regex pattern. If
        the response cannot be parsed, an exception is raised. If successful, it returns
        a `SuccessfulOrder` object containing the parsed order details.

        :raises ValueError: If the response does not contain a valid order number.
        :return: An instance of `SuccessfulOrder` containing `order_id` and `phone_number`.
        """
        async with self.client as client:
            response = await client.get(
                f"{self.base_url}/makeorder",
                params={
                    "key": self.api_key,
                    "serviceId": self.service_id,
                    "country": self.country,
                },
            )
        response.raise_for_status()
        if not (matched := ORDER_NUMBER_REGEX.match(response.text)):
            logger.error(f"Could not parse order number from response: {response.text}")
            raise ValueError(
                f"Could not parse order number from response: {response.text}"
            )

        groups = matched.groupdict()
        order_id = groups["order_id"]
        phone_number = groups["phone_number"]

        logger.info(
            f"Successfully created order {order_id!r} for phone number {phone_number!r}"
        )

        return SuccessfulOrder(order_id=order_id, phone_number=phone_number)

    async def _get_sms(self, order_id: int) -> str:
        """
        Retrieves SMS content for a given order ID from an external service. The method continuously
        polls the external service until a valid SMS content starting with "SUCCESS" is received
        or the timeout limit is reached. In case the timeout exceeds, an exception is raised.

        The SMS content returned is used for further processing and is fetched asynchronously.

        :param order_id: The ID of the order for which the SMS content is being retrieved.
        :return: The SMS content starting with the text "SUCCESS".
        :raises ValueError: If the SMS content could not be retrieved within the timeout period.
        """
        content = ""
        start_time = time.time()
        async with self.client as client:
            while not content.startswith("SUCCESS"):
                response = await client.get(
                    f"{self.base_url}/getsms",
                    params={"key": self.api_key, "orderId": order_id},
                )
                response.raise_for_status()
                content = response.text
                if time.time() - start_time > RECEIVE_SMS_TIMEOUT:
                    logger.error(f"Could not receive SMS for order {order_id!r}")
                    raise ValueError(f"Could not receive SMS for order {order_id!r}")
                await asyncio.sleep(1)
        return content

    async def get_confirmation_code(self, order_details: SuccessfulOrder) -> str:
        """
        Fetches the confirmation code from an SMS content for a given order.

        This asynchronous method retrieves an SMS message corresponding to the given
        order and extracts the confirmation code if successfully matched using a predefined
        regular expression.

        :param order_details: Details of the successful order including order ID and phone
            number associated with the order.

        :return: The extracted confirmation code from the SMS content.

        :raises ValueError: If the SMS content cannot be parsed to extract a valid confirmation
            code according to the predefined regular expression.
        """
        sms_content = await self._get_sms(order_details.order_id)

        if not (matched := SUCCESS_SMS_CODE_REGEX.match(sms_content)):
            logger.error(f"Could not parse SMS code from response: {sms_content}")
            raise ValueError(f"Could not parse SMS code from response: {sms_content}")

        groups = matched.groupdict()
        code = groups["code"]
        logger.info(
            f"Successfully received SMS code {code!r} "
            f"for number {order_details.phone_number!r} "
            f"order {order_details.order_id!r}"
        )

        return code
