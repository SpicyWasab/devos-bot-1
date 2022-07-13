module.exports = async (client, message) => {
  if (!message.author.bot) {
    const missions_channel = client.config.missions_channels.find(mission_channel => mission_channel.channel_id === message.channel.id);
    
    if (missions_channel) {
      if (client.config.staff_roles_ids.map(staff_role_id => message.member.roles.cache.has(staff_role_id)).includes(true)) return;

      function message_form_is_valide (text) {
        let apparition = 0;
        const keywords = ["description", "date", "langage", "language", "niveau", "rémunération", "remuneration", "prix", "tarif", "tarifs", "commentaire"];

        for (const keyword of keywords) {
          if (text.toLowerCase().includes(keyword)) apparition++;
        }

        if (apparition < 4) return false;
        return true;
      };

      if (message_form_is_valide(message.content)) {
        message.react(client.config.emojis.success);
      } else {
        await message.delete();
        message.author.send({
          embeds: [
            {
              color: client.config.colors.red,
              title: "Erreur",
              description: `${client.config.emojis.error} \`-\` Votre message dans ${message.channel.toString()} ne respecte pas la [mise en forme demandée](https://discord.com/channels/${message.guild.id}/${missions_channel.channel_id}/${missions_channel.message_id}).\n\n**Votre ancien message :**\n\`\`\`${message.content}\`\`\`\n_Si votre message était conforme, ouvrez un [ticket](https://discord.com/channels/${message.guild.id}/${client.config.ticket_channel_id})._`
            }
          ]
        });

        const mission_logs_channels = message.guild.channels.cache.get(client.config.missions_logs_channel_id) || await message.guild.channels.fetch(client.config.missions_logs_channel_id).catch(() => null);
        mission_logs_channels.send({
          embeds: [
            {
              color: client.config.colors.red,
              title: "Mise en forme non conforme",
              description: `**Message :**\n\`\`\`${message.content}\`\`\``,
              fields:[
                {
                  name: "👤 Membre",
                  value: message.member.toString(),
                  inline: true
                },
                {
                  name: "💬 Channel",
                  value: message.channel.toString(),
                  inline: true
                },
                {
                  name: "📆 Date", 
                  value: `<t:${Math.floor((message.createdAt) / 1000)}>`,
                  inline: true
                }
              ]
            }
          ]
        });        
      }
    }

    if (client.config.suggestion_channel === message.channel.id){
      message.delete();
  
      const suggestion = await message.channel.send({
        embeds : [{
          color: client.config.colors.main,
          description: `**Suggestion:** ${message.content}\nPar : ${message.author}\nLégendes : Bonne idée :white_check_mark:, Mauvaise idée :x: `,
          footer: {
            icon_url: client.user.displayAvatarURL(),
            text: client.config.footer
          }
        }]
      });
  
      suggestion.react("✅");
      suggestion.react("❌");
    }

    const users_db_select = await client.pool.query(`SELECT * FROM users WHERE id = ${message.author.id} LIMIT 1`);
    let user_db = users_db_select.rows[0];

    if (!users_db_select.rowCount) {
      await client.pool.query(`INSERT INTO users(id, credits, experience, level) VALUES (${message.author.id}, 0, 0, 1)`);
      user_db = {
        id: message.member.id,
        credits: 0,
        experience: 0,
        level: 1
      };
    }

    const xp_objectif = user_db.level ** 2 * 100;

    user_db.experience += Math.floor(Math.random() * 7) + 5;

    await client.pool.query(`UPDATE users SET experience = ${user_db.experience} WHERE id = ${message.member.id}`);

    const credits_number = message.member.roles.cache.has(client.config.booster_role) ? 3 : 2;

    if (user_db.experience > xp_objectif) {
      await client.pool.query(`UPDATE users SET credits = ${user_db.credits + credits_number}, level = ${user_db.level + 1} WHERE id = ${message.member.id}`);
      message.channel.send(`Bravo ${message.member.toString()} ! Vous venez de passer au niveau **${user_db.level + 1}**. Vous gagnez \`${credits_number}\` credits en récompense.`);
    }
  }

  if (message.author.id == client.config.disboard_id) {
    if (message.interaction && message.interaction.type === "APPLICATION_COMMAND" && message.interaction.commandName === "bump") {
      const member = message.guild.members.cache.get(message.interaction.user.id);

      if (!member) return;

      const users_db_select = await client.pool.query(`SELECT * FROM users WHERE id = ${member.id} LIMIT 1`); 

      const credits_number = member.roles.cache.has(client.config.booster_role) ? 1 : 0.5;

      if (users_db_select.rowCount) {
        const user_db = users_db_select.rows[0];
        await client.pool.query(`UPDATE users SET credits = ${user_db.credits + credits_number} WHERE id = ${member.id}`);
      } else {
        await client.pool.query(`INSERT INTO users(id, credits, experience, level) VALUES (${message.author.id}, ${credits_number}, 0, 1)`);
      }

      message.react("❤");
      message.reply("Merci de votre soutien! :heart:");
    }
  }
};