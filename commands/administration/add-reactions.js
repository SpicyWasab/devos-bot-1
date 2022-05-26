module.exports = {
  description: 'Ajoute les réactions de rôles au message en question.',
  type: 'CHAT_INPUT',
  permissions: ['ADMINISTRATOR'],
  options: [
    {
      name: 'message',
      description: 'Choisissez le message.',
      type: 'STRING',
      required: true
    }
  ],
  async run({ client, interaction }) {
    const category = interaction.options.getString('category');

    const emojis = client.config.reactions[category]

    if (!emojis || typeof emojis !== 'object') return interaction.success('Ce message n\'est pas dans la liste des messages à réaction.', { ephemeral: true });

    const channel = interaction.guild.channels.cache.get(client.config.reactions.channel_id);
    const message = await channel.messages.fetch(emojis.message_id);

    for (const emoji of Object.values(emojis)) {
      if (typeof emoji === 'object') {
        message.react(emoji.emoji_id);
      }
    }

    interaction.success('J\'ai bien ajouté les réactions.', { ephemeral: true });
  }
};