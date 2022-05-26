module.exports = (client, interaction) => {
  if (interaction.isCommand()) {
    const command = client.commands[interaction.commandName] || Object.values(client.commands).find(c => c.aliases?.includes(interaction.commandName));

    if (!command) return interaction.error('Cette commande n\'existe pas ou n\'existe plus.');
    if (command.permissions) {
      if (!interaction.member.permissions.has(command.permissions)) return interaction.error('Vous n\'avez pas la permission de faire cette commande.', { ephemeral: true });
    }

    command.run({ client, interaction });
    console.log(`${interaction.user.tag} à fait la commande ${interaction.commandName}`);
  }

  if (interaction.isSelectMenu()) {
    const selectmenu = client.selectmenus[interaction.customId.split('.')[0]];
    
    if (!selectmenu) return interaction.error('Ce select menu n\'existe pas ou n\'existe plus.', { ephemeral: true });
    
    selectmenu.run({ client, interaction });
  }

  if (interaction.isButton()) {
    const button = client.buttons[interaction.customId.split('.')[0]];
    
    if (!button) return interaction.error('Ce button n\'existe pas ou n\'existe plus.', { ephemeral: true });
    
    button.run({ client, interaction });
  }
};