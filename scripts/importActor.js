import { logger } from "./util.js";
import { importActorData } from "./importActorData.js";
import { importActorItems } from "./importActorItems.js";

export const importActor = async function (actorJSON) {
  //let compendium = await getCompendium();
  let actor = await Actor.create({
    name: actorJSON.name,
    type: actorJSON.type,
    data: importActorData(actorJSON),
    items: importActorItems(actorJSON),
  });

  logger(JSON.stringify(actor));
};

async function getCompendium() {
  //Check if Imports-Compendium exists
  let actorCompendium = game.packs.find(
    (p) => p.metadata.name == "statblock-actors"
  );
  if (actorCompendium == null) {
    actorCompendium = await Compendium.create({
      name: "statblock-actors",
      label: "Statblock-Actors",
      entity: "Actor",
      absPath: game.system.path
        .split("systems")[0]
        .concat(
          "worlds\\",
          `${game.world.name}`,
          "\\packs\\statblock-actors.db"
        ),
      system: "swade",
      package: "world",
    });
  }
  return actorCompendium;
}
