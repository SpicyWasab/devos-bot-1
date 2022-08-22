const { ApplicationCommandOptionType, ApplicationCommandType, PermissionFlagsBits } = require("discord.js");

module.exports = {
  description: "Donne 1 credit à une personne ayant aidé.",
  type: ApplicationCommandType.ChatInput,
  permissions: [PermissionFlagsBits.Administrator],
  options: [
    {
      name: "membre",
      description: "Choisissez un membre.",
      type: ApplicationCommandOptionType.User,
      required: true
    }
  ],
  async run({ client, interaction }) {
    const member = interaction.options.getMember("membre");

    if (!member) return interaction.error("Je ne trouve pas ce membre sur le serveur.");
    if (member.user.bot) return interaction.error("Vous ne pouvez pas donner des credits à un bot.");

    const users_db_select = await client.pool.query("SELECT * FROM users WHERE user_id = $1;", [member.id]);
    const user_db = users_db_select.rows[0];

    if (user_db) {
      await client.pool.query("UPDATE users SET credits = $1 WHERE id = $2;", [user_db.credits + 1, member.id]);
    } else {
      await client.pool.query("INSERT INTO users (id, credits, experience, level) VALUES ($1, 1, 0, 0);", [member.id]);
    }

    interaction.success(`J'ai donné \`1\` credit à ${member.toString()}. Merci à lui pour sa participation.`);
  }
};