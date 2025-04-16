import enum
from typing import Self


class NftCollectionAsset(enum.StrEnum):
    """
    List of predefined collection assets for which custom rules will be applied.
    """

    TELEGRAM_USERNAME = "Telegram Usernames"
    TELEGRAM_NUMBER = "Telegram Numbers"
    TON_DNS = "TON DNS"
    TELEGRAM_GIFTS = "Telegram Gifts"

    @classmethod
    def from_string(cls, value: str) -> Self | None:
        """
        ;tldr - simple str to enum conversion

        Parses a string into an instance of the class if the string matches a valid
        value of any member of the class. If no match is found, it returns None.

        :param value: A string that may correspond to a class member value.
        :return: An instance of the class representing the matched value if found,
            otherwise None.
        """
        if value in (i.value for i in cls.__members__.values()):
            return cls(value)

        return None


class TelegramUsernameCategory(enum.StrEnum):
    LETTERS_4 = "4 letters"
    LETTERS_5 = "5 letters"
    LETTERS_6 = "6 letters"
    LETTERS_7 = "7 letters"
    LETTERS_8 = "8 letters"
    LETTERS_9 = "9 letters"
    LETTERS_10 = "10 letters"
    LETTERS_11 = "11+ letters"


class TelegramNumberCategory(enum.StrEnum):
    DIGITS_7 = "7 digits"
    DIGITS_11 = "11 digits"


class TonDnsCategory(enum.StrEnum):
    LETTERS_4 = "4 letters"
    LETTERS_5 = "5 letters"
    LETTERS_6 = "6 letters"
    LETTERS_7 = "7 letters"
    LETTERS_8 = "8 letters"
    LETTERS_9 = "9 letters"
    LETTERS_10 = "10 letters"
    LETTERS_11 = "11+ letters"


class TelegramGiftsCategory(enum.StrEnum):
    PLUSH_PEPES = "Plush Pepes"
    DUROVS_CAPS = "Durov's Caps"
    SWISS_WATCHES = "Swiss Watches"
    # TODO: provide all details and uncomment
    # TOY_BEARS = "Toy Bears"
    # LOOT_BAGS = "Loot Bags"
    # PRECIOUS_PEACHES = "Precious Peaches"
    # ION_GEMS = "Ion Gems"
    # VINTAGE_CIGARS = "Vintage Cigars"
    # SIGNET_RINGS = "Signet Rings"
    # SCARED_CATS = "Scared Cats"
    # NEKO_HELMETS = "Neko Helmets"
    # DIAMOND_RINGS = "Diamond Rings"
    # ASTRAL_SHARDS = "Astral Shards"
    # TOP_HATS = "Top Hats"
    # HOMEMADE_CAKES = "Homemade Cakes"
    # LOL_POPS = "Lol Pops"
    # SPY_AGARICS = "Spy Agarics"
    # VOODOO_DOLLS = "Voodoo Dolls"
    # MINI_OSCARS = "Mini Oscars"
    # GENIE_LAMPS = "Genie Lamps"
    # WITCH_HATS = "Witch Hats"
    # GINGER_COOKIES = "Ginger Cookies"
    # DESK_CALENDARS = "Desk Calendars"
    EVIL_EYES = "Evil Eyes"
    # LOVE_POTIONS = "Love Potions"
    # SAKURA_FLOWERS = "Sakura Flowers"
    # JELLY_BUNNIES = "Jelly Bunnies"
    # TAMA_GADGETS = "Tama Gadgets"
    # PARTY_SPARKLERS = "Party Sparklers"
    # HEX_POTS = "Hex Pots"
    # KISSED_FROGS = "Kissed Frogs"
    # STAR_NOTEPADS = "Star Notepads"
    # SHARP_TONGUES = "Sharp Tongues"
    # HANGING_STARS = "Hanging Stars"
    # PERFUME_BOTTLES = "Perfume Bottles"
    # LUNAR_SNAKES = "Lunar Snakes"
    # SNOW_GLOBES = "Snow Globes"
    # WINTER_WREATHS = "Winter Wreaths"
    # ETERNAL_ROSES = "Eternal Roses"
    # B_DAY_CANDLES = "B-Day Candles"
    # FLYING_BROOMS = "Flying Brooms"
    # TRAPPED_HEARTS = "Trapped Hearts"
    # SANTA_HATS = "Santa Hats"
    # ELECTRIC_SKULLS = "Electric Skulls"
    # RECORD_PLAYERS = "Record Players"
    # SKULL_FLOWERS = "Skull Flowers"
    # SPICED_WINES = "Spiced Wines"
    # HYPNO_LOLLIPOPS = "Hypno Lollipops"
    # ETERNAL_CANDLES = "Eternal Candles"
    # MAGIC_POTIONS = "Magic Potions"
    # JESTER_HATS = "Jester Hats"
    # CRYSTAL_BALLS = "Crystal Balls"
    # BERRY_BOXES = "Berry Boxes"
    # JINGLE_BELLS = "Jingle Bells"
    # COOKIE_HEARTS = "Cookie Hearts"
    # BUNNY_MUFFINS = "Bunny Muffins"
    # CANDY_CANES = "Candy Canes"
    # SLEIGH_BELLS = "Sleigh Bells"
    # MAD_PUMPKINS = "Mad Pumpkins"
    # LOVE_CANDLES = "Love Candles"
    # SNOW_MITTENS = "Snow Mittens"


NftCollectionCategoryType = (
    TelegramUsernameCategory
    | TelegramNumberCategory
    | TonDnsCategory
    | TelegramGiftsCategory
)


ASSET_TO_CATEGORY_TYPE_MAPPING = {
    NftCollectionAsset.TELEGRAM_USERNAME: TelegramUsernameCategory,
    NftCollectionAsset.TELEGRAM_NUMBER: TelegramNumberCategory,
    NftCollectionAsset.TON_DNS: TonDnsCategory,
    NftCollectionAsset.TELEGRAM_GIFTS: TelegramGiftsCategory,
}
