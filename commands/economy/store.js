const { ApplicationCommandType, ComponentType } = require("discord.js");

module.exports = {
  description: "Affiche le magasin pour vous achetez des produits.",
  type: ApplicationCommandType.ChatInput,
  aliases: ["shop"],
  async run({ client, interaction }) {
    const embed = {
      color: client.config.colors.main,
      author: { name: interaction.user.tag, icon_url: interaction.user.displayAvatarURL() },
      title: "Magasin",
      description: `Achetez vous des produits en faisant glisser le menu déroulant.`,
      fields: [],
      footer: { text: client.config.footer, icon_url: client.user.displayAvatarURL() }
    };

    const options = [];

    for (const item of client.config.store) {
      options.push({ label: item.name, value: item.id, description: `Prix : ${item.credits} credits, ID : ${item.id}` });
      embed.fields.push({ name: item.name, value: item.description });
    }

    interaction.reply({
      components: [{
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.SelectMenu,
            custom_id: `store.${interaction.user.id}`,
            options,
            placeholder: "Choisissez un ou plusieurs items"
          }
        ]
      }],
      embeds: [embed]
    });
  }
};