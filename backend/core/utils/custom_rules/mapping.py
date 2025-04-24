from collections.abc import Callable

from core.utils.custom_rules.constants import (
    DIGIT_REPEATS_AT_LEAST_TWICE,
    DIGIT_REPEATS_AT_LEAST_THRICE,
    DIGIT_REPEATS_AT_LEAST_FOURTH,
    DIGIT_REPEATS_AT_LEAST_FIFTH,
    DIGIT_IS_YEAR,
    DIGIT_IS_BINARY,
)
from core.utils.custom_rules.telegram_gifts import handle_telegram_gifts_type_category
from core.utils.custom_rules.telegram_numbers import (
    handle_telegram_numbers_length_category,
    handle_telegram_numbers_substring_category,
    handle_telegram_numbers_regex_match_category,
)
from core.enums.nft import (
    TelegramNumberCategory,
    NftCollectionCategoryType,
    TelegramUsernameCategory,
    TonDnsCategory,
    TelegramGiftsCategory,
)
from core.models.blockchain import NftItem
from core.utils.custom_rules.telegram_usernames import (
    handle_telegram_username_length_category,
)
from core.utils.custom_rules.ton_dns import handle_ton_dns_length_category

CATEGORY_TO_METHOD_MAPPING: dict[
    NftCollectionCategoryType, Callable[[list[NftItem]], list[NftItem]]
] = {
    # Telegram Numbers
    TelegramNumberCategory.DIGITS_7: handle_telegram_numbers_length_category(
        target_length=4
    ),
    TelegramNumberCategory.DIGITS_11: handle_telegram_numbers_length_category(
        target_length=8
    ),
    TelegramNumberCategory.CLUB_007: handle_telegram_numbers_substring_category(
        substring="007"
    ),
    TelegramNumberCategory.CLUB_69: handle_telegram_numbers_substring_category(
        substring="69"
    ),
    TelegramNumberCategory.CLUB_420: handle_telegram_numbers_substring_category(
        substring="420"
    ),
    TelegramNumberCategory.CLUB_666: handle_telegram_numbers_substring_category(
        substring="666"
    ),
    TelegramNumberCategory.CLUB_777: handle_telegram_numbers_substring_category(
        substring="777"
    ),
    TelegramNumberCategory.CLUB_888: handle_telegram_numbers_substring_category(
        substring="888"
    ),
    TelegramNumberCategory.CLUB_1337: handle_telegram_numbers_substring_category(
        substring="1337"
    ),
    TelegramNumberCategory.REPEAT_2: handle_telegram_numbers_regex_match_category(
        regex_pattern=DIGIT_REPEATS_AT_LEAST_TWICE,
    ),
    TelegramNumberCategory.REPEAT_3: handle_telegram_numbers_regex_match_category(
        regex_pattern=DIGIT_REPEATS_AT_LEAST_THRICE,
    ),
    TelegramNumberCategory.REPEAT_4: handle_telegram_numbers_regex_match_category(
        regex_pattern=DIGIT_REPEATS_AT_LEAST_FOURTH,
    ),
    TelegramNumberCategory.REPEAT_5: handle_telegram_numbers_regex_match_category(
        regex_pattern=DIGIT_REPEATS_AT_LEAST_FIFTH,
    ),
    TelegramNumberCategory.YEAR: handle_telegram_numbers_regex_match_category(
        regex_pattern=DIGIT_IS_YEAR,
    ),
    TelegramNumberCategory.CLUB_BINARY: handle_telegram_numbers_regex_match_category(
        regex_pattern=DIGIT_IS_BINARY,
    ),
    # Telegram Usernames
    TelegramUsernameCategory.LETTERS_4: handle_telegram_username_length_category(
        target_length=4
    ),
    TelegramUsernameCategory.LETTERS_5: handle_telegram_username_length_category(
        target_length=5
    ),
    TelegramUsernameCategory.LETTERS_6: handle_telegram_username_length_category(
        target_length=6
    ),
    TelegramUsernameCategory.LETTERS_7: handle_telegram_username_length_category(
        target_length=7
    ),
    TelegramUsernameCategory.LETTERS_8: handle_telegram_username_length_category(
        target_length=8
    ),
    TelegramUsernameCategory.LETTERS_9: handle_telegram_username_length_category(
        target_length=9
    ),
    TelegramUsernameCategory.LETTERS_10: handle_telegram_username_length_category(
        target_length=10
    ),
    TelegramUsernameCategory.LETTERS_11: handle_telegram_username_length_category(
        target_length=64
    ),
    # TON DNS
    TonDnsCategory.LETTERS_4: handle_ton_dns_length_category(target_length=4),
    TonDnsCategory.LETTERS_5: handle_ton_dns_length_category(target_length=5),
    TonDnsCategory.LETTERS_6: handle_ton_dns_length_category(target_length=6),
    TonDnsCategory.LETTERS_7: handle_ton_dns_length_category(target_length=7),
    TonDnsCategory.LETTERS_8: handle_ton_dns_length_category(target_length=8),
    TonDnsCategory.LETTERS_9: handle_ton_dns_length_category(target_length=9),
    TonDnsCategory.LETTERS_10: handle_ton_dns_length_category(target_length=10),
    TonDnsCategory.LETTERS_11: handle_ton_dns_length_category(target_length=128),
    # Gifts
    **{
        telegram_gift_category: handle_telegram_gifts_type_category(
            telegram_gift_category
        )
        for telegram_gift_category in TelegramGiftsCategory
    },
}
