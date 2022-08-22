module.exports = {
  async run({ client, interaction }) {
    if (interaction.user.id !== interaction.customId.split('.')[1]) return interaction.deferUpdate();

    const color = interaction.values[0];
    const color_role = client.config.color_roles.find(c => c.id === color);

    if (!color_role) interaction.error(`Je ne trouve pas le rôle de couleur ${color}.`);

    const color_roles_select = await client.pool.query("SELECT * FROM color_roles WHERE user_id = $1", [interaction.user.id]);

    if (color_roles_select.rows.find(r => r.color === color)) return interaction.error("Vous avez déjà acheté ce rôle de couleur.");

    const users_db_select = await client.pool.query("SELECT * FROM users WHERE user_id = $1", [interaction.user.id]);
    const user_db = users_db_select.rows[0];

    const item = {
      name: interaction.customId.split('.')[2],
      credits: interaction.customId.split('.')[3]
    };

    if (user_db.credits < item.credits) return interaction.error(`${interaction.user.toString()}, Il vous manque ${item.credits - user_db.credits} credits pour acheter le produit \`${item.name}\`.`);

    await client.pool.query(`INSERT INTO color_roles(id, color) VALUES (${interaction.user.id}, '${color}')`);

    const member = await interaction.guild.members.fetch(interaction.user.id);
    member.roles.add(color_role.role_id);

    await client.pool.query("UPDATE users SET credits = $1 WHERE user_id = $2;", [user_db.credits - item.credits, interaction.user.id]);
    interaction.update({
      content: `${interaction.user.toString()}, Vous avez correctement acheté le rôle \`${client.config.color_roles.find(cr => cr.id === color).name}\`. Je vous ai débité ${item.credits} credits.`,
      components: []
    });
  }
};