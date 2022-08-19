const { ApplicationCommandOptionType, ApplicationCommandType, PermissionFlagsBits } = require("discord.js");

module.exports = {
  description: "Ajoute les réactions de rôles au message en question.",
  type: ApplicationCommandType.ChatInput,
  permissions: [PermissionFlagsBits.Administrator],
  options: [
    {
      name: "category",
      description: "Choisissez le group.",
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],
  async run({ client, interaction }) {
    const category = interaction.options.getString("category");

    const group = client.config.reactions.find(r => r.name.toLowerCase() === category.toLowerCase());

    if (!group) return interaction.error("Ce message n'est pas dans la liste des messages à réaction.", { ephemeral: true });

    const message = await interaction.channel.messages.fetch(group.message_id);

    for (const emoji of group.roles) {
      message.react(emoji.emoji_id);
    }

    interaction.success("J'ai bien ajouté les réactions.", { ephemeral: true });
  }
};