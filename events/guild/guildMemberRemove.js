module.exports = async (client, member) => {
  if (!member.user.bot) await client.pool.query("DELETE FROM users WHERE user_id = $1;", [member.id]);

  const all_members_channel = member.guild.channels.cache.get(client.config.stats.all) || await member.guild.channels.fetch(client.config.stats.all).catch(() => null);
  const members_channel = member.guild.channels.cache.get(client.config.stats.members) || await member.guild.channels.fetch(client.config.stats.members).catch(() => null);
  const bots_channel = member.guild.channels.cache.get(client.config.stats.bots) || await member.guild.channels.fetch(client.config.stats.bots).catch(() => null);

  await member.guild.members.fetch();

  const all_members = member.guild.memberCount;
  const members = member.guild.members.cache.filter(m => m.user.bot === false).size;
  const bots = all_members - members;

  all_members_channel.setName(`🌍 Global: ${all_members}`, "Stats counter.");
  members_channel.setName(`🧑 Membres: ${members}`, "Stats counter.");
  bots_channel.setName(`🤖 Bots: ${bots}`, "Stats counter.");
};