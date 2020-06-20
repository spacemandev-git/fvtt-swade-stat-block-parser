import { logger } from "./util.js";

export const importActorItems = async function (actor) {
  let gearList = [];
  let skillsList = await importActorSkillsList(actor); //don't await cause the whole function is awaited
  let edgesList = [];
  let hindranceList = [];
  let powersList = [];

  let itemList = gearList.concat(
    skillsList,
    edgesList,
    hindranceList,
    powersList
  );
  return itemList;
};

async function importActorSkillsList(actor) {
  let skillItems = [];
  let skillNames = Object.keys(actor.skills);
  for (let i = 0; i < skillNames.length; i++) {
    let skillName = skillNames[i];
    let item = await searchCompendiumsForItem(skillName, "skill");
    if (item == null) {
      logger(`Creating Skill: ${skillName}`);
    } else {
      item.data.die = actor.skills[skillName];
      skillItems.push(item);
    }
  }
  return skillItems;
}

async function searchCompendiumsForItem(itemName, itemType) {
  let item = null;
  let itemPacks = Array.from(game.packs).filter(
    (pack) => pack.metadata.entity == "Item"
  );

  for (let i = 0; i < itemPacks.length; i++) {
    let packIndex = await itemPacks[i].getIndex();
    let searchResult = packIndex.find((el) => el.name == itemName);
    if (searchResult != undefined) {
      let itemInstance = await itemPacks[i].getEntry(searchResult["_id"]);
      if (itemInstance.type == itemType) {
        logger(`Found Item ${itemName} in ${itemPacks[i].metadata.name}`);
      }
      return itemInstance;
    }
  }

  return item;
}
