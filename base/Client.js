const { ApplicationCommandType, Client, GatewayIntentBits, IntentsBitField, Partials } = require("discord.js");
const { lstatSync, readdirSync } = require("fs");
const path = require("path");
const pool = require(path.resolve("./database/connection"));

class CustomClient extends Client {
  constructor(options) {
    super({
      allowedMentions: { parse: ["users"], repliedUser: true },
      partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.Reaction, Partials.GuildVoiceStates],
      intents: new IntentsBitField().add([GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessages, GatewayIntentBits.Guilds, GatewayIntentBits.GuildBans, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildPresences])
    });

    this.pool = pool;
    console.log("[PostgreSQL]: I'm connected.");
    this.commands = {};
    this.buttons = {};
    this.selectmenus = {};
    this.slashs = [];
    this.anti_spam = {};
    this.anti_everyone = {};
    this.add_bot = false;
    this.config = options.config;
  }

  login(token) {
    super.login(token);

    return this;
  }

  loadCommands() {
    readdirSync("./commands").forEach(category => {
      readdirSync(`./commands/${category}`).filter(file => lstatSync(`./commands/${category}/${file}`).isFile() && file.endsWith(".js")).forEach(file => {
        const command = require(`../commands/${category}/${file}`);
        const commandName = file.split(".")[0];

        if (command.type === ApplicationCommandType.ChatInput) {
          this.slashs.push({
            name: commandName,
            description: command.description,
            options: command.options,
            defaultMemberPermissions: command.permissions || [],
            type: command.type
          });
        } else {
          this.slashs.push({ name: commandName, type: command.type });
        }

        this.commands[commandName] = Object.assign(command, { category: category, name: commandName });

        if (command.aliases) {
          command.aliases.forEach(alias => {
            if (command.type === ApplicationCommandType.ChatInput) {
              this.slashs.push({
                name: alias,
                description: command.description,
                options: command.options,
                defaultMemberPermissions: command.permissions || [],
                type: command.type
              });
            } else {
              this.slashs.push({ name: alias, type: command.type });
            }
          });
        }
      });
    });
  }

  loadEvents() {
    readdirSync("./events").forEach(category => {
      readdirSync(`./events/${category}`).forEach(file => {
        const event = require(`../events/${category}/${file}`);

        super.on(file.split(".")[0], (...args) => event(this, ...args));
      });
    });
  }

  loadButtons() {
    readdirSync("./buttons").forEach(file => {
      const button = require(`../buttons/${file}`);
      const buttonName = file.split(".")[0];
      this.buttons[buttonName] = Object.assign(button, { name: buttonName });
    });
  }

  loadSelectMenus() {
    readdirSync("./selectmenus").forEach(file => {
      const selectmenu = require(`../selectmenus/${file}`);
      const selectmenuName = file.split(".")[0];
      this.selectmenus[selectmenuName] = Object.assign(selectmenu, { name: selectmenuName });
    });
  }
}

module.exports = CustomClient;