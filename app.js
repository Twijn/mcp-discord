const { Client, Events, GatewayIntentBits } = require('discord.js');

const utils = require("./utils");

const config = require("./config.json");

const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMembers,
]});

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(config.discord.token);

utils.CommunicationManager.on("addUser", async (data, reply) => {
	try {
		const guild = await client.guilds.fetch(config.discord.mcp_guild);
		await guild.members.add(data.userId, {
			accessToken: data.accessToken,
		});
		console.log(`Added ${data.userId} to the MinecraftServer.pro guild!`);
		reply({});
	} catch(err) {
		console.error(`Error while adding user to guild:`);
		console.error(err);
	}
});

require("./express");
