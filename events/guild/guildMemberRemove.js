module.exports = async (client, member) => {
  await client.pool.query(`DELETE FROM users WHERE id = ${member.id}`).catch(e => null);

  const { guild } = member;

  const all_members_channel = guild.channels.cache.get(client.config.stats.all) || await guild.channels.fetch(client.config.stats.all).catch(() => null);
  const members_channel = guild.channels.cache.get(client.config.stats.members) || await guild.channels.fetch(client.config.stats.members).catch(() => null);
  const bots_channel = guild.channels.cache.get(client.config.stats.bots) || await guild.channels.fetch(client.config.stats.bots).catch(() => null);

  await guild.members.fetch();

  const all_members = guild.memberCount;
  const members = guild.members.cache.filter(m => m.user.bot === false).size;
  const bots = all_members - members;

  all_members_channel.setName(`🌍 Global: ${all_members}`, 'Stats counter.');
  members_channel.setName(`🧑 Membres: ${members}`, 'Stats counter.');
  bots_channel.setName(`🤖 Bots: ${bots}`, 'Stats counter.');
};