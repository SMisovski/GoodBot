
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
                str += "User: " + body[0].username +"\nPP: " + body[0].pp_raw + "\nCountry: " + body[0].country;
            }catch(err){
                channel.send("Error: user not found!");
            }
            channel.send(str);   
        });
        });
        
    }
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
        case "r":
            message.reply(roll(args));
            break;
        case "user":
            osu.getUser(args[0], message.channel);
            break;
        default:
            message.reply("I don't know how to respond to " + args[0]);
            break;
    }
    
  }
});

bot.login(auth.token);