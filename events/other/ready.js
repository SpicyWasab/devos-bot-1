require("dotenv/config");

module.exports = async (client) => {
  const guild = client.guilds.cache.get(process.env.GUILD_ID);

  await guild.commands.set(client.slashs);

  const set_presence = function () {
    client.user.setPresence({ status: client.config.presence.type, activities: [{ name: client.config.presence.status }] });
    return setTimeout(set_presence, 1000 * 60 * 10);
  };
  set_presence();

  console.log(`[${client.user.username}]: I'm ready.`);
};