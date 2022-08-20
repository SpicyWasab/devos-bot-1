const { ComponentType } = require("discord.js");

module.exports = {
  async run({ client, interaction }) {
    if (interaction.user.id !== interaction.customId.split(".")[1]) return interaction.deferUpdate();

    if (!interaction.values.length) return interaction.error("Vous n'avez pas choisi d'item.");

    const users_select = await client.pool.query(`SELECT * FROM users where id = ${interaction.user.id}`);
    const user_db = users_select.rows[0];

    if (!user_db) return interaction.error(`${interaction.user.toString()}, Votre profil n'est pas enregistré. Faites la commande \`/create-profile\` ou envoyez un message pour enregistrer un profil.`);

    for (const value of interaction.values) {
      const item = client.config.store.find(s => s.id === value);

      if (user_db.credits < item.credits) return interaction.error(`${interaction.user.toString()}, Il vous manque ${item.credits - user_db.credits} credits pour acheter le produit \`${item.name}\`.`);

      if (item.id === "ad_role") {
        if (interaction.member.roles.cache.has(client.config.ad_role)) return interaction.error(`${interaction.user.toString()}, Vous avez déjà acheter ce produit.`);
        interaction.member.roles.add(client.config.ad_role);
        await client.pool.query(`UPDATE users SET credits =  ${user_db.credits - item.credits} WHERE id = ${interaction.user.id}`);
        interaction.update({
          content: `${interaction.user.toString()}, Vous avez correctement acheté ce produit. Je vous ai débité ${item.credits} credits.`,
          components: [],
          embeds: []
        });
      }

      if (item.id === "color_roles") {
        const color_roles_select = await client.pool.query(`SELECT * FROM color_roles WHERE id = ${interaction.user.id}`);
        const color_roles = color_roles_select.rows;

        const color_roles_filtered = client.config.color_roles.filter(cr => color_roles.findIndex(r => r.color === cr.id) === -1);

        if (!color_roles_filtered.length) interaction.error(`${interaction.user.toString()}, Vous avez déjà acheté tous les rôles de couleur.`);

        const options = [];

        for (const color_role_filtered of color_roles_filtered) {
          options.push({
            label: color_role_filtered.name,
            value: color_role_filtered.id,
            description: `Couleur ID : ${color_role_filtered.id}`,
            emoji: { name: color_role_filtered.emoji }
          });
        }

        interaction.update({
          content: "Choisissez une couleur.",
          embeds: [],
          components: [
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  type: ComponentType.SelectMenu,
                  custom_id: `color-roles.${interaction.user.id}.${item.name}.${item.credits}`,
                  options: options,
                  placeholder: "Choisissez une couleur"
                }
              ]
            }
          ]
        });
      }
    }
  }
};