const { ApplicationCommandOptionType, ApplicationCommandType } = require("discord.js");

module.exports = {
  description: "Affiche le nombre de credits que vous avez ou celui d'un autre utilisateur.",
  type: ApplicationCommandType.ChatInput,
  aliases: ["balance"],
  options: [
    { name: "membre", description: "Choisissez un membre.", type: ApplicationCommandOptionType.User }
  ],
  async run({ client, interaction }) {
    const member = interaction.options.getMember("membre") || interaction.member;

    if (!member) return interaction.error("Je ne trouve pas ce membre sur le serveur.");
    if (member.user.bot) return interaction.error("Les bots n'ont pas de credits.");

    const users_db_select = await client.pool.query("SELECT * FROM users WHERE user_id = $1;", [member.id]);
    const users_db = users_db_select.rows[0];

    if (!users_db) {
      if (member.id === interaction.member.id) {
        return interaction.error("Votre profil n'est pas enregistré. Faites la commande `/create-profile` ou envoyez un message pour enregistrer un profil.");
      } else {
        return interaction.error(`${member.toString()} n'a pas encore de profil.`);
      }
    }

    interaction.reply({
      embeds: [{
        color: client.config.colors.blue,
        author: {
          name: member.user.tag,
          icon_url: member.user.displayAvatarURL()
        },
        title: "Credits",
        description: member.id === interaction.member.id ? `Vous avez ${users_db.credits} credit${users_db.credits > 1 ? "s" : ""}.` : `${member.toString()} a ${users_db.credits} credit${users_db.credits > 1 ? "s" : ""}.`,
        footer: {
          icon_url: client.user.displayAvatarURL(),
          text: client.config.footer
        }
      }]
    });
  }
};