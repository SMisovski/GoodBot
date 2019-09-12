# GoodBot
### Chat archiver and moderation tool.

#### requirements
GoodBot uses python 3.7, sqlite3, and discord.py

A discord developer account with associated bot api key

#
Discord currently limits pinned messages to 50 per channel. To prevent the creation of additional announcement channels, or deleting previous information that might still be relevant GoodBot automatically archives every channel's pinned messages, and all pins that occur during GoodBot's opperation. With a few in channel commands you can browse through previous pinned posts without fear of losing old information 

Additionally with the persistant database GoodBot also allows for automatic moderation through chat filters or manual warnings for those who are not in a moderator position. With configuration options for complete hands-off removal of repeat offenders of whatever kind
