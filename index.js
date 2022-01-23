const config = require('./config.json');
const Discord = require ("discord.js");
require('discord-reply');
const bot = new Discord.Client ({ partials: ["MESSAGE", "CHANNEL", "REACTION"]});
const db = require('quick.db');

const fs = require('fs');
bot.commands = new Discord.Collection();
//bot.aliases = new Discord.Collection();



const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);
	bot.commands.set(command.name, command);
	//command.aliases.array.forEach(alias => {
	//	bot.aliases.set(alias, command.name)
	//});
}

console.log(`Loading ${commandFiles.length} commands...`)

commandFiles.forEach((f, i) => {
	console.log(`Successfully loaded ${i + 1}: ${f}!`)
})

bot.on("ready", async () => {
	bot.guilds.cache.forEach( guild => {
		guild.members.cache.forEach( member => {
			let mutetime = db.get(`tempmute.${guild.id}.${member.user.id}.time`);
			if(isNaN(mutetime)) return;
			let channel = guild.channels.cache.get(db.get(`tempmute.${guild.id}.${member.user.id}.channel`));
			let timer = setInterval(async function() {
				mutetime = mutetime - 1;
				if(mutetime == 0) {
					clearInterval(timer);

					let unmuteembed = new Discord.MessageEmbed()
    				.setColor("#d90053")
		  			.setTitle(`Unmute | ${member.user.tag}`)
		  			.addField("User", member, true)
     				.addField("Moderator", bot.user, true)
		  			.addField("Reason", "Auto Unmute")
		  			.setTimestamp()
					.setFooter(member.id)
					let muterole = guild.roles.cache.find(r => r.name === "Muted")
					member.roles.remove(muterole.id);
					db.delete(`tempmute.${guild.id}.${member.user.id}.time`);
					db.delete(`tempmute.${guild.id}.${member.user.id}.channel`);
    				try {
    				member.send(`You have been unmuted in **${guild.name}** | Auto Unmute`)
 					}catch(e){
    				console.log(e.stack);
					  }
					  bot.channels.cache.get(config.logsID).send(unmuteembed)

            let ts = Date.now();

            let date_ob = new Date(ts);
            let date = date_ob.getDate();
            let month = date_ob.getMonth() + 1;
            let year = date_ob.getFullYear();

            // prints date & time in YYYY-MM-DD format
            let formatteddate = year + "-" + month + "-" + date

            let dbgetuser = db.get(`moderation.punishments.${member.user.id}`)

            if(!dbgetuser) {
	             db.add(`moderation.punishments.${member.user.id}.offenceno`, 1)
	              db.set(`moderation.punishments.${member.user.id}.1`, { date: formatteddate, reason: 'Automatic unmute', punisher: bot.user.tag, type: 'Unmute' })
	               db.delete(`moderation.punishments.${member.user.id}.muted`)
               } else {
	                let addoffence = dbgetuser.offenceno + 1
	                 db.add(`moderation.punishments.${member.user.id}.offenceno`, 1)
	                  db.set(`moderation.punishments.${member.user.id}.${addoffence}`, { date: formatteddate, reason: 'Automatic unmute', punisher: bot.user.tag, type: 'Unmute' })
	                   db.delete(`moderation.punishments.${member.user.id}.muted`)
                   }

				}
			}, 1000)
		});
	});
console.log("Loaded all commands. Bot is ready to use!")
console.log("Created by BamBoozled#0882")
console.log(`Watching ${bot.users.cache.size} Users!`)

let i = 0;
let activities;
setInterval(() => {
    activities = [ `General chat`, `World Boss`, `The mods`, `!help` ];
    bot.user.setActivity(`${activities[i++ % activities.length]}`, { type: "WATCHING"});
}, 15000)

});
bot.on('message', async message => {
	if (message.channel.type == "dm") return;

  if(message.mentions.has("199087471215116288")) {
    if (message.author.bot) return;
    if (message.member.roles.cache.some(role => role.id === '929941845004415049')) return;
    if (message.member.roles.cache.some(role => role.id === '934314188858355782')) return;
    message.lineReply("Hey! Please don't ping the WorldBoss's. Make sure you read the <#929941845260255273>.\n**Repeated attempts will result in moderator action.**")
  }
  if(message.mentions.has("218345611802574848")) {
    if (message.author.bot) return;
    if (message.member.roles.cache.some(role => role.id === '929941845004415049')) return;
    if (message.member.roles.cache.some(role => role.id === '932108051924783104')) return;
    message.lineReply("Hey! Please don't ping the WorldBoss's. Make sure you read the <#929941845260255273>.\n**Repeated attempts will result in moderator action.**")
  }

	let pref = message.guild && db.get(`prefix.${message.guild.id}`)
	let prefix;

	if (!pref) {
		prefix = `${config.prefix}`;
	} else {
		prefix = pref;
	}

	const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const prefixRegex = new RegExp(`^(<@!?${bot.user.id}>|${escapeRegex(prefix)})\\s*`);
if(!prefixRegex.test(message.content)) return;
const [, matchedPrefix] = message.content.match(prefixRegex);
	if (message.author.bot) return;

	const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();
	if(!commandName && !message.content.startsWith(prefix)) return;

	if(commandName == "prefix") {
		if (!message.member.hasPermission("MANAGE_GUILD") && message.author.id != config.ownerID) return;
		let data = db.get(`prefix.${message.guild.id}`);
		if (args[0] === "reset") {
			await db.delete(`prefix.${message.guild.id}`);
			message.channel.send(`The server prefix for **${message.guild.name}** has been reset!`);
			return console.log(`The prefix for ${message.guild.name} was reset.`);
		}
		let symbol = args[0];
		let nonedefined = new Discord.MessageEmbed()
		.setTitle("Server Prefix")
		.setDescription(`${message.guild.name}'s Current prefix is \`${prefix}\`\nUse ${prefix}prefix reset to reset the server's prefix to default.`)
		.addField("Description:", "Change the server's prefix", true)
		.addField("Usage:", `${prefix}prefix [Your_custom_prefix_here]\n${prefix}prefix reset`, true)
		.addField("Example:", `${prefix}prefix -`)
		.setColor('#d90053')
		if (!symbol) return message.channel.send(nonedefined)

		db.set(`prefix.${message.guild.id}`, symbol);
		message.channel.send(`The server prefix for **${message.guild.name}** has been updated to: \`${symbol}\``)
		return console.log(`The prefix for ${message.guild.name} was updated to: ${symbol}`);
	}



	const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
	if (!command) return;
	if (message.channel.type == "dm") return;
  try {
		command.execute(bot, message, args, prefix);
	} catch (error) {
		console.error(error);
	}
});


bot.on('guildMemberAdd', member => {
    let dbgetuser = db.get(`moderation.punishments.${member.user.id}`)

    if(!dbgetuser) return;

    else if(dbgetuser.muted != 'true') return;
      let muterole = member.guild.roles.cache.find(r => r.name === "Muted")
      member.roles.add(muterole.id);

});

bot.on('guildMemberRemove', member => {

});

bot.snipes = new Map()
bot.on('messageDelete', function(message, channel) {
	if(!message.author || !message.content && !message.attachments.size > 0 ) return;
	bot.snipes.set(message.channel.id, {
		content:message.content,
		author:message.author.tag,
		icon:message.author.avatarURL(),
		image:message.attachments.first() ? message.attachments.first().proxyURL : null
	})
});



bot.login(config.token)
