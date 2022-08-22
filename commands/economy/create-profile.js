const { ApplicationCommandType } = require("discord.js");

module.exports = {
  description: "Crée vote profil si vous n'en avez pas.",
  type: ApplicationCommandType.ChatInput,
  async run({ client, interaction }) {
    const users_db_select = await client.pool.query("SELECT * FROM users WHERE user_id = $1;", [interaction.user.id]);
    const users_db = users_db_select.rows[0];

    if (users_db) return interaction.error("Vous avez déjà un profil. Faites la commande `/credits` pour voir votre nombre de credit.");

    await client.pool.query("INSERT INTO users(id, credits, experience, level) VALUES ($1, 0, 0, 1);", [interaction.user.id]);
    interaction.success("Votre profile a bien été crée. Faites la commande `/credits` pour voir votre nombre de credit.");
  }
};