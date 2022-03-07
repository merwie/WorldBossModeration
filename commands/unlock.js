const config = require('../config.json');
const Discord = require ("discord.js");

module.exports = {
	name: 'unlock',
  descrption: 'Returns your message',
	aliases: ['unlockdown'],
	usage: '<message>',
	args: true,
	async execute(bot, message, args, prefix, commandName) {
		if (!message.member.hasPermission("MANAGE_CHANNELS") && message.author.id != config.ownerID) return;
		if (!message.guild.me.permissionsIn(message.channel).has("MANAGE_ROLES")) return message.channel.send("I don't have the `MANAGE_ROLES` permission in this channel.")
		if (message.channel.permissionsFor(message.guild.roles.everyone).has('SEND_MESSAGES')) {
			 return message.channel.send(`**${message.channel}** is not locked!`)
		}
		let loading = await message.channel.send("<a:loading:939665977728176168> Give me a sec...")
		try {
		await message.channel.updateOverwrite(message.channel.guild.roles.everyone, { SEND_MESSAGES: null })
		loading.edit(`<:shieldtick:939667770184966186> **${message.channel}** was unlocked.`)
	} catch(e) {
		console.log(e);
		return loading.edit(`There was an error: **${e}**`);
	}
		// const category = await message.guild.channels.cache.get("929941845260255275"); // You can use `find` instead of `get` to fetch the category using a name: `find(cat => cat.name === 'test')
		// category.children.forEach(channel => {
		// 	message.channel.send(`<#${channel.id}>`);
		// })

    }
}