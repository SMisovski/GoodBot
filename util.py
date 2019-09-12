import discord
import sql
import random
import logging
import userdata

PINS_COMMAND = "!pins"
NEXT_COMMAND = "!n"
FRIDGE_COMMAND = "!fridge"
ARCHIVE_COMMAND = "!archive"
QUIT_COMMAND = "!quit"
ROLL_COMMAND = "!r"
HELP_COMMAND = "!help"
WARNING_COMMAND = "!warn"



def is_admin(author):
    if author.top_role.permissions.administrator is True: return True
    return False

def dice_roller(message):
    contents = message.content[len("!r"):]
    contents = contents.lower().strip()
    word_list = contents.split(" ")

    output = message.author.mention
    output += " `" + contents.replace(" ", "") + "` "
    summation = 0
    for word in word_list:
        roll_word = word.split('d')
        if len(roll_word) > 1:
            output += "("
            for x in range(0,int(roll_word[0])):
                rand_int = random.randint(1,  int(roll_word[1]))
                output += str(rand_int)
                if x is not int(roll_word[0]) - 1:
                    output += ' + '
                summation += rand_int
            output += ") "
        else:
            if roll_word[0].isdigit() is True:
                output = output.strip()
                output += ' + ' + str(roll_word[0])
                summation += int(roll_word[0])
    output += " = " + str(summation)
    return output

def help(message):
    output = """    !pins (10) shows 5 pinned messages, starting at index 10. Given no index it will return the 5 most recent pins
    !r yaknow how this works
    !archive mod only, archives all pinned messages in this guild
    !quit mod only, disconnects the bot from discord
    !fridge random fridge quote
    """
    return output

async def archive_pinned_messages(client):
    logging.info("Pinned messages archival started")
    sql.table_setup(sql.DB_FILE)
    for guild in client.guilds:
        for text_channel in guild.text_channels:
            sql.insert_text_channel(text_channel, sql.DB_FILE)
            pins = await text_channel.pins()
            for pinned_message in pins:
                sql.insert_message(pinned_message, sql.DB_FILE)
    logging.info("Pinned message archival completed")

async def send_pinned_to_channel(content, message, db_file, user):
    index = content.replace(PINS_COMMAND, "").strip()
    if index.isdigit() is True: user.pin_index = int(index)
    else: user.pin_index = 0
    pinned_messages = sql.get_pinned_messages(content, message, db_file)
    for target in pinned_messages:
        content_out = target.content
        for attachment in target.attachment_list:
            content_out += " " + attachment
        await message.channel.send(content=content_out, delete_after=30.0)
    if len(pinned_messages) < sql.PIN_LIMIT:
        await message.channel.send("Last pin reached!", delete_after=5.0)
    else:
        await message.channel.send("!n for the next " + str(sql.PIN_LIMIT) + " pinned messages!", delete_after=5.0)

async def send_next_pinned_to_channel(message, db_file, user):
    if user.state != userdata.PINS_STATE: return
    updated_index = user.pin_index + sql.PIN_LIMIT
    pseudo_message = PINS_COMMAND + " " + str(updated_index)
    await send_pinned_to_channel(pseudo_message, message, db_file, user)
    user.pin_index = updated_index

def set_user_state(user_dict, author, state):
    if author.id not in user_dict:
        user_dict[author.id] = userdata.UserData
    user_dict[author.id].state = state

def profanity_filter(message):
    pass

def combine_sql_messages(message_list):
    output = ""
    char_count = 0

    for message in message_list:
        output += message.author.name + '\n'








