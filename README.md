# GoodBot
### Commands
Current GoodBot command list:
- !r `x`D`y`, rolls x dice of y sides!
- !user `username` pulls data of osu! user `username`

#### Requirements
Requires NodeJS, Discord.js
For GoodBot to connect to discord, GoodBot requires a file named `auth.json` that contains:
```
{
    "token": "Your-Token-Here"
}
```
Here's a quick [guide](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token) to get your token.



For osu! integration, GoodBot also requires a file named `osu.json` that contains:
```
{
    "key": "Your-API-Key-Here"
}
```
Get your API key [here](https://osu.ppy.sh/p/api)!


