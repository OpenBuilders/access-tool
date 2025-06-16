from telethon import events, types

START_MESSAGE = """**Access bot**

What I can do:
🔐 Manage access to private chat groups and channels.
💰 Grant access based on token or NFT ownership.
🎁 Support Telegram Gifts and Stickers.
🤌 Allow to customize access list via API.

Built by independent developers for [Telegram Tools](https://tools.tg/).

Open source for the community: [Github repository](https://github.com/OpenBuilders/access-tool)."""


async def handle_start_message(event: events.NewMessage()) -> None:
    await event.respond(
        START_MESSAGE,
        buttons=types.ReplyInlineMarkup(
            [
                types.TypeKeyboardButtonRow(
                    [
                        types.KeyboardButtonWebView(
                            text="Set up Access",
                            url="https://access.tools.tg/",
                        )
                    ]
                )
            ]
        ),
        link_preview=False,
        file="https://cdn.joincommunity.xyz/gateway/Access.mp4",
    )
    raise events.StopPropagation
