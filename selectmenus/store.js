const { ComponentType } = require("discord.js");
const Inventory = require("../base/Typedef/Inventory");

module.exports = {
  async run({ client, interaction }) {
    if (interaction.user.id !== interaction.customId.split(".")[1]) return interaction.deferUpdate();

    if (!interaction.values.length) return interaction.error("Vous n'avez pas choisi d'item.");

    const users_db_select = await client.pool.query("SELECT * FROM users WHERE user_id = $1", [interaction.user.id]);
    const user_db = users_db_select.rows[0];
    const inventories_db_select = await client.pool.query("SELECT * FROM inventories WHERE user_id = $1", [interaction.user.id]);
    const inventories_db = inventories_db_select.rows;

    if (!user_db) return interaction.error(`${interaction.user.toString()}, Votre profil n'est pas enregistré. Faites la commande \`/create-profile\` ou envoyez un message pour enregistrer un profil.`);

    for (const value of interaction.values) {
      const item = client.config.store.find(s => s.id === value);

      if (user_db.credits < item.credits) return interaction.error(`${interaction.user.toString()}, Il vous manque ${item.credits - user_db.credits} credits pour acheter le produit \`${item.name}\`.`);

      if (item.id === "ad_role") {
        if (inventories_db.findIndex(inventory => inventory.item === Inventory.Ad) !== -1) return interaction.error(`${interaction.user.toString()}, Vous avez déjà acheté ce produit.`);
        interaction.member.roles.add(client.config.ad_role);
        await client.pool.query("UPDATE users SET credits = $1 WHERE user_id = $2", [user_db.credits - item.credits, interaction.user.id]);
        await client.pool.query("INSERT INTO inventories (user_id, item) VALUES ($1, $2)", [interaction.user.id, Inventory.Ad]);
        interaction.update({ content: `${interaction.user.toString()}, Vous avez correctement acheté ce produit. Je vous ai débité ${item.credits} credits.`, components: [], embeds: [] });
      }

      if (item.id === "change_nickname_role") {
        if (inventories_db.findIndex(inventory => inventory.item === Inventory.ChangeNickname) !== -1) return interaction.error(`${interaction.user.toString()}, Vous avez déjà acheté ce produit.`);
        interaction.member.roles.add(client.config.change_nickname_role);
        await client.pool.query("UPDATE users SET credits = $1 WHERE user_id = $2", [user_db.credits - item.credits, interaction.user.id]);
        await client.pool.query("INSERT INTO inventories (user_id, item) VALUES ($1, $2)", [interaction.user.id, Inventory.ChangeNickname]);
        interaction.update({ content: `${interaction.user.toString()}, Vous avez correctement acheté ce produit. Je vous ai débité ${item.credits} credits.`, components: [], embeds: [] });
      }

      if (item.id === "color_roles") {
        const color_roles_select = await client.pool.query("SELECT * FROM color_roles WHERE user_id = $1", [interaction.user.id]);
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