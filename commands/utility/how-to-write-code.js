const { ApplicationCommandOptionType, ApplicationCommandType } = require("discord.js");

module.exports = {
  description: "Comment bien écrire son code.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "pour",
      description: "Membre qui ne sait pas écrire son code.",
      type: ApplicationCommandOptionType.User,
      required: true
    }
  ],
  async run({ client, interaction }) {
    const member = interaction.options.getMember("pour");

    interaction.reply({
      content: member.toString(),
      embeds: [{
        color: client.config.colors.main,
        author: {
          name: member.user.tag,
          icon_url: member.user.displayAvatarURL()
        },
        title: "Voici comment bien écrire son code.",
        description: "Veuiller insérer les caractères suivant dans votre barre de chat.\nL'argument `[language]` doit être remplacé par le diminutif du langage en question.\n\\`\\`\\`[language]\ncode\n\\`\\`\\`\nCe qui donne par exemple :\n```js\ncode```",
        footer: {
          icon_url: client.user.displayAvatarURL(),
          text: client.config.footer
        }
      }]
    });
  }
};