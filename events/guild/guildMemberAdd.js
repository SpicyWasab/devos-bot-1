const canvafy = require("canvafy");

module.exports = async (client, member) => {
  member.roles.add(client.config.autorole_roles, "Ajout des autoroles.");
  await client.pool.query(`INSERT INTO users(id, credits, experience, level) VALUES (${member.id}, 0, 0, 1)`).catch(e => null);

  const { guild } = member;

  const welcome_channel = await guild.channels.fetch(client.config.welcome_channel_id);

  const welcome_card = await new canvafy.WelcomeLeave()
  .setAvatar(member.user.displayAvatarURL({ format: "png" }))
  .setBackground("image", "https://i.imgur.com/8fOLTXQ.png")
  .setTitle("Bienvenue")
  .setDescription("Devos Code, serveur communautaire d'aide et d'apprentissage en programmation !")
  .setBorder(client.config.colors.main)
  .setAvatarBorder(client.config.colors.main)
  .setOverlayOpacity(0.3)
  .build();

  welcome_channel.send({
    files: [
      { attachment: welcome_card.toBuffer(), name: `welcome-${member.id}.png` }
    ]
  });

  const all_members_channel = await guild.channelsfetch(client.config.stats.all);
  const members_channel = await guild.channelsfetch(client.config.stats.members);
  const bots_channel = await guild.channelsfetch(client.config.stats.bots);

  await guild.members.fetch();

  const all_members = guild.memberCount;
  const members = guild.members.cache.filter(m => !m.user.bot).size;
  const bots = all_members - members;

  all_members_channel.setName(`🌍 Global: ${all_members}`, 'Stats counter.');
  members_channel.setName(`🧑 Membres: ${members}`, 'Stats counter.');
  bots_channel.setName(`🤖 Bots: ${bots}`, 'Stats counter.');
};