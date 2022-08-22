module.exports = {
  async run({ client, interaction }) {
    if (interaction.user.id !== interaction.customId.split('.')[1]) return interaction.deferUpdate();

    const color_roles_select = await client.pool.query("SELECT * FROM color_roles WHERE user_id = $1;", [interaction.user.id]);
    const color_roles = color_roles_select.rows;

    for (const color_role of color_roles) {
      interaction.member.roles.remove(client.config.color_roles.find(cr => cr.id === color_role.color).role_id);
    }

    interaction.member.roles.add(client.config.color_roles.find(cr => cr.id === interaction.values[0]).role_id);

    interaction.update({
      content: `Je vous ai correctement mit le rôle \`${client.config.color_roles.find(cr => cr.id === interaction.values[0]).name}\`.`,
      components: []
    });
  }
};