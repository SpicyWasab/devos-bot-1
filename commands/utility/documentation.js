const { ApplicationCommandOptionType, ApplicationCommandType } = require("discord.js");
const { JSDOM } = require("jsdom");
const fetch = require("node-fetch");

const documentations = {
  MDN: {
    url: "https://developer.mozilla.org/api/v1/search?q=%s&locale=fr",
    async get_emebd(results) {
      const { documents: pages } = results;

      // eslint-disable-next-line no-throw-literal
      if (pages.length === 0) throw "Aucun résultat n'a été trouvé";

      const [ page ] = pages;
      const { title, summary, mdn_url } = page;

      const embed = {
        author: {
          name: `MDN - ${title}`,
          icon_url: "https://developer.mozilla.org/apple-touch-icon.6803c6f0.png",
          url: `https://developer.mozilla.org${mdn_url}`
        },
        description: `${summary}\n\n[Lire plus](https://developer.mozilla.org${mdn_url})`,
        fields: []
      };

      const { window: { document } } = await JSDOM.fromURL(`https://developer.mozilla.org${mdn_url}`, { resources: "usable" });
      const editorUrl = document.querySelector("iframe.interactive")?.src;
      const example_pre_element = document.querySelector("pre");
      const available_languages = ["html", "css", "js"];

      let code_element;
      let language;

      if (editorUrl) {
        const { window: { document: editorDocument } } = await JSDOM.fromURL(editorUrl);
        const example_code_element = editorDocument.querySelector("code");

        language = available_languages.find(available_language => example_code_element.id.includes(available_language) || example_code_element.className.includes(available_language));
        language = language ?? editorDocument.querySelector("button[role=\"tab\"]").id;
        code_element = example_code_element;
      } else if (example_pre_element) {
        language = available_languages.find(available_language => example_pre_element.className.includes(available_language));
        code_element = example_pre_element;
      }

      const exampleCode = code_element?.textContent;
      if (exampleCode) embed.fields.push({ name: "Exemple", value: `\`\`\`${language}\n${exampleCode}\`\`\`` });

      return embed;
    }
  }
};

const documentation_choices = Object.keys(documentations).map(d => { return { name: d, value: d }; });

module.exports = {
  description: "Fais des recherche sur la documentation en question.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "documentation",
      description: "Choisis la documentatin.",
      type: ApplicationCommandOptionType.String,
      choices: documentation_choices,
      required: true
    },
    {
      name: "recherche",
      description: "Fais ta recherche.",
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],
  async run({ client, interaction }) {
    const documentation_name = interaction.options.getString("documentation");
    const query = interaction.options.getString("recherche");

    if (!documentation_name) return interaction.error("Aucune documentation n'a été spécifiée.");
    if (!query) return interaction.error("Aucune recherche n'a été spécifiée.");

    const { url, get_emebd } = documentations[documentation_name] ?? {};

    if (!url || !get_emebd) return interaction.error(`La documentation ${documentation_name} n'a pas été trouvée.`);

    const query_url = url.replace("%s", encodeURI(query));

    await interaction.deferReply();

    try {
      const res = await fetch(query_url);

      if (res.statusText !== "OK") interaction.error("Une erreur est survenue en tentant d'accéder à la documentation.");

      const requestJson = await res.json();

      const embed = {
        color: client.config.colors.main,
        ...await get_emebd(requestJson),
        footer: { text: client.config.footer, icon_url: client.user.displayAvatarURL() }
      };

      await interaction.editReply({ embeds: [embed] });
    } catch(err) {
      if (typeof err === "string") {
        return interaction.error(err, { replied: false });
      } else {
        console.log(err);
        interaction.error("Une erreur est survenue.", { replied: false });
      }
    }
  }
};