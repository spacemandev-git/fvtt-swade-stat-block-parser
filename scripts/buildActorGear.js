import { getNextKeywordIndex } from "./buildActor.js";
import { logger } from "./util.js";

//const dieRegex = /(\d*)(D\d*)((?:[+*-](?:\d+|\([A-Z]*\)))*)(?:\+(D\d*))?/gi;
const dieRegex = /(\d+)?d(\d+)([\+\-]\d+)?/gi;
const strRegex = /(^str\+|^Str\+|^Strength\+)/;
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
    equipped: true,
  };
  let properties = [];
  if (infoString.split(";").length > 1) {
    data.notes = infoString.split(";")[1];
    properties = infoString.split(";")[0].split(",");
  } else {
    properties = infoString.split(",");
  }
  logger(`Weapon Properties: ${properties}`);

  let lRange = game.i18n.localize("Statblock_Gear_Weapons.Range");
  let lRof = game.i18n.localize("Statblock_Gear_Weapons.RoF");
  let lAP = game.i18n.localize("Statblock_Gear_Weapons.AP");
  let lShots = game.i18n.localize("Statblock_Gear_Weapons.Shots");
  for (let i = 0; i < properties.length; i++) {
    //for whatever reason the exec doesn't work in a if statement
    let dieRegexResult = dieRegex.exec(properties[i].trim());
    let strRegexResult = strRegex.exec(properties[i].trim());
    if (properties[i].indexOf(lRange) != -1) {
      data.range = properties[i].split(" ")[1];
    } else if (dieRegexResult || strRegexResult) {
      if (data.damage == "") {
        let dmgparts = properties[i].split(" ");

        for (let part of dmgparts) {
          let isDieFormula = dieRegex.exec(part);
          if (!isDieFormula) {
            isDieFormula = strRegex.exec(part);
          }
          if (isDieFormula) {
            let strString = /str|Str|Strength|fue|Fue|Fuerza/;
            data.damage = part.replace(strString, "@str");
          }
        }
      } else {
        data.notes += properties[i] + ",";
      }
    } else if (properties[i].indexOf(lAP) != -1) {
      for (let apPart of properties[i].split(" ")) {
        if (apPart.indexOf(lAP) == -1) {
          data.ap = apPart;
        }
      }
    } else if (properties[i].indexOf(lShots) != -1) {
      for (let shotsPart of properties[i].split(" ")) {
        if (shotsPart.indexOf(lAP) == -1) {
          data.shots = shotsPart;
        }
      }
    } else if (properties[i].toLowerCase().indexOf(lRof.toLowerCase()) != -1) {
      for (let rofPart of properties[i].split(" ")) {
        if (rofPart.indexOf(lAP) == -1) {
          data.rof = parseInt(rofPart);
        }
      }
    }
  }

  return data;
}

function getArmorData(infoString) {
  let data = {
    armor: "0",
    notes: "",
    equipped: true,
  };
  let lArmor = game.i18n.localize("Statblock_Gear_Armor.Armor");

  let aString = infoString;
  if (infoString.split(";")[1]) {
    data.notes += infoString.split(";")[1] + ",";
    aString = infoString.split(";")[0];
  }

  let parts = aString.split(",");
  for (let aPart of parts) {
    if (aPart.indexOf(lArmor) != -1) {
      for (let p of aPart.split(" ")) {
        if (p.indexOf(lArmor) == -1 && data.armor == "0") {
          data.armor = parseInt(p).toString();
        }
      }
    } else {
      data.notes += aPart + ",";
    }
  }
  return data;
}

function getShieldData(infoString) {
  let data = {
    parry: "0",
    cover: "0",
    notes: "",
    equipped: true,
  };
  let lParry = game.i18n.localize("Statblock_Gear_Shield.Parry");
  let lCover = game.i18n.localize("Statblock_Gear_Shield.Cover");
  for (let part of infoString.split(",")) {
    if (part.indexOf(lParry) != -1) {
      for (let pPart of part.split(" ")) {
        if (pPart.indexOf(lParry) == -1 && data.parry == "") {
          data.parry = lParry;
        }
      }
    } else if (part.indexOf(lCover) != -1) {
      for (let cPart of part.split(" ")) {
        if (cPart.indexOf(lCover) == -1 && data.cover == "") {
          data.cover = cPart;
        }
      }
    } else {
      data.notes += part + ",";
    }
  }
  return data;
}
