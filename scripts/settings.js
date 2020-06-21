import { logger, getItemCompendiums } from "./util.js";
let mod = "fvtt-swade-stat-block-parser";

export class Settings {
  static registerSettings() {
    game.settings.registerMenu(mod, "settingsMenu", {
      name: "Exclude Item Compendiums",
      label: "Exclude Compendiums",
      icon: "fas fa-book",
      type: SettingsForm,
      restricted: true,
    });

    let itemCompendiumList = getItemCompendiums();
    for (let compendium of itemCompendiumList) {
      console.log(
        `Registering Setting for ${compendium} as ${compendium.replace(
          ".",
          "-"
        )}-excluded`
      );
      game.settings.register(mod, compendium.replace(".", "-") + "-excluded", {
        scope: "world",
        config: false,
        type: Boolean,
        default: false,
      });
    }
  }
}

class SettingsForm extends FormApplication {
  constructor(object, options = {}) {
    super(object, options);
  }
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: mod + ".excludeCompendiums",
      title: "Exclude Compendiums",
      template:
        "modules/fvtt-swade-stat-block-parser/templates/ExcludeCompendiums.html",
      classes: ["sheet"],
      width: 250,
      closeOnSubmit: true,
    });
  }

  /**
   * This is a required function. It returns the object available to the handlebars template
   */
  getData() {
    let data = {
      compendiums: [],
    };
    let itemCompendiumList = getItemCompendiums();
    for (let i = 0; i < itemCompendiumList.length; i++) {
      data.compendiums.push({
        name: itemCompendiumList[i],
        value: game.settings.get(
          mod,
          itemCompendiumList[i].replace(".", "-") + "-excluded"
        ),
      });
    }
    return data;
  }

  /**
   * Executes on form submission.
   * @param {Object} e - the form submission event
   * @param {Object} d - the form data
   *
   */
  async _updateObject(e, d) {
    let compendiums = Object.keys(d);
    for (let comp of compendiums) {
      logger(`Setting ${comp.replace(".", "-") + "-excluded"} ${d[comp]}`);
      game.settings.set(mod, comp.replace(".", "-") + "-excluded", d[comp]);
    }
  }
}
