const { ApplicationCommandOptionType, ApplicationCommandType, PermissionsBitField } = require("discord.js");

module.exports = {
  description: "Affiche la liste des commande ou des informations sur une commande.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "commande",
      description: "Informations sur une commande.",
      type: ApplicationCommandOptionType.String
    }
  ],
  async run({ client, interaction }) {
    const commandName = interaction.options.getString("commande");

    if (!commandName) {
      interaction.reply({
        embeds: [{
          color: client.config.colors.main,
          title: "Liste des commandes",
          description: "Toutes les commandes ci-dessous s'effectuent en slash commande (`/`).",
          fields: [
            {
              name: `${client.config.emojis.administration} Administration`,
              value: Object.values(client.commands).filter(c => c.category === "administration").map(command => `\`${command.name}\``).join(", ")
            },
            {
              name: `${client.config.emojis.economy} Economie`,
              value: Object.values(client.commands).filter(c => c.category === "economy").map(command => `\`${command.name}\``).join(", ")
            },
            {
              name: `${client.config.emojis.utility} Utilitaire`,
              value: Object.values(client.commands).filter(c => c.category === "utility").map(command => `\`${command.name}\``).join(", ")
            }
          ],
          footer: {
            icon_url: client.user.displayAvatarURL(),
            text: client.config.footer
          }
        }]
      });
    } else {
      const command = client.commands[commandName.toLowerCase()] || Object.values(client.commands).find(c => c.aliases?.includes(commandName.toLowerCase()));

      if (!command) return interaction.error("Je ne trouve pas cette commande.");

      const embed = {
        color: client.config.colors.main,
        title: `Commande ${command.name}`,
        description: command.description,
        fields: [],
        footer: {
          icon_url: client.user.displayAvatarURL(),
          text: client.config.footer
        }
      };

      if (command.aliases) embed.fields.push({ name: "Aliases", value: command.aliases.map(alias => `\`${alias}\``).join(", ") });
      if (command.options) embed.fields.push({ name: "Options", value: command.options.map(option => `\`${option.name}\`: ${option.description}`).join("\n") });
      if (command.defaultMemberPermissions) embed.fields.push({ name: "Permissions", value: new PermissionsBitField(command.defaultMemberPermissions).toArray().map(permission => `\`${client.config.permissions[permission]}\``).join(", ") });

      interaction.reply({ embeds: [embed] });
    }
  }
};