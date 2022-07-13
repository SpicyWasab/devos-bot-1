module.exports = {
  description: "Execute du code javascript.",
  type: "CHAT_INPUT",
  options: [
    {
      name: "code",
      description: "Code à executer.",
      type: "STRING",
      required: true
    }
  ],
  async run({ client, interaction }) {
    await interaction.deferReply();
    const code = interaction.options.getString("code");
    return new Promise((res) => res(eval(code)))
      .then(outpout => interaction.editReply({ embeds: [{ color: client.config.colors.main, description: "**📥 Entrée**\n```js\n" + code.slice(0, 1000).replace(client.token, "nop") + "\n```\n**📤 Sortie**\n```js\n" + require("util").inspect(outpout, false, 0).slice(0, 1000).replace(client.token, "nop") + "\n```" }] }))
      .catch(err => interaction.editReply({ embeds: [{ color: client.config.colors.red, title: client.config.emojis.error + " Erreur", description: "```js\n" + err.message + "\n```" }] }));
  }
};