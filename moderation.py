import sql
import discord
import config

WARNING_LIMIT = 5

async def warn_member(message):
    mention_list = message.mentions
    if len(mention_list) is 0:
        await message.channel.send("Must mention a user to issue a warning.")
    for mention in mention_list:
       sql.insert_warning(message, mention, sql.DB_FILE)
       warnings = sql.return_warnings(mention)
       warning_messages = []
       for warning in warnings:
           warning
       if len(warnings) > WARNING_LIMIT:
           await mention.send(content="you've been naughty")
           kick_member(mention)

async def kick_member(user):
    if  config.AUTO_KICK is True:
        await user.kick()

async def message_moderators(message):
    if not message.guild: return
    member_list = message.guild.members
    moderator_list = []
    for member in member_list:
        if member.administrator is True: moderator_list.append(member)
        await member.send("User " + message.author.name + " has recieved " + WARNING_LIMIT + " number of warnings")
