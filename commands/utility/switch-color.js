const { ApplicationCommandType } = require("discord.js");

module.exports = {
  description: "Changer la couleur de votre pseudo.",
  type: ApplicationCommandType.ChatInput,
  async run({ client, interaction }) {
    const color_roles_select = await client.pool.query(`SELECT * FROM color_roles WHERE id = ${interaction.user.id}`);
    const color_roles = color_roles_select.rows;

    if (!color_roles.length) return interaction.error(`${interaction.user.toString()}, Vous n'avez acheté aucun rôle de couleur.`);

    const options = [];

    for (const color_role of color_roles) {
      options.push({
        label: client.config.color_roles.find(cr => cr.id === color_role.color).name,
        value: color_role.color,
        description: `Couleur ID : ${color_role.color}`,
        emoji: {
          name: client.config.color_roles.find(cr => cr.id === color_role.color).emoji
        }
      });
    }

    interaction.reply({
      content: "Choisissez la nouvelle couleur à mettre parmis vos couleurs achetés.",
      components: [
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: `switch-color-roles.${interaction.user.id}`,
              options: [options],
              placeholder: "Choisissez une couleur"
            }
          ]
        }
      ]
    });
  }
};