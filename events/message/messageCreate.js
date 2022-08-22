module.exports = async (client, message) => {
  if (!message.member || !message.guild) return;
  if (!message.author.bot) {
    if (!client.config.staff_roles_id.some(staff_role_id => message.member.roles.cache.has(staff_role_id))) {
      let message_count = client.anti_spam[message.member.id];
      if (message_count) {
        message_count += 1;
        client.anti_spam[message.member.id] = message_count;
        if (message_count === 4) message.channel.send(`${message.member.toString()}, vous parlez trop vite, vous risquez de vous faire bannir.`);
        if (message_count === 6 && message.member.bannable) message.member.ban({ deleteMessageDays: 1, reason: "Anti-Spam" }).catch(() => null);
      } else {
        client.anti_spam[message.member.id] = 1;
        setTimeout(() => delete client.anti_spam[message.member.id], 10000);
      }

      const invite_links = ["discord.gg", "discord.com/invite"];

      for (const invite_link of invite_links) {
        if (message.content.includes(invite_link)) {
          const code = message.content.split(invite_link)[1].split(" ")[0];

          console.log(code);
          const is_guild_invite = message.guild.invites.cache.has(code);

          if (!is_guild_invite) {
            const vanity = await message.guild.fetchVanityData();
            if (code !== vanity?.code && message.deletable) message.delete().catch(() => null);
          }
        }
      }
    }

    if (message.mentions.everyone) {
      let everyone_count = client.anti_everyone[message.member.id];
      if (everyone_count) {
        everyone_count += 1;
        client.anti_everyone[message.member.id] = everyone_count;
        if (everyone_count === 3 && message.deletable) message.delete().catch(() => null);
        if (everyone_count === 5 && message.member.bannable) message.member.ban({ deleteMessageDays: 1, reason: "Anti-Everyone" }).catch(() => null);
      } else {
        client.anti_everyone[message.member.id] = 1;
        setTimeout(() => delete client.anti_everyone[message.member.id], 15000);
      }
    }

    const missions_channel = client.config.missions_channels.find(mission_channel => mission_channel.channel_id === message.channel.id);

    if (missions_channel) {
      if (client.config.staff_roles_id.some(staff_role_id => message.member.roles.cache.has(staff_role_id))) return;

      const message_form_is_valide = function(text) {
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
              fields: [
                {
                  name: "👤 Membre",
                  value: message.member.toString(),
                  inline: true
                },
                {
                  name: "💬 Salon",
                  value: message.channel.toString(),
                  inline: true
                },
                {
                  name: "📆 Date",
                  value: `<t:${Math.floor(message.createdAt / 1000)}>`,
                  inline: true
                }
              ]
            }
          ]
        });
      }
    }

    if (client.config.suggestion_channel === message.channel.id) {
      message.delete();

      const suggestion = await message.channel.send({
        embeds: [{
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

    const users_db_select = await client.pool.query("SELECT * FROM users WHERE user_id = $1", [message.author.id]);
    let user_db = users_db_select.rows[0];

    if (!users_db_select.rowCount) {
      await client.pool.query("INSERT INTO users(id, credits, experience, level) VALUES ($1, 0, 0, 1)", [message.author.id]);
      user_db = {
        id: message.member.id,
        credits: 0,
        experience: 0,
        level: 1
      };
    }

    const xp_objectif = user_db.level ** 2 * 100;

    user_db.experience += Math.floor(Math.random() * 7) + 5;

    await client.pool.query("UPDATE users SET experience = $1 WHERE user_id = $2", [user_db.experience, message.member.id]);

    const credits_number = message.member.roles.cache.has(client.config.booster_role) ? 4 : 3;

    if (user_db.experience > xp_objectif) {
      await client.pool.query("UPDATE users SET credits = $1, level = $2 WHERE user_id = $3", [user_db.credits + credits_number, user_db.level + 1, message.member.id]);
      message.channel.send(`Bravo ${message.member.toString()} ! Vous venez de passer au niveau **${user_db.level + 1}**. Vous gagnez \`${credits_number}\` credits en récompense.`);
    }

    if (user_db.credits >= 100 && !message.member.roles.cache.has(client.config.rich_role_id)) {
      message.member.roles.add(client.config.rich_role_id);
    } else if (user_db.credits < 100 && message.member.roles.cache.has(client.config.rich_role_id)) {
      message.member.roles.remove(client.config.rich_role_id);
    }
  }

  if (message.author.id === client.config.disboard_id) {
    if (message.interaction && message.interaction.type === "APPLICATION_COMMAND" && message.interaction.commandName === "bump") {
      const member = message.guild.members.cache.get(message.interaction.user.id);

      if (!member) return;

      const users_db_select = await client.pool.query("SELECT * FROM users WHERE user_id = $1;", [member.id]);

      const credits_number = member.roles.cache.has(client.config.booster_role) ? 1 : 0.5;

      if (users_db_select.rowCount) {
        const user_db = users_db_select.rows[0];
        await client.pool.query("UPDATE users SET credits = $1 WHERE user_id = $2;", [user_db.credits + credits_number, member.id]);
      } else {
        await client.pool.query(`INSERT INTO users(id, credits, experience, level) VALUES (${message.author.id}, ${credits_number}, 0, 1)`);
      }

      message.react("❤");
      message.reply("Merci de votre soutien! :heart:");
    }
  }
};