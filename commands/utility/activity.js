const { ApplicationCommandOptionType, ApplicationCommandType, ChannelType, PermissionFlagsBits } = require("discord.js");

const activities = [
  {
    name: "YouTube Together",
    value: "755600276941176913"
  },
  {
    name: "Poker Night",
    value: "755827207812677713"
  },
  {
    name: "Chess In The Park",
    value: "832012774040141894"
  },
  {
    name: "Fishington.io",
    value: "814288819477020702"
  },
  {
    name: "Betrayal.io",
    value: "773336526917861400"
  }
];

module.exports = {
  description: "Commence ou rejoint une activité vocale.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "channel",
      description: "Le salon vocal dans lequel jouer l'activité.",
      type: ApplicationCommandOptionType.Channel,
      required: true,
      channelTypes: [ChannelType.GuildVoice]
    },
    {
      name: "activity",
      description: "L'activité à jouer dans le salon.",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: activities
    }
  ],
  async run({ client, interaction }) {
    const channel = interaction.options.getChannel("channel", true);
    if (!interaction.guild.members.me.permissionsIn(channel).has(PermissionFlagsBits.CreateInstantInvite)) return interaction.error({ content: "Je n'ai pas les permissions de commencer une activité." });

    return await interaction.guild.invites.create(channel, { targetApplication: interaction.options.getString("activity"), targetType: 2, reason: `${interaction.user.tag} started a game.` })
      .then(invite => interaction.reply({ content: `[Cliquez ici](${invite.toString()}) pour commencer l'activité **${activities.find(activity => activity.value === interaction.options.getString("activity")).name}** dans ${channel.toString()}` }))
      .catch(err => {
        interaction.error({ content: `Une erreur s'est produite lors de la création de l'activité dans le salon ${channel.toString()}, veuillez réessayez.` });
        client.send_error(err, "ACTIVITY INVITE CREATE");
      });
  }
};