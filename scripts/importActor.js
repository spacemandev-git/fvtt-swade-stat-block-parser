import { logger } from "./util.js";
import { importActorData } from "./importActorData.js";
import { importActorItems } from "./importActorItems.js";

export const importActor = async function (actorJSON) {
  //let compendium = await getCompendium();
  let actor = await Actor.create({
    name: actorJSON.name,
    type: actorJSON.type,
    data: importActorData(actorJSON),
    items: await importActorItems(actorJSON),
  });

  logger(JSON.stringify(actor));
};
