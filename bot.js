
var osuAuth = require("./osu.json");
var Discord = require("discord.js");
var auth = require('./auth.json');
var botInfo = require('./package.json');
var http = require('http');

var osu ={
    token: osuAuth.key,
    //TODO get getUser to return str itself, not have to pass in channel to print
    getUser(user, channel){
        var str = '';
        const https = require("https");
        const url = "https://osu.ppy.sh/api/get_user?u=" + user + "&k=" + this.token;
        https.get(url, res => {
        res.setEncoding("utf8");
        let body = "";
        res.on("data", data => {
            body += data;
        });
        res.on("end", () => {
            body = JSON.parse(body);
            try{
                str += "User: " + body[0].username +"\nRank: #" + body[0].pp_rank + "\nPP: " + body[0].pp_raw + "\nCountry: " + body[0].country;
            }catch(err){
                channel.send("Error: user not found!");
            }
            channel.send(str);   
        });
        });
    },
    //todo figure a way to make this return the string instead of printing to channel
    //will make future use of printing beatmaps much cleaner
    printBeatmap(beatmapId, channel){
        var str = '';
        const https = require("https");
        const url = "https://osu.ppy.sh/api/get_beatmaps?b=" + beatmapId + "&k=" + this.token;
        https.get(url, res => {
        res.setEncoding("utf8");
        let body = "";
        res.on("data", data => {
            body += data;
        });
        res.on("end", () => {
            body = JSON.parse(body);
            try{
                str += "```" + body[0].title  + " - " + body[0].artist + " <" + body[0].version +">\n"
                + Math.round(body[0].difficultyrating*100)/100 + "☆ | "
                 + body[0].bpm + " bpm | " + body[0].max_combo + "x combo | " + printSeconds(body[0].total_length)
                  + "\n```" + "https://osu.ppy.sh/b/" + beatmapId;
            }catch(err){
                channel.send("Error: beatmap not found");
            }
            channel.send(str);   
        });
        });
    },
    //TODO, mod conversion, accuracy calculation
    getUserBest(user, channel){
        var str = '';
        const https = require("https");
        const url = "https://osu.ppy.sh/api/get_user_best?u=" + user + "&k=" + this.token + "&limit=1";
        https.get(url, res => {
        res.setEncoding("utf8");
        let body = "";
        res.on("data", data => {
            body += data;
        });
        res.on("end", () => {
            body = JSON.parse(body);
            try{
                this.printBeatmap(body[0].beatmap_id, channel);
                str += "rank: **" + body[0].rank + "** | pp: **" + body[0].pp + "** | Mods: " + body[0].enabled_mods + "\n" +
                body[0].maxcombo +"x | (" + body[0].count300 + ", " + body[0].count100 + ", " + body[0].count50 + ") | " + body[0].countmiss + "x miss";
                if(body[0].perfect == 1){
                    str += "\n__***FULL COMBO***__";
                }
            }catch(err){
                channel.send("Error: Top play not found");
            }
            channel.send(str);   
        });
        });
    },

}
function pad2(number) {
    return (number < 10 ? '0' : '') + number
}

function printSeconds(time){
    var minutes = pad2(Math.floor(time / 60));
    var seconds = pad2(time - minutes * 60); 
    return minutes + ":" + seconds;
}

var bot = new Discord.Client({
    token: auth.token,
    autorun: true,
});

function botCalled(message){
    if(message.content.startsWith('!')){
        message.content.substr(1);
        return true;
    }
    else{
        return false;
    }
}


function rollDie(sideNumber, quantity, constant){
    var output = "";
    var sum = 0;
    var currentDie = 0;
    output += "`" + quantity + "d" + sideNumber;  

    if(constant != 0){
        sum += constant;
        if(constant > 0){
            output += " + " + constant + "` ";
        }
        else{
            output += " - " + constant + "` ";
        }
    }
    else{
        output += "` ";
    }
    
    output += "(";
    for(i = 0; i < quantity; i++){
        currentDie = Math.floor(Math.random() * sideNumber) + 1;
        sum += currentDie;
        if(i == (quantity - 1)){
            output += currentDie;
        }
        else{
            output += currentDie + " + ";
        }
    }

    if(constant != 0){
         output += ") + " + constant;   
    }
    output += ") = " + sum;
    return output; 
}

function roll(inputStrings){
    var dblock = inputStrings[0].split('d');
    return(rollDie(dblock[1], dblock[0], 0));
    var pblock = dblock[1].split('+');
}

function help(channel){
    var output = "Hiya! I'm GoodBot!\
 If you are looking for a list of commands, type !commands\
 If you are interested in finding out more about how I function, check out my GitHub at https://github.com/SMisovski/GoodBot";
    channel.send(output);
}

function commands(channel){
    var output = "My current list of active commands are \n!help\n!commands\n!r(oll) `x`d`y`\n!user `osu!_user`\n!best `osu!_user`\n!beatmap `beatmap_id`";
    channel.send(output);
}

bot.on("ready", () => {
  console.log("Launching " + botInfo.name + ' version ' + botInfo.version);
});



bot.on("message", (message) => {
  if (botCalled(message)) { 
    var call = message.content.substr(1);
    var args = call.split(' ');
    var command = args[0];
    args.splice(0,1);
    

    switch(command.toLowerCase()){
        case "help":
            help(message.channel);
            break;
        case "commands":
            commands(message.channel);
            break;
        case "r":
            message.reply(roll(args));
            break;
        case "beatmap":
            osu.printBeatmap(args[0], message.channel);
            break;
        case "user":
            osu.getUser(args[0], message.channel);
            break;
        case "best":
            osu.getUserBest(args[0], message.channel);
            break;
        default:
            message.reply("I don't know how to respond to " + args[0]);
            break;
    }
    
  }
});

bot.login(auth.token);