import sql
import discord

WARNING_LIMIT = 5

async def warn_member(message):
    mention_list = message.mentions
    if len(mention_list) is 0:
        await message.channel.send("Must mention a user to issue a warning.")
    for mention in mention_list:
       sql.insert_warning(message, mention, sql.DB_FILE)
       warnings = sql.return_warnings(mention)
       if len(warnings) > WARNING_LIMIT:
           await mention.send(content="you've been naughty")

