const config = require('../config.json');
const Discord = require ("discord.js");
const db = require('quick.db');

module.exports = {
	name: 'suggest',
  descrption: 'Returns your message',
	cooldown: 30,
  aliases: ["suggestion"],
	usage: '<message>',
	args: true,
	async execute(bot, message, args, prefix) {
		if (message.author.bot) return;
		if(message.channel.id == config.generalID) return;
		if (message.guild.id != "929941845004415046") return
		if (message.content.includes("@everyone"))  return;
		if (message.content.includes("@here")) return;
		let msgtosend = args.join(" ")
		if (!msgtosend) {
			let errMSG = await message.lineReply('Please include a suggestion!').catch(error =>{
			})
			errMSG.delete({timeout:5000});
			message.delete({timeout:5000});
			return;
		}
		let embed = new Discord.MessageEmbed()
		.setTimestamp()
		.setAuthor(message.author.tag, message.author.displayAvatarURL())
		.setDescription(msgtosend)
		.setColor("GREEN")
		.setTitle("New suggestion:")
		.setFooter('To suggest something use !suggest')

		var sentembed = await message.guild.channels.cache.get(config.suggestionID).send(embed)

        sentembed.react('<:Upvote:934930260070371389>').then(() => sentembed.react('<:Downvote:934930252713586688>'));

				db.set(`suggestions.${sentembed.id}`, { msgID: sentembed.id, msgURL: sentembed.url, submitter: message.author.tag, submitterID: message.author.id, time: Math.round(Date.now() / 1000), suggestion: msgtosend, edited: false })
				message.channel.send("<a:completed:934404118754263050> Your suggestion has been submit!").then(message => {
					message.delete({timeout:5000})
				});

		message.delete().catch(error =>{
		})
    }
}
