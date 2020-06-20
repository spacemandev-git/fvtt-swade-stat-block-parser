import { logger } from "./util.js";
import { importActor } from "./importActor.js";
export const buildActor = async function (actorName, statblock, actorType) {
  statblock = statblock.replace(/(\r\n|\n|\r)/gm, " ");
  //logger(game.settings.get("statblock-importer", "importer.lang"));
  let actor = {};
  //build actor json, then run compenium creator
  actor.name = actorName;
  actor.type = actorType;
  actor.description = buildActorDescription(statblock);
  actor.attributes = buildActorAttributes(statblock);
  actor.skills = buildActorSkills(statblock);
  actor.toughness = buildActorToughness(statblock);
  actor.parry = buildActorParry(statblock);
  actor.pace = buildActorPace(statblock);
  actor.hindrances = buildActorHindrances(statblock);
  actor.edges = buildActorEdges(statblock);
  actor.gear = buildActorGear(statblock);
  actor.powers = buildActorPowers(actor.edges, statblock);
  actor.specials = buildActorSpecials(statblock);
  logger(JSON.stringify(actor));
  await importActor(actor);
};

function buildActorSpecials(statblock) {
  let specials = {};
  let sectionHeader = game.i18n.localize("Statblock_Section.Specials");
  let startIndex = statblock.indexOf(sectionHeader) + sectionHeader.length;
  if (statblock.indexOf(sectionHeader) == -1) {
    return specials;
  }
  let endIndex = getNextKeywordIndex(startIndex, statblock);
  let specialsSection = statblock.slice(startIndex, endIndex);
  let specialsList = specialsSection
    .split("@")
    .map((el) => el.trim())
    .slice(1);
  specialsList.map((el) => {
    if (el.split(":").length == 1) {
      //it doesn't have a : between ability: description
      specials[el] = "";
    } else {
      specials[el.split(":")[0].trim()] = el.split(":")[1].trim();
    }
  });

  return specials;
}

function buildActorPowers(edges, statblock) {
  let arcaneList = {};
  //parse edges to see what Arcane Backgrounds exist
  let arcaneBackroundList = [];
  edges.map((edge) => {
    if (edge.indexOf(game.i18n.localize("SWADE.ArcBack")) >= 0) {
      arcaneBackroundList.push(edge.split("(")[1].split(")")[0]);
    }
  });

  if (arcaneBackroundList.length == 0) {
    //no powers
    return arcaneList;
  }

  if (arcaneBackroundList.length == 1) {
    //section will just be labeled "Powers: "
    let sectionHeader = game.i18n.localize(
      game.i18n.localize("Statblock_Section.Powers")
    );
    let startIndex = statblock.indexOf(sectionHeader) + sectionHeader.length;
    let endIndex = getNextKeywordIndex(startIndex, statblock);
    let powersSection = statblock.slice(startIndex, endIndex);
    let powersList = powersSection
      .split(".")[0]
      .split(",")
      .map((el) => el.trim());
    //sometimes last power has the word 'and' in it
    if (
      powersList[powersList.length - 1].indexOf(
        game.i18n.localize("Statblock_Quirks.Powers_And")
      ) >= 0
    ) {
      powersList[powersList.length - 1] = powersList[powersList.length - 1]
        .split(game.i18n.localize("Statblock_Quirks.Powers_And"))[1]
        .trim();
    }

    let pp_name = powersSection.split(".")[1].trim().split(":")[0];
    let pp_amt = parseInt(powersSection.split(".")[1].trim().split(":")[1]);
    arcaneList[arcaneBackroundList[0]] = {
      list: powersList,
      pp_name: pp_name,
      pp_amt: pp_amt,
    };
  } else {
    //for each arcane list, section will be "Powers (AB): "
    for (let i = 0; i < arcaneBackroundList.length; i++) {
      let sectionHeader = `${game.i18n.localize("SWADE.Pow")} (${
        arcaneBackroundList[i]
      }):`;
      let startIndex = statblock.indexOf(sectionHeader) + sectionHeader.length;
      let endIndex = getNextKeywordIndex(startIndex, statblock);
      let pSection = statblock.slice(startIndex, endIndex);
      let pList = pSection
        .split(".")[0]
        .split(",")
        .map((el) => el.trim());
      if (
        pList[pList.length - 1].indexOf(
          game.i18n.localize("Statblock_Quirks.Powers_And")
        ) >= 0
      ) {
        pList[pList.length - 1] = pList[pList.length - 1]
          .split(game.i18n.localize("Statblock_Quirks.Powers_And"))[1]
          .trim();
      }
      let pp_name = pSection.split(".")[1].trim().split(":")[0];
      let pp_amt = parseInt(pSection.split(".")[1].trim().split(":")[1]);
      arcaneList[arcaneBackroundList[i]] = {
        list: pList,
        pp_name: pp_name,
        pp_amt: pp_amt,
      };
    }
  }

  return arcaneList;
}

function buildActorGear(statblock) {
  let gear = {};
  let sectionHeader = game.i18n.localize("Statblock_Section.Gear");
  let startIndex = statblock.indexOf(sectionHeader) + sectionHeader.length;
  if (statblock.indexOf(sectionHeader) == -1) {
    return gear; // No gear section
  }
  let endIndex = getNextKeywordIndex(startIndex, statblock);
  let gearList = statblock.slice(startIndex, endIndex).split("),");
  gearList.map((g) => {
    let gearName = g.split("(")[0].trim();
    let gearDescription = g.split("(")[1];

    if (gearName.split("×")[1]) {
      gear[gearName.split("×")[1].trim().slice(0, -1)] = {
        name: gearName.split("×")[1].trim().slice(0, -1),
        description: gearDescription,
        quantity: parseInt(gearName.split("×")[0]),
      };
    } else {
      gear[gearName] = {
        name: gearName,
        description: gearDescription,
        quantity: 1,
      };
    }
  });
  return gear;
}

function buildActorEdges(statblock) {
  let edges = [];
  let sectionHeader = game.i18n.localize("Statblock_Section.Edges");
  let startIndex = statblock.indexOf(sectionHeader) + sectionHeader.length;
  if (statblock.indexOf(sectionHeader) == -1) {
    return edges; //no edges present
  }

  let endIndex = getNextKeywordIndex(startIndex, statblock);
  let edgeList = statblock.slice(startIndex, endIndex);
  if (edgeList[0] != "—") {
    edges = edgeList.split(",").map((edge) => edge.trim());
  }
  return edges;
}

function buildActorHindrances(statblock) {
  //let hindranceDict = JSON.parse((await fs.readFile("./h.json")).toString());
  let hindrances = {};
  let sectionHeader = game.i18n.localize("Statblock_Section.Hindrances");
  let startIndex = statblock.indexOf(sectionHeader) + sectionHeader.length;
  if (statblock.indexOf(sectionHeader) == -1) {
    return hindrances;
  }
  let endIndex = getNextKeywordIndex(startIndex, statblock);

  let hindranceList = statblock
    .slice(startIndex, endIndex)
    .split(",")
    .map((h) => h.trim());

  hindranceList.forEach((h) => {
    //check if it has notes
    let newHindName = h;
    let major = false; //false by default, if it's actually a Major one, someone will have to go in and fix it
    let note = "";
    // modify major based on if there's a () with more information
    if (h.split("(")[1]) {
      major =
        h.split("(")[1].split("—")[0] ==
        game.i18n.localize("Statblock_Quirks.Hindrances_Major")
          ? true
          : false;
      note = h.split("(")[1].split("—")[1]
        ? h.split("(")[1].split("—")[1].split(")")[0]
        : "";
    }
    hindrances[h.split(" (")[0]] = {
      name: h.split(" (")[0],
      major: major,
      note: note,
    };
  });
  return hindrances;
}

function buildActorPace(statblock) {
  let pace = 6;
  let sectionHeader = game.i18n.localize("Statblock_Section.Pace");
  if (statblock.indexOf(sectionHeader) == -1) {
    return pace;
  }
  let startIndex = statblock.indexOf(sectionHeader) + sectionHeader.length;
  let endIndex = getNextKeywordIndex(startIndex, statblock);
  pace = parseInt(statblock.slice(startIndex, endIndex).trim());
  return pace;
}

function buildActorParry(statblock) {
  let parry = { value: 2, modifier: 0 };
  let sectionHeader = game.i18n.localize("Statblock_Section.Parry");
  let startIndex = statblock.indexOf(sectionHeader) + sectionHeader.length;
  if (statblock.indexOf(sectionHeader) == -1) {
    return parry;
  }
  let endIndex = getNextKeywordIndex(startIndex, statblock);
  parry.value = parseInt(statblock.slice(startIndex, endIndex).trim());
  return parry;
}

function buildActorToughness(statblock) {
  let toughness = {
    value: 2,
    armor: 0,
  };
  let sectionHeader = game.i18n.localize("Statblock_Section.Toughness");
  let startIndex = statblock.indexOf(sectionHeader) + sectionHeader.length;
  if (statblock.sectionHeader == -1) {
    return toughness;
  }
  let endIndex = getNextKeywordIndex(startIndex, statblock);
  let rawTough = statblock.slice(startIndex, endIndex);
  if (rawTough.split(" (")[1] != undefined) {
    toughness.value =
      parseInt(rawTough.split(" (")[0]) -
      parseInt(rawTough.split("(")[1].split(")")[0]);
    toughness.armor = parseInt(rawTough.split("(")[1].split(")")[0]);
  } else {
    toughness.value = parseInt(rawTough);
    toughness.armor = 0;
  }

  return toughness;
}

function buildActorSkills(statblock) {
  let skills = {};
  let sectionHeader = game.i18n.localize("Statblock_Section.Skills");
  let startIndex = statblock.indexOf(sectionHeader) + sectionHeader.length;
  if (statblock.indexOf(sectionHeader) == -1) {
    return skills;
  }
  let endIndex = getNextKeywordIndex(startIndex, statblock);
  let skillList = statblock.slice(startIndex, endIndex).split(",");
  skillList = skillList.map((skill) => skill.trim());
  skillList.map((skill) => {
    let skillName = skill.split(" d")[0];
    let die = skill.split(" d")[1];
    skills[skillName] = {
      sides: parseInt(die.split("+")[0]),
      modifier: die.split("+")[1] ? die.split("+")[1] : "", //modifier is for whatever reason a string in the data model
    };
  });
  return skills;
}

function buildActorAttributes(statblock) {
  let attributes = {};
  let sectionHeader = game.i18n.localize("Statblock_Section.Attributes");
  let startIndex = statblock.indexOf(sectionHeader) + sectionHeader.length;
  if (statblock.indexOf(sectionHeader) == -1) {
    ui.notifications.error("Not a valid statblock!");
    return attributes;
  }
  let endIndex = getNextKeywordIndex(startIndex, statblock);
  let attrList = statblock.slice(startIndex, endIndex).split(",");
  attrList = attrList.map((attr) => attr.trim());
  attrList.map((attr) => {
    let attrName = attr.split(" d")[0];
    let die = attr.split(" d")[1];
    attributes[attrName.toLowerCase()] = {
      die: {
        sides: parseInt(die.split("+")[0]),
        modifier: die.split("+")[1] ? parseInt(die.split("+")[1]) : 0,
      },
    };
  });
  return attributes;
}

function buildActorDescription(statblock) {
  let desc = "";
  let startIndex = 0;
  let endIndex = getNextKeywordIndex(0, statblock);
  desc = statblock.slice(startIndex, endIndex);
  return desc;
}

function getNextKeywordIndex(startingIndex, statblock) {
  let charAtList = [];
  let keywords = Object.keys(game.i18n.translations["Statblock_Section"]).map(
    (key) => {
      return game.i18n.translations["Statblock_Section"][key];
    }
  );

  //get all the index values of keywords that come after the starting Index
  keywords.map((keyword) => {
    charAtList.push(statblock.indexOf(keyword, startingIndex));
  });

  //remove any missing sections by setting their value to end of file
  charAtList = charAtList.map((keywordIndex) => {
    if (keywordIndex == -1) {
      return statblock.length - 1;
    } else {
      return keywordIndex;
    }
  });

  let nextKeywordIndex = Math.min(...charAtList);
  return nextKeywordIndex;
}
