import { getNextKeywordIndex } from "./buildActor.js";
import { logger } from "./util.js";

const dieRegex = /(\d*)(D\d*)((?:[+*-](?:\d+|\([A-Z]*\)))*)(?:\+(D\d*))?/gi;
export const buildActorGear = function (statblock) {
  let actorGear = {};
  /*
  [gearName] : {
    type : string,
    img: string
    data = {
      qty: number,
      description: string,
    } //specific to type
  } */

  let sectionHeader = game.i18n.localize("Statblock_Section.Gear");
  let startIndex = statblock.indexOf(sectionHeader) + sectionHeader.length;
  if (statblock.indexOf(sectionHeader) == -1) {
    return gear; // No gear section
  }
  let endIndex = getNextKeywordIndex(startIndex, statblock);
  let gearList = statblock.slice(startIndex, endIndex).split("),");
  for (let i = 0; i < gearList.length; i++) {
    let gearName = gearList[i].split("(")[0].trim();
    let gearInfoString =
      gearList[i].split("(").length > 1
        ? gearList[i].split("(")[1].split(")")[0].trim()
        : "";
    let gearData = {
      type: "gear",
      img: "",
      data: {
        qty:
          gearName.split("×").length > 1 ? parseInt(gearName.split("×")[0]) : 1,
        description: "",
      },
    };
    if (gearInfoString == "") {
      actorGear[gearName] = gearData;
      continue;
    } //if no more info for the gear item than name, then we can't parse it anyway

    //let lDmg = game.i18n.localize("Statblock_Gear_Weapons.Damage");
    let lAmr = game.i18n.localize("Statblock_Gear_Armor.Armor");
    let lShd = game.i18n.localize("Statblock_Gear_Shield.Cover");

    if (dieRegex.exec(gearInfoString) != null) {
      gearData.type = "weapon";
      gearData.img = "systems/swade/assets/icons/weapon.svg";
      gearData.data = getWeaponData(gearInfoString);
    } //weapon
    else if (gearInfoString.indexOf(lAmr) != -1) {
      gearData.type = "armor";
      gearData.img = "systems/swade/assets/icons/armor.svg";
      gearData.data = getArmorData(gearInfoString);
    } //armor
    else if (gearInfoString.indexOf(lShd) != -1) {
      gearData.type = "shield";
      gearData.img = "systems/swade/assets/icons/shield.svg";
      gearData.data = getShieldData(gearInfoString);
    } //shield
    else {
      gearData.type = "gear";
      gearData.img = "systems/swade/assets/icons/gear.svg";
      gearData.data.description = gearInfoString;
    } //gear

    //all item types have a qty
    gearData.data.qty =
      gearName.split("×").length > 1 ? parseInt(gearName.split("×")[0]) : 1;
    actorGear[gearName] = gearData;
  }
  return actorGear;
};

function getWeaponData(infoString) {
  let data = {
    range: "",
    damage: "",
    rof: 1,
    ap: 0,
    shots: 0,
    notes: "",
  };
  /*
  let properties = infoString.split(",");
  let lrange = game.i18n.localize("Statblock_Gear_Weapons.Range");

  for (let i = 0; i < properties.length; i++) {
    if (properties[i].indexOf(lrange) != -1) {
      data.range = properties[i].split(lrange)[1].trim();
    } else if (dieRegex.exec(gearInfoString) != null) {
      //Set damage on first match, else it's probably talking about bonus dmg and we can set that
      if (data.damage == "") {
        let dmgparts = properties[i].split(" ");
        for (let d = 0; d < dmgparts.length; d++){
          if (data.damage == "") {
            
          }
        }
      } else {
        //add section to notes
      }
    }
  }
  */
  return data;
}

function getArmorData(infoString) {
  let data = {
    armor: "0",
    notes: "",
  };
  return data;
}

function getShieldData(infoString) {
  let data = {
    parry: "0",
    cover: "0",
    notes: "",
  };
  return data;
}
