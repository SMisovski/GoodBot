# GoodBot version 1.0.1
### Commands
Current GoodBot command list:
- !r `x`D`y`, rolls x dice of y sides!
- !user `username` pulls data of osu! user `username`
- !best `username` pulls the highest pp score from osu! user `username`
- !beatmap `beatmapid` will show relevant information about osu! beatmap with beatmap id `beatmapid`
- !profon (Moderator only) Enables the profanity filter
- !profoff (Moderator only) Disables the profanity filter

#### Requirements
Requires NodeJS, Discord.js
For GoodBot to connect to discord, GoodBot requires a file named `auth.json` that contains:
```
{
    "token": "Your-Token-Here"
}
```
Here's a quick [guide](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token) to get your token.

Feel free to adjust the config variable in bot.js to change various options for GoodBot
```
    //The names of roles that have admin powers
    mod: ["Mod", "Admin", "Administrator", "Moderator"],

    //what preceeding character you want the bot to be woken with
    call: '!',

    //profanity filter word list file
    bantext: 'banlist.txt',

    //enable or disable the profanity filter with true or false
    profanityFilter: false,

    //Warnings before mods get a message
    warningCount: 9,

    //Enabling or disabling the osu! integration for GoodBot
    osuAPI: true
```

For osu! integration, GoodBot also requires a file named `osu.json` that contains:
```
{
    "key": "Your-API-Key-Here"
}
```
Get your API key [here](https://osu.ppy.sh/p/api)!


