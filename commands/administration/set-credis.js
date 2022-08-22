const { ApplicationCommandOptionType, ApplicationCommandType, PermissionFlagsBits } = require("discord.js");

module.exports = {
  description: "Affecte à un membre un nombre de crédits définit.",
  type: ApplicationCommandType.ChatInput,
  permissions: [PermissionFlagsBits.Administrator],
  options: [
    {
      name: "membre",
      description: "Choisissez un membre.",
      type: ApplicationCommandOptionType.User,
      required: true
    },
    {
      name: "credits",
      description: "Nombre de credit.",
      type: ApplicationCommandOptionType.Integer,
      required: true
    }
  ],
  async run({ client, interaction }) {
    const member = interaction.options.getMember("membre");
    const credits = interaction.options.getInteger("credits");

    if (!member) return interaction.error("Je ne trouve pas ce membre sur le serveur.");
    if (member.user.bot) return interaction.error("Vous ne pouvez pas donner des credits à un bot.");
    if (credits < 0) return interaction.error("Vous ne pouvez pas affecter des credits négatif à un membre.");

    const users_db_select = await client.pool.query("SELECT * FROM users where id = $1;", [member.id]);
    const user_db = users_db_select.rows[0];

    if (user_db) {
      await client.pool.query("UPDATE users SET credits = $1 WHERE id = $2;", [credits, member.id]);
    } else {
      await client.pool.query("INSERT INTO users(id, credits, experience, level) VALUES ($1, $2, 0, 0);", [member.id, credits]);
    }

    interaction.success(`J'ai affecté \`${credits}\` crédits à ${member.toString()}.`);
  }
};