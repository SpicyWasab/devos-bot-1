module.exports = async (client, messageReaction, user) => {
  const emojis = client.config.reactions[messageReaction.message.id]

  if (!emojis) return;

  console.log(messageReaction.emoji);
  
  const emoji = emojis[messageReaction.emoji.id ? messageReaction.emoji.id : messageReaction.emoji.name];

  if (!emoji || !emoji.role_id) return;

  const member = messageReaction.message.guild.members.cache.get(user.id);

  member.roles.remove(emoji.role_id);
}