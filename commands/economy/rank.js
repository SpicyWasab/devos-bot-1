const { ApplicationCommandOptionType, ApplicationCommandType } = require("discord.js");
const { Rank } = require("canvafy");

module.exports = {
  description: "Affiche ton niveau ou celui d\"un utilisateur.",
  type: ApplicationCommandType.ChatInput,
  aliases: ["level"],
  options: [
    {
      name: "membre",
      description: "Choisissez un membre.",
      type: ApplicationCommandOptionType.User
    }
  ],
  async run({ client, interaction }) {
    const member = interaction.options.getMember("membre") || interaction.member;

    if (!member) return interaction.error("Je ne trouve pas ce membre sur le serveur.");
    if (member.user.bot) return interaction.error("Les bots n'ont pas de credits.");

    await interaction.deferReply();

    const users_db_select = await client.pool.query("SELECT * FROM users WHERE user_id = $1", [member.id]);
    const user_db = users_db_select.rows[0];

    if (!user_db) return interaction.error(member.id === interaction.member.id ? "Vous n'avez pas de niveau." : `${member.toString()} n'a pas de niveau.`);

    const ranks_select = await client.pool.query("WITH ranking AS (SELECT id, experience, DENSE_RANK() OVER (ORDER BY experience DESC) AS position FROM users) SELECT * from ranking WHERE user_id = 1;", [member.id]);
    const rank = parseInt(ranks_select.rows[0].position);

    const old_xp_objectif = (user_db.level === 1 ? 1 : user_db.level - 1) ** 2 * 100;
    const current_xp_objectif = user_db.level ** 2 * 100;
    const xp_objectif = current_xp_objectif - old_xp_objectif;

    const user_xp = user_db.experience - old_xp_objectif;

    const rank_card = await new Rank()
      .setAvatar(member.user.displayAvatarURL({ forceStatic: true, extension: "png" }))
      .setBackground("image", "https://i.imgur.com/8fOLTXQ.png")
      .setBarColor("#ff5044")
      .setUsername(member.user.username)
      .setDiscriminator(member.user.discriminator, "#dddddd")
      .setLevel(user_db.level)
      .setForegroundOpacity(0.8)
      .setRank(rank)
      .setCurrentXp(user_xp)
      .setRequiredXp(xp_objectif)
      .build();

    await interaction.editReply({
      content: `Voici la rank card de ${member.toString()}`,
      files: [{
        attachment: rank_card.toBuffer(),
        name: `rank-${member.id}.png`
      }]
    });
  }
};