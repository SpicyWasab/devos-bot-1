const canvafy = require("canvafy");

module.exports = async (client, member) => {
  if (member.user.bot && client.add_bot === false) member.ban({ reason: "Anti-Add Bot" });
  if (!member.user.bot) {
    member.roles.add(client.config.autorole_roles, "Ajout des autoroles.");
    await client.pool.query(`INSERT INTO users(id, credits, experience, level) VALUES (${member.id}, 0, 0, 1)`).catch(() => null);
  }

  const general_channel = member.guild.channels.cache.get(client.config.general_channel_id) || await member.guild.channels.fetch(client.config.general_channel_id).catch(() => null);

  general_channel.send(`Bienvenue ${member.toString()} !\nN'hésite pas à prendre tes rôles dans le salon <#${client.config.roles_channel_id}> et à venir parler dans le général 😉. Tu peux nous parler de toi ou de ce qui t'amène ici par exemple.`);

  const welcome_channel = member.guild.channels.cache.get(client.config.welcome_channel_id) || await member.guild.channels.fetch(client.config.welcome_channel_id).catch(() => null);

  const welcome_card = await new canvafy.WelcomeLeave()
    .setAvatar(member.user.displayAvatarURL({ forceStatic: true, extension: "png" }))
    .setBackground("image", "https://i.imgur.com/8fOLTXQ.png")
    .setTitle("Bienvenue")
    .setDescription("Devos Code, serveur communautaire de programmation !")
    .setBorder(client.config.colors.main.toHex())
    .setAvatarBorder(client.config.colors.main.toHex())
    .setOverlayOpacity(0.3)
    .build();

  welcome_channel.send({
    files: [
      { attachment: welcome_card.toBuffer(), name: `welcome-${member.id}.png` }
    ]
  });

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