const { Client, Collection, Interaction } = require('discord.js');
const { createCanvas, loadImage, registerFont } = require('canvas');
registerFont('./assets/Poppins-Regular.ttf', { family: 'Poppins Regular' });
registerFont('./assets/Poppins-Bold.ttf', { family: 'Poppins Bold' });

/**
 * @param { string } arg
 * @param { object } param1
 * @param { ?boolean } [param1.replied]
 */
Interaction.prototype.success = async function(args, { replied = true, ephemeral = false } = {}) {
  const message = {
    embeds: [{
      color: this.client.config.colors.green,
      title: 'Succès',
      description: `${this.client.config.emojis.success} \`-\` ${args}`,
      footer: {
        icon_url: this.client.user.displayAvatarURL(),
        text: this.client.config.footer
      }
    }],
    ephemeral
  };

  replied === true ? this.reply(message) : this.channel.send(message);
};

/**
 * @param { string } arg
 * @param { object } param1
 * @param { ?boolean } [param1.replied]
 */
Interaction.prototype.error = async function(args, { replied = true, ephemeral = false } = {}) {
  const message = {
    embeds: [{
      color: this.client.config.colors.red,
      title: 'Erreur',
      description: `${this.client.config.emojis.error} \`-\` ${args}`,
      footer: {
        icon_url: this.client.user.displayAvatarURL(),
        text: this.client.config.footer
      }
    }],
    ephemeral
  };

  replied === true ? this.reply(message) : this.channel.send(message);
};

Interaction.prototype.findMember = async function(arg, { allowAuthor = false, random = false } = {}) {
  if (!this.guild) return null;

  if (random === true && arg && arg.toLowerCase() == 'random') return this.guild.members.cache.random();

  const mention = this.mentions.members.first();
  if (mention && (allowAuthor === false ? mention.id !== this.author.id : true)) return mention;
  if (!arg && allowAuthor == true) return this.member;
  if (!arg) return null;

  let member = this.guild.members.cache.get(arg.replace(/\D+/g, '')) || this.guild.members.cache.find(m => m.user.username.toLowerCase().includes(arg) || m.user.tag.toLowerCase().includes(arg.toLowerCase()) || m.displayName.toLowerCase().includes(arg.toLowerCase())) || await this.guild.members.fetch(arg.replace(/\D+/g, '')).catch(() => null);
  if (member instanceof Collection) {
    member = member.get(arg.replace(/\D+/g, '')) || member.find(m => m.user.username.toLowerCase().includes(arg.toLowerCase()) || m.user.tag.toLowerCase().includes(arg.toLowerCase()) || m.displayName.toLowerCase().includes(arg.toLowerCase()));
    if (member && (allowAuthor === false ? member.id !== this.author.id : true)) return member;
    return null;
  } else {
    if (member && (allowAuthor === false ? member.id !== this.author.id : true)) return member;
  }

  return null;
};

/**
 * @param { string } arg
 * @param { object } param1
 * @param { boolean } [param1.allowEveryone]
 */
Interaction.prototype.findRole = async function(arg, { allowEveryone = false } = {}) {
  if (!this.guild) return null;

  const mention = this.mentions.roles.first();
  if (this.guild.roles.cache.get(mention?.id)) return mention;
  if (!arg && allowEveryone === false) return null;
  if (allowEveryone === true && ['@everyone', '@@everyone', this.guild.id].includes(arg)) return this.guild.roles.everyone;
  if (allowEveryone === false && ['@everyone', '@@everyone', this.guild.id].includes(arg)) return null;
  if (!arg) return null;

  let role = this.guild.roles.cache.get(arg.replace(/\D+/g, '')) || this.guild.roles.cache.find(r => r.name.toLowerCase().includes(arg.toLowerCase())) || await this.guild.roles.fetch(arg.replace(/\D+/g, '')).catch(() => null);
  if (role instanceof Collection) {
    role = role.get(arg.replace(/\D+/g, '')) || role.find(r => r.name.toLowerCase().includes(arg.toLowerCase()));
    if (role) return role;
  } else {
    if (role) return role;
  }

  return null;
};

/**
 * @param { string } arg
 */
Interaction.prototype.findChannel = async function(arg) {
  if (!this.guild) return null;

  const mention = this.mentions.channels.first();
  if (this.guild.channels.cache.get(mention?.id)) return mention;
  if (!arg) return null;
  let channel = this.guild.channels.cache.get(arg.replace(/\D+/g, '')) || this.guild.channels.cache.find(c => c.name.toLowerCase().includes(arg.toLowerCase())) || await this.guild.channels.fetch(arg.replace(/\D+/g, '')).catch(() => null);
  if (channel instanceof Collection) {
    channel = channel.get(arg.replace(/\D+/g, '')) || channel.find(c => c.name.toLowerCase().includes(arg.toLowerCase()));
    if (channel) return channel;
  } else {
    if (channel) return channel;
  }

  return null;
};

Client.prototype.welcome_card = async function(member) {
  const canvas = createCanvas(700, 350);
  const ctx = canvas.getContext('2d');

  // Traçage des bordures bleues
  ctx.beginPath();
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = 8;
  ctx.strokeStyle = this.config.colors.blue;
  ctx.moveTo(55, 15);
  ctx.lineTo(canvas.width - 55, 15);
  ctx.quadraticCurveTo(canvas.width - 20, 20, canvas.width - 15, 55);
  ctx.lineTo(canvas.width - 15, canvas.height - 55);
  ctx.quadraticCurveTo(canvas.width - 20, canvas.height - 20, canvas.width - 55, canvas.height - 15);
  ctx.lineTo(55, canvas.height - 15);
  ctx.quadraticCurveTo(20, canvas.height - 20, 15, canvas.height - 55);
  ctx.lineTo(15, 55);
  ctx.quadraticCurveTo(20, 20, 55, 15);
  ctx.lineTo(56, 15);
  ctx.stroke();
  ctx.closePath();

  // Découpe du brackground
  ctx.beginPath();
  ctx.moveTo(65, 25);
  ctx.lineTo(canvas.width - 65, 25);
  ctx.quadraticCurveTo(canvas.width - 25, 25, canvas.width - 25, 65);
  ctx.lineTo(canvas.width - 25, canvas.height - 65);
  ctx.quadraticCurveTo(canvas.width - 25, canvas.height - 25, canvas.width - 65, canvas.height - 25);
  ctx.lineTo(65, canvas.height - 25);
  ctx.quadraticCurveTo(25, canvas.height - 25, 25, canvas.height - 65);
  ctx.lineTo(25, 65);
  ctx.quadraticCurveTo(25, 25, 65, 25);
  ctx.lineTo(66, 25);
  ctx.closePath();
  ctx.clip();

  // Ajout de l'image d'arrière plan
  ctx.globalAlpha = 1;
  ctx.drawImage(await loadImage('./assets/welcome.png'), 10, 10, canvas.width - 20, canvas.height - 20);

  // Grisage du background
  ctx.beginPath();
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = '#000';
  ctx.moveTo(65, 25);
  ctx.lineTo(canvas.width - 65, 25);
  ctx.quadraticCurveTo(canvas.width - 25, 25, canvas.width - 25, 65);
  ctx.lineTo(canvas.width - 25, canvas.height - 65);
  ctx.quadraticCurveTo(canvas.width - 25, canvas.height - 25, canvas.width - 65, canvas.height - 25);
  ctx.lineTo(65, canvas.height - 25);
  ctx.quadraticCurveTo(25, canvas.height - 25, 25, canvas.height - 65);
  ctx.lineTo(25, 65);
  ctx.quadraticCurveTo(25, 25, 65, 25);
  ctx.lineTo(66, 25);
  ctx.fill();
  ctx.closePath();

  // Ajout du premier texte
  ctx.font = '38px "Poppins Bold"';
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText('Bienvenue', canvas.width / 2, 225);

  // Ajout du second texte
  const secondText = 'Devos Code, serveur communautaire d\'aide et d\'apprentissage en programmation !';

  ctx.font = '26px "Poppins Regular"';
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#a7b9c5';
  ctx.textAlign = 'center';

  if(secondText.length > 35) {
    const texts = (function(string) {
      const array = [string, []];
      const substrings = string.split(' ');
      let i = substrings.length;

      do {
        i--;
        array[1].unshift(substrings[i]);
        substrings.pop();
      } while (substrings.join(' ').length > 35);

      array[0] = substrings.join(' ');
      array[1] = array[1].join(' ');
      return array;
    })(secondText);
    ctx.fillText(texts[0], canvas.width / 2, 265);
    ctx.fillText(texts[1], canvas.width / 2, 305);
  } else {
    ctx.fillText(secondText, canvas.width / 2, 265);
  }

  // Dessin du cadre de l'avatar
  ctx.beginPath();
  ctx.globalAlpha = 1;
  ctx.lineWidth = 5;
  ctx.strokeStyle = this.config.colors.blue;
  ctx.arc(canvas.width / 2, 110, 66, 0, Math.PI * 2);
  ctx.stroke();
  ctx.closePath();

  // Découpe de l'avatar
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 110, 60, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  // Ajout de l'image utilisateur
  ctx.globalAlpha = 1;
  ctx.drawImage(await loadImage(member.user.displayAvatarURL({ format: 'png' })), canvas.width / 2 - 60, 50, 120, 120);

  return canvas.toBuffer();
};