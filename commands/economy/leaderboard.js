const { ApplicationCommandOptionType, ApplicationCommandType } = require("discord.js");

module.exports = {
  description: "Affiche différents classements.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "level",
      description: "Affiche le classement des niveaux.",
      type: ApplicationCommandOptionType.Subcommand
    },
    {
      name: "credits",
      description: "Affiche le classement des credits.",
      type: ApplicationCommandOptionType.Subcommand
    }
  ],
  async run({ client, interaction }) {
    const leadeboard_type = interaction.options.getSubcommand();

    if (leadeboard_type === "level") {
      const users_db_select = await client.pool.query("SELECT * FROM users ORDER BY experience DESC LIMIT 10");

      const ranks_select = await client.pool.query(`WITH ranking AS (SELECT id, experience, DENSE_RANK() OVER (ORDER BY experience DESC) AS position FROM public.users) SELECT * from ranking WHERE id = ${interaction.member.id};`);
      if (!ranks_select.rowCount) return interaction.error("Personne n'a encore de niveau sur le serveur.");
      const rank = ranks_select.rows[0];

      const embed = {
        color: client.config.colors.main,
        author: {
          name: interaction.guild.name,
          icon_url: interaction.guild.iconURL()
        },
        title: "Level Leadeboard",
        description: "",
        footer: {
          icon_url: client.user.displayAvatarURL(),
          text: client.config.footer
        }
      };

      await users_db_select.rows.forEach(async (userDB, i) => {
        const member = await interaction.guild.members.fetch(userDB.id);
        if (member) embed.description += `${i + 1}. ${member.toString()}\nNiveau : ${userDB.level}, Experience : ${userDB.experience}\n`;
      });

      if (rank.position > users_db_select.rowCount) {
        const user_db_select = await client.pool.query(`SELECT * FROM users WHERE id = ${interaction.member.id}`);
        const user_db = user_db_select.rows[0];
        embed.description += `\n↪ ${rank.position}. ${interaction.member.toString()}\nNiveau : ${user_db.level}, Experience : ${user_db.experience}`;
      }

      interaction.reply({ embeds: [embed] });
    } else if (leadeboard_type === "credits") {
      const users_db_select = await client.pool.query("SELECT * FROM users ORDER BY credits DESC LIMIT 10");

      const ranks_select = await client.pool.query(`WITH ranking AS (SELECT id, credits, DENSE_RANK() OVER (ORDER BY credits DESC) AS position FROM users) SELECT * from ranking WHERE id = ${interaction.member.id};`);
      if (!ranks_select.rowCount) return interaction.error("Personne n'a encore de credits sur le serveur.");
      const rank = ranks_select.rows[0];

      const embed = {
        color: client.config.colors.main,
        author: { name: interaction.guild.name, icon_url: interaction.guild.iconURL() },
        title: "Credits Leadeboard",
        description: "",
        footer: { icon_url: client.user.displayAvatarURL(), text: client.config.footer }
      };

      await users_db_select.rows.forEach(async (user_db, i) => {
        const member = await interaction.guild.members.fetch(user_db.id);
        if (member) embed.description += `${i + 1}. ${member.toString()}\nCredits : ${user_db.credits}\n`;
      });

      if (rank.position > users_db_select.rowCount) {
        const user_db_select = await client.pool.query(`SELECT * FROM users WHERE id = ${interaction.member.id}`);
        const user_db = user_db_select.rows[0];
        embed.description += `\n↪ ${rank.position}. ${interaction.member.toString()}\nCredits : ${user_db.credits}`;
      }

      interaction.reply({ embeds: [embed] });
    }
  }
};