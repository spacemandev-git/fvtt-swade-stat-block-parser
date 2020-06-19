import { registerSettings } from "./settings.js";
import { buildActor } from "./buildActor.js";
import { logger } from "./util.js";

Hooks.once("init", async () => {
  logger("Initalizing Statblock Importer...");
  registerSettings();
  logger("Done Initializing!");
});
Hooks.once("setup", () => {});
Hooks.once("ready", () => {});
Hooks.on("renderActorDirectory", (app, html, data) => {
  const importButton = $(
    '<button  style="min-width: 96%; margin: 10px 6px;">Statblock Import</button>'
  );
  html.find(".directory-footer").append(importButton);
  let dialogTemplate = `
    <p>${game.i18n.localize(
      "SWADE.Name"
    )}: <input type="text" id="actorName"></input></p>
    <p>Statblock:</p>
    <textarea id="statblock"></textarea>
    <p>
    Actor Type:
    <select id="actorType">
      <option value="npc">npc</option>
      <option value="character">character</option>
    </select>
    </p>
  `;

  importButton.click((ev) => {
    logger("Import Button Pressed");
    new Dialog({
      title: "Import Statblock",
      content: dialogTemplate,
      buttons: {
        Import: {
          label: game.i18n.localize("Statblock.Import"),
          callback: (html) => {
            buildActor(
              html.find("#actorName")[0].value,
              html.find("#statblock")[0].value,
              html.find("#actorType")[0].value
            );
          },
        },
        Cancel: {
          label: game.i18n.localize("SWADE.Cancel"),
        },
      },
    }).render(true);
  });
});
