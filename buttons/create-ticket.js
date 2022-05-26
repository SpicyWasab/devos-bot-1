module.exports = {
  async run({ client, interaction }) {
    const { guild } = interaction;
    const { user } = interaction;
    const ticket_category = guild.channels.cache.get(client.config.ticket_category_id);
    const category_channels_size = guild.channels.cache.filter(c => c.name.startsWith(`ticket-${user.discriminator}`)).size;

    const ticket = await ticket_category.createChannel(`ticket-${user.discriminator}-${category_channels_size + 1}`, {
      permissionOverwrites: [
        {
          id: guild.id,
          deny: ['VIEW_CHANNEL']
        },
        {
          id: user.id,
          allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
        }
      ]
    });

    for (const id of client.config.staff_roles) {
      const role = guild.roles.cache.find(r => r.id === id)

      if (role) ticket.permissionOverwrites.edit(role, { VIEW_CHANNEL: true, SEND_MESSAGES: true })
    }

    const ticket_message = await ticket.send({
      content: `${user.toString()}, Voici votre ticket.`,
      embeds: [
        {
          color: client.config.colors.main,
          description: 'Le staff vous contactera sous peu.\nPour fermer ce ticket, réagissez avec 🔒',
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
              label: "Fermer le ticket",
              emoji: '🔒',
              style: 2,
              custom_id: `close-ticket`
            }
          ]
        }
      ]
    });

    ticket_message.pin();

    interaction.reply({ content: `Ticket crée ${ticket}`, ephemeral: true });
  }
};