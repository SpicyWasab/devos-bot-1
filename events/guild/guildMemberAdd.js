const canvafy = require("canvafy");

module.exports = async (client, member) => {
  member.roles.add(client.config.autorole_roles, "Ajout des autoroles.");
  await client.pool.query(`INSERT INTO users(id, credits, experience, level) VALUES (${member.id}, 0, 0, 1)`).catch(() => null);

  const { guild } = member;

  const general_channel = guild.channels.cache.get(client.config.general_channel_id) || await guild.channels.fetch(client.config.general_channel_id).catch(() => null);

  general_channel.send(`Bienvenue ${member.toString()} !\nN'hésite pas à prendre tes rôles dans le salon <#${client.config.roles_channel_id}> et à venir parler dans le général 😉. Tu peux nous parler de toi ou de ce qui t'amène ici par exemple.`);

  const welcome_channel = guild.channels.cache.get(client.config.welcome_channel_id) || await guild.channels.fetch(client.config.welcome_channel_id).catch(() => null);

  const welcome_card = await new canvafy.WelcomeLeave()
  .setAvatar(member.user.displayAvatarURL({ format: "png" }))
  .setBackground("image", "https://i.imgur.com/8fOLTXQ.png")
  .setTitle("Bienvenue")
  .setDescription("Devos Code, serveur communautaire de programmation !")
  .setBorder(client.config.colors.main)
  .setAvatarBorder(client.config.colors.main)
  .setOverlayOpacity(0.3)
  .build();

  welcome_channel.send({
    files: [
      { attachment: welcome_card.toBuffer(), name: `welcome-${member.id}.png` }
    ]
  });

  const all_members_channel = guild.channels.cache.get(client.config.stats.all) || await guild.channels.fetch(client.config.stats.all).catch(() => null);
  const members_channel = guild.channels.cache.get(client.config.stats.members) || await guild.channels.fetch(client.config.stats.members).catch(() => null);
  const bots_channel = guild.channels.cache.get(client.config.stats.bots) || await guild.channels.fetch(client.config.stats.bots).catch(() => null);

  await guild.members.fetch();

  const all_members = guild.memberCount;
  const members = guild.members.cache.filter(member => member.user.bot === false).size;
  const bots = all_members - members;

  all_members_channel.setName(`🌍 Global: ${all_members}`, "Stats counter.");
  members_channel.setName(`🧑 Membres: ${members}`, "Stats counter.");
  bots_channel.setName(`🤖 Bots: ${bots}`, "Stats counter.");
};