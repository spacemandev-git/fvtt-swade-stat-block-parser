import { logger } from "./util.js";

export const importActorItems = async function (actor) {
  let gearList = [];
  let skillsList = await importActorSkillsList(actor); //don't await cause the whole function is awaited
  let edgesList = await importActorEdges(actor);
  let hindranceList = await importActorHindrances(actor);
  let powersList = [];

  let itemList = gearList.concat(
    skillsList,
    edgesList,
    hindranceList,
    powersList
  );
  return itemList;
};

async function importActorHindrances(actor) {
  let hindranceItems = [];
  let hindranceNames = Object.keys(actor.hindrances);
  for (let i = 0; i < hindranceNames.length; i++) {
    let item = await searchCompendiumsForItem(hindranceNames[i], "hindrance");
    if (item == null) {
      logger(`Creating new Hindrance ${hindranceNames[i]}`);
      let newItem = await Item.create({
        name: hindranceNames[i],
        type: "hindrance",
        img: "systems/swade/assets/icons/hindrance.svg",
        data: {
          notes: actor.hindrances[hindranceNames[i]].note,
          major: actor.hindrances[hindranceNames[i]].major,
        },
      });
      hindranceItems.push(newItem);
    } else {
      item.major = actor.hindrances[hindranceNames[i]].major;
      item.notes = actor.hindrances[hindranceNames[i]].note;
      hindranceItems.push(item);
    }
  }

  return hindranceItems;
}

async function importActorEdges(actor) {
  let edgeItems = [];
  for (let i = 0; i < actor.edges.length; i++) {
    //if Arcane Background then parse it differently
    if (actor.edges[i].indexOf(game.i18n.localize("SWADE.ArcBack")) != -1) {
      //let backgroundType = actor.edges[i].split("(")[1].split(")")[0].trim();
      let item = await searchCompendiumsForItem(
        game.i18n.localize("SWADE.ArcBack"),
        "edge"
      );
      if (item == null) {
        logger(`Creating New Arcane Edge: ${actor.edges[i]}`);
        let newItem = await Item.create({
          name: actor.edges[i],
          type: "edge",
          img: "systems/swade/assets/icons/edge.svg",
          data: {
            isArcaneBackground: true,
          },
        });
        edgeItems.push(newItem);
      } else {
        item.name = actor.edges[i];
        edgeItems.push(item);
      }
    } else {
      let item = await searchCompendiumsForItem(actor.edges[i], "edge");
      if (item == null) {
        logger(`Creating Edge: ${actor.edges[i]}`);
        let newItem = await Item.create({
          name: actor.edges[i],
          type: "edge",
          img: "systems/swade/assets/icons/edge.svg",
        });
        edgeItems.push(newItem);
      } else {
        //no need to change anything about the edge
        edgeItems.push(item);
      }
    }
  }

  return edgeItems;
}

async function importActorSkillsList(actor) {
  let skillItems = [];
  let skillNames = Object.keys(actor.skills);
  for (let i = 0; i < skillNames.length; i++) {
    let skillName = skillNames[i];
    let item = await searchCompendiumsForItem(skillName, "skill");
    if (item == null) {
      logger(`Creating Skill: ${skillName}`);
      let newItem = await Item.create({
        name: skillName,
        type: "skill",
        img: "modules/fvtt-swade-stat-block-parser/assets/skills.svg",
        data: {
          description: "",
          notes: "",
          attribute: "",
          die: actor.skills[skillName],
          "wild-die": { sides: 6 },
        },
      });
      skillItems.push(newItem);
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
    let searchResult = packIndex.find(
      (el) => el.name.toLowerCase() == itemName.toLowerCase()
    );
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
