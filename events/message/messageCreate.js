

module.exports = async (client, message) => {
  
  const channel = message.channel
  if (!message.author.bot) {
    const usersDB = await client.pool.query(`SELECT * FROM users WHERE id = ${message.author.id}`);
    let userDB = usersDB.rows[0];

    if (!userDB) {
      await client.pool.query(`INSERT INTO users(id, credits, experience, level) VALUES (${message.author.id}, 0, 0, 1)`);
      userDB = {
        id: message.member.id,
        credits: 0,
        experience: 0,
        level: 1
      };
    }

    const xpObjectif = userDB.level ** 2 * 100;

    userDB.experience += Math.floor(Math.random() * 7) + 5;

    await client.pool.query(`UPDATE users SET experience = ${userDB.experience} WHERE id = ${message.member.id}`);

    const credits_number = message.member.roles.cache.has(client.config.booster_role) ? 3 : 2;

    if (userDB.experience > xpObjectif) {
      await client.pool.query(`UPDATE users SET credits = ${userDB.credits + credits_number}, level = ${userDB.level + 1} WHERE id = ${message.member.id}`);
      message.channel.send(`Bravo ${message.member.toString()} ! Vous venez de passer au niveau **${userDB.level + 1}**. Vous gagnez \`${credits_number}\` credits en récompense.`);
    }
  }

  if (message.author.id == client.config.disboard_id) {
    if (message.interaction && message.interaction.type === "APPLICATION_COMMAND" && message.interaction.commandName === "bump") {
      const member = message.guild.members.cache.get(message.interaction.user.id);

      if (!member) return;

      const usersDB = await client.pool.query(`SELECT * FROM users WHERE id = ${member.id}`);
      const userDB = usersDB.rows[0];

      const credits_number = member.roles.cache.has(client.config.booster_role) ? 1 : 0.5;

      await client.pool.query(`UPDATE users SET credits = ${userDB.credits + credits_number} WHERE id = ${member.id}`);

      message.react('❤');
      message.reply("Merci de votre soutien! :heart:");
    }
  }

  if (!message.author.bot && client.config.suggestion_channel === message.channel.id){
    message.delete();

    const suggestion = await channel.send({
      embeds : [{
        color: client.config.colors.main,
        description: `**Suggestion:** ${message.content}\nPar : ${message.author}\nLégendes : Bonne idée :white_check_mark:, Mauvaise idée :x: `,
        footer: {
          icon_url: client.user.displayAvatarURL(),
          text: client.config.footer
        }
      }]
    });

    suggestion.react('✅');
    suggestion.react('❌');
  }
};