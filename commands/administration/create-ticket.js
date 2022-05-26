module.exports = {
  description: 'Crée le panel de ticket.',
  type: 'CHAT_INPUT',
  permissions: ['ADMINISTRATOR'],
  async run({ client, interaction }) {
    const ticket_channel = interaction.guild.channels.cache.get(client.config.ticket_channel_id);

    interaction.reply({ content: 'Panel de ticket crée avec succès.', ephemeral: true });

    const ticket_message = await ticket_channel.send({
      embeds: [
        {
          color: client.config.colors.main,
          title: 'Ticket',
          description: 'Pour créer un ticket, réagissez avec :envelope_with_arrow:',
          footer: {
            icon_url: client.user.displayAvatarURL(),
            text: client.config.footer
          }
        }
      ],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              label: "Créer un ticket",
              emoji: '📩',
              style: 2,
              custom_id: "create-ticket"
            }
          ]
        }
      ]
    });
  }
};