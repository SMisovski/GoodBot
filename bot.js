var Discord = require("discord.js");
var auth = require('./auth.json');
var botInfo = require('./package.json');
var http = require('http');

var dictionary = {};
var warnings = {};
var config = {
    //What roles in each guild have administrator rights
    mod: ["Mod", "Admin", "Administrator", "Moderator"],
    //what preceeding character you want the bot to be woken with
    call: '!',
    //profanity filter word list
    bantext: 'banlist.txt',
    //enable or disable the profanity filter with true or false
    profanityFilter: false,
    //Warnings before mods get a message
    warningCount: 9,
    //Use the osu! api for pulling data
    osuAPI: false,
};

var bot = new Discord.Client({
    token: auth.token,
    autorun: true,
});



var fs = require('fs'),
readline = require('readline');
try{
var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(config.bantext)
  });
  
  lineReader.on('line', function (line) {
    dictionary[line] = true;
  }); 
}catch(err){
    console.log("Word black list file not found");
}

bot.on("ready", () => {
    console.log("Launching " + botInfo.name + ' version ' + botInfo.version + ' in ' + bot.guilds.size + ' guild(s)');
    console.log("Profanity filter: " + config.profanityFilter);
    console.log("osu! integration: " + config.osuAPI);
    bot.user.setActivity('Being a GoodBot™');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
});

try{
    var osuAuth = require("./osu.json");
}catch(err){
    console.log("osu! key not found")
}

if(config.osuAPI){
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
}



//truncates numbers
function pad2(number) {
    return (number < 10 ? '0' : '') + number
}

function printSeconds(time){
    var minutes = pad2(Math.floor(time / 60));
    var seconds = pad2(time - minutes * 60); 
    return minutes + ":" + seconds;
}


function botCalled(message){
    if(message.content.startsWith(config.call)){
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

function isMod(member){
    for(let i = 0; i < config.mod.length; ++i){
        if(member.roles.find("name", config.mod[i])){
            return true;
        }
    }
    return false;
}

function alertMods(guild, user){

    for(let i = 0; i < config.mod.length; ++i){
        ModName = config.mod[i];

        let modList = guild.members.filter(member => { 
            return member.roles.find("name", ModName);
        }).map(member => {
            return member;
        })
        
        for(let i = 0; i < modList.length; ++i){
            modList[i].send(user + " has recieved over " + config.warningCount + " warnings. Disciplinary action may be required");
        }
    }
 

}


function profanityFilter(message){
    let sentence = message.content;
    sentence = sentence.toLowerCase();
    var words = sentence.split(' ');
    for(var i = 0; i < words.length; ++i){
        if(dictionary[words[i]]){
            warningMessage(message);
            return true;
        }
    }
    return false;
}

function warningMessage(message){
    if(isNaN(warnings[message.author])){
         warnings[message.author] = 1;
    }
    else{
        warnings[message.author] += 1;
    }
    if(warnings[message.author] >= config.warningCount){
        alertMods(message.guild, message.author);
    }
    message.reply(" unacceptable langauge. This is warning number " + warnings[message.author]);
    message.delete();
}

function deleteLast(message){
    for(let i = 0; i < message.content; ++i){
        
    }
}

bot.on("message", (message) => {

    if(config.profanityFilter){
        if(profanityFilter(message)) return;
    }

    if(message.author.bot) return;
    if (!botCalled(message)) return;
    
    var call = message.content.substr(1);
    var args = call.split(' ');
    var command = args[0];
    args.splice(0,1);

    command = command.toLocaleLowerCase();
    if(command === "say"){
        if(!isMod(message.member)) return;
        const replyMessage = args.join(" ");
        message.delete();
        message.channel.send(replyMessage);
        return;
    }
    else if(command === "commands"){
        commands(message.channel);
    }
    else if(command === "r"){
        message.reply(roll(args));
    }
    else if(command === "beatmap"){
        if(!config.osuAPI) return;
        osu.printBeatmap(args[0], message.channel);
    }
    else if(command === "user"){
        if(!config.osuAPI) return;
        osu.getUser(args[0], message.channel);
    }
    else if(command === "best"){
        if(!config.osuAPI) return;
        osu.getUserBest(args[0], message.channel);
    }
    else if(command === "kick"){
        if(!isMod(message.member)) return;
        const target = message.mentions.users.first();
        if(!target) return;
        var targetmember = message.guild.member(target);
        if(targetmember){
            targetmember.kick("Kicked from the server by " + message.author.tag).then(() => {
                message.reply("Kicked " + target.tag)}).catch(errorLog => {
                    message.reply("Unable to kick");
                    console.error(errorLog);
            })
            
        }
    }
    else if(command === "connect"){
        var targetChannel = message.member.voiceChannel
        targetChannel.join();
    }
    else if(command === "disconnect"){
        message.member.voiceChannel.leave();
    }
    else if(command === "help"){
        help(message.channel);
    }
    else if(command === "profon"){
        if(isMod(message.member)){
            config.profanityFilter = true;
            message.reply("profanity filter enabled!");
        }
        else{
            console.log("Profanity filter enabled");
            message.reply("you must be a moderator to use this command.")
        }
    }
    else if(command === "profoff"){
        if(isMod(message.member)){
            config.profanityFilter = false;
            message.reply("profanity filter disabled!");
            console.log("Profanity filter disabled");
        }
        else{
            message.reply("you must be a moderator to use this command.")
        }
    }
    else{
        message.reply("I don't know how to respond to " + command);
    }
    
});

bot.login(auth.token);