module.exports = async (client, member) => {
  member.roles.add(client.config.autorole_roles, 'Ajout des autoroles.');
  await client.pool.query(`INSERT INTO users(id, credits, experience, level) VALUES (${member.id}, 0, 0, 1)`).catch(e => null);

  const { guild } = member;

  const welcome_channel = guild.channels.cache.get(client.config.welcome_channel_id);

  welcome_channel.send({
    files: [
      { attachment: await client.welcome_card(member), name: `welcome-${member.id}.png` }
    ]
  });

  const all_members_channel = guild.channels.cache.get(client.config.stats.all);
  const members_channel = guild.channels.cache.get(client.config.stats.members);
  const bots_channel = guild.channels.cache.get(client.config.stats.bots);

  await guild.members.fetch();

  const all_members = guild.memberCount;
  const members = guild.members.cache.filter(m => !m.user.bot).size;
  const bots = all_members - members;

  all_members_channel.setName(`🌍 Global: ${all_members}`, 'Stats counter.');
  members_channel.setName(`🧑 Membres: ${members}`, 'Stats counter.');
  bots_channel.setName(`🤖 Bots: ${bots}`, 'Stats counter.');
};