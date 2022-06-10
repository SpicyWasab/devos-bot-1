require('dotenv/config');

module.exports = async (client) => {
  const guild = client.guilds.cache.get(process.env.GUILD_ID);

  guild.members.fetch();

  await guild.commands.set(client.slashs);

  client.user.setPresence({ status: client.config.presence.type, activities: [{ name: client.config.presence.status }] });

  console.log(`[${client.user.username}]: I'm ready.`);
};