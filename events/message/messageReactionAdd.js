module.exports = async (client, messageReaction, user) => {
  const group = client.config.reactions.find(r => r.message_id === messageReaction.message.id);

  if (!group) return;

  const emoji = group.roles.find(role => role.emoji_id === (messageReaction.emoji.id ? messageReaction.emoji.id : messageReaction.emoji.name));

  if (!emoji || !emoji.role_id) return;

  const member = messageReaction.message.guild.members.cache.get(user.id) || await messageReaction.message.guild.members.fetch(user.id).catch(() => null);

  member.roles.add(emoji.role_id).catch(() => null);
};