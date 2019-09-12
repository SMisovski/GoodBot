import discord
import random
import asyncio
import sql
import datetime
import os.path
import util
import logging
import userdata
import moderation as mod
import config
logging.basicConfig(filename="debug.log", level=logging.DEBUG)

client = discord.Client()
user_dict = {}

@client.event
async def on_ready():
    print('We have logged in as {0.user}'.format(client))
    await client.change_presence(activity=discord.Game(name="!help for a list of commands!"))
    if not os.path.exists(sql.DB_FILE): await util.archive_pinned_messages(client)
    print("Setup complete")

@client.event
async def on_message(message):
    if message.author == client.user:
        return

    if message.content.startswith(util.ARCHIVE_COMMAND):
        if not util.is_admin(message.author): return
        await util.archive_pinned_messages(client)
        await message.channel.send("Archived guild's pinned messages")

    if message.content.startswith(util.PINS_COMMAND):
        util.set_user_state(user_dict, message.author, userdata.PINS_STATE)
        await util.send_pinned_to_channel(message.content, message, sql.DB_FILE, user_dict[message.author.id])

    if message.content.startswith(util.NEXT_COMMAND):
        if user_dict[message.author.id].state == userdata.PINS_STATE:
            await util.send_next_pinned_to_channel(message, sql.DB_FILE,
                                            user_dict[message.author.id])

    if message.content.startswith(util.QUIT_COMMAND):
        if util.is_admin(message.author) is True: await client.close()

    if message.content.startswith(util.ROLL_COMMAND):
        await message.channel.send(util.dice_roller(message))

    if message.content.startswith(util.HELP_COMMAND):
        await message.channel.send(util.help(message))

    if message.content.startswith(util.WARNING_COMMAND):
        await mod.warn_member(message)

    if message.content.startswith(util.FRIDGE_COMMAND):
        channels = message.guild.text_channels
        for channel in channels:
            if channel.name == "the-fridge":
                quotes = await channel.history(limit=1000).flatten()
                ran_num = random.randint(0,len(quotes))
                selected = quotes[ran_num]
                output = selected.content + ' at ' + selected.created_at.strftime("%m/%d/%Y")
                await message.channel.send(output)

@client.event
async def on_guild_channel_pins_update(channel, last_pin):
    pin_list = await channel.pins()
    sql.insert_message(pin_list[0], sql.DB_FILE)
    logging.info("Archived new pinned message " + str(pin_list[0].id))


client.run(config.API_KEY)
