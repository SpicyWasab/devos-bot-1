const { ApplicationCommandOptionType, ApplicationCommandType } = require("discord.js");

module.exports = {
  description: "Envoyer à un membre un peu de vos crédits.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "membre",
      description: "Le membre qui va recevoir vos crédits.",
      type: ApplicationCommandOptionType.User,
      required: true
    },
    {
      name: "credits",
      description: "Le nombre de crédits que tu souhaites lui donner.",
      type: ApplicationCommandOptionType.Integer,
      required: true
    }
  ],
  async run({ client, interaction }) {
    const member = interaction.options.getMember("membre");
    const credits = interaction.options.getInteger("credits");

    if (!member) return interaction.error("Je ne trouve pas ce membre sur le serveur.");
    if (member.user.bot) return interaction.error("Vous ne pouvez pas envoyer des credits à un bot.");
    if (credits < 0) return interaction.error("Vous ne pouvez pas envoyer des credits négatif à un membre.");

    const users_db_select_member = await client.pool.query("SELECT * FROM users WHERE user_id = $1;", [member.id]);
    const user_db_member = users_db_select_member.rows[0];
    const users_db_select_author = await client.pool.query("SELECT * FROM users WHERE user_id = $1;", [interaction.user.id]);
    const user_db_author = users_db_select_author.rows[0];

    if (!user_db_author) {
      await client.pool.query("INSERT INTO users(id, credits, experience, level) VALUES ($1, 1, 0, 0);", [interaction.user.id]);
      return interaction.error("Vous n'avez pas assez de crédits pour réaliser cette transaction.");
    }

    if (user_db_author.credits < credits) return interaction.error("Vous n'avez pas assez de crédits pour réaliser cette transaction.");

    if (user_db_member) {
      await client.pool.query(`UPDATE users SET credits = $1 WHERE user_id = $2;`, [user_db_member.credits + credits, member.id]);
    } else {
      await client.pool.query("INSERT INTO users(id, credits, experience, level) VALUES ($1, $2, 0, 0);", [member.id, credits]);
    }
    await client.pool.query("UPDATE users SET credits = $1 WHERE user_id = $2;", [user_db_author.credits - credits, interaction.user.id]);
    interaction.success(`${interaction.user.toString()} a envoyé \`${credits}\` crédits à ${member.toString()}.`);
  }
};