import * as fs from "fs/promises";
import { Actor } from "./IActor";
import { start } from "repl";
import { stringify } from "querystring";

let coreKeywords = [
  "Attributes:",
  "Skills:",
  "Pace:",
  "Parry:",
  "Toughness:",
  "Hindrances:",
  "Edges:",
  "Powers:",
  "Powers (", //should cover all Aracne Backgrounds when multiple are present
  "Gear:",
  "Special Abilities:",
];

let riftsKeywords = ["Cybernetic Systems:"];
let swdKeywords = ["Charisma:"];
let otherKeywords = ["Booy:"];
let keywords = coreKeywords.concat(riftsKeywords, swdKeywords, otherKeywords);

buildActorsFromDir("testdata").then((actors) => {
  actors.map((actor) => {
    //console.log(JSON.stringify(actor))
    fs.writeFile(`testoutput/${actor.name}.json`, JSON.stringify(actor));
  });
});

async function buildActorsFromDir(dirName) {
  let fileNames = await fs.readdir(dirName);
  let actors: Actor[] = [];
  for (let fN in fileNames) {
    console.log(`Processing file: ${fileNames[fN]}`);
    actors.push(
      await buildActor(
        fileNames[fN].split(".")[0],
        (await fs.readFile(`${dirName}\\${fileNames[fN]}`))
          .toString()
          .replace(/(\r\n|\n|\r)/gm, " ")
      )
    );
  }
  return actors;
}

async function buildActor(fileName, statblock) {
  let actor: Actor = {
    name: fileName,
  };
  actor.description = await buildActorDescription(statblock);
  actor.attributes = await buildActorAttributes(statblock);
  actor.skills = await buildActorSkills(statblock);
  actor.pace = await buildActorPace(statblock);
  actor.parry = await buildActorParry(statblock);
  actor.toughness = await buildActorToughness(statblock);
  actor.hindrances = await buildActorHindrances(statblock);
  actor.edges = await buildActorEdges(statblock);
  actor.gear = await buildActorGear(statblock);
  actor.powers = await buildActorPowers(actor.edges, statblock);
  actor.special_abilities = await buildActorSpecials(statblock);

  return actor;
}

async function buildActorSpecials(statblock) {
  let specials = {};
  let startIndex = statblock.indexOf("Special Abilities: ") + 19;
  if (startIndex == 18) {
    return specials;
  }
  let endIndex = getNextKeywordIndex(startIndex, statblock);
  let specialsSection = statblock.slice(startIndex, endIndex);
  let specialsList = specialsSection
    .split("@")
    .map((el) => el.trim())
    .slice(1);
  specialsList.map((el) => {
    specials[el.split(":")[0].trim()] = el.split(":")[1].trim();
  });

  return specials;
}

async function buildActorPowers(edges, statblock) {
  let arcaneList = {};
  //parse edges to see what Arcane Backgrounds exist
  let arcaneBackroundList = [];
  edges.map((edge) => {
    if (edge.indexOf("Arcane Background") >= 0) {
      arcaneBackroundList.push(edge.split("(")[1].split(")")[0]);
    }
  });

  if (arcaneBackroundList.length == 0) {
    //no powers
    return;
  }

  if (arcaneBackroundList.length == 1) {
    //section will just be labeled "Powers: "
    let startIndex = statblock.indexOf("Powers: ") + 8;
    let endIndex = getNextKeywordIndex(startIndex, statblock);
    let powersSection = statblock.slice(startIndex, endIndex);
    let powersList = powersSection
      .split(".")[0]
      .split(",")
      .map((el) => el.trim());
    //sometimes last power has the word 'and' in it
    if (powersList[powersList.length - 1].indexOf("and") >= 0) {
      powersList[powersList.length - 1] = powersList[powersList.length - 1]
        .split("and")[1]
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
      let sectionHeader = `Powers (${arcaneBackroundList[i]}):`;
      let startIndex = statblock.indexOf(sectionHeader) + sectionHeader.length;
      let endIndex = getNextKeywordIndex(startIndex, statblock);
      let pSection = statblock.slice(startIndex, endIndex);
      let pList = pSection
        .split(".")[0]
        .split(",")
        .map((el) => el.trim());
      if (pList[pList.length - 1].indexOf("and") >= 0) {
        pList[pList.length - 1] = pList[pList.length - 1]
          .split("and")[1]
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

async function buildActorGear(statblock) {
  let gear = {};
  let startIndex = statblock.indexOf("Gear: ") + 6;
  if (startIndex == 5) {
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

async function buildActorEdges(statblock) {
  let edges: string[] = [];
  let startIndex = statblock.indexOf("Edges: ") + 7;
  if (startIndex == 6) {
    return edges; //no edges present
  }

  let endIndex = getNextKeywordIndex(startIndex, statblock);

  let edgeList = statblock.slice(startIndex, endIndex);
  if (edgeList[0] != "—") {
    edges = edgeList.split(",").map((edge) => edge.trim());
  }
  return edges;
}

async function buildActorHindrances(statblock) {
  let hindranceDict = JSON.parse((await fs.readFile("./h.json")).toString());
  let hindrances = {};

  let startIndex = statblock.indexOf("Hindrances: ") + 12;
  if (startIndex == 11) {
    //no Hindrances exist
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
    let major = hindranceDict[h] ? hindranceDict[h]["major"] : false;
    let note = "";
    // modify major based on if there's a () with more information
    if (h.split("(")[1]) {
      major = h.split("(")[1].split("—")[0] == "Major" ? true : false;
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

async function buildActorPace(statblock) {
  let pace = 0;
  let startIndex = statblock.indexOf("Pace: ") + 6;
  let endIndex = getNextKeywordIndex(startIndex, statblock);
  pace = parseInt(statblock.slice(startIndex, endIndex).trim());
  return pace;
}
async function buildActorParry(statblock) {
  let parry = 0;
  let startIndex = statblock.indexOf("Parry: ") + 7;
  let endIndex = getNextKeywordIndex(startIndex, statblock);
  parry = parseInt(statblock.slice(startIndex, endIndex).trim());
  return parry;
}
async function buildActorToughness(statblock) {
  let toughness = {
    value: 0,
    armor: 0,
  };
  let startIndex = statblock.indexOf("Toughness: ") + 10;
  let endIndex = getNextKeywordIndex(startIndex, statblock);
  let rawTough = statblock.slice(startIndex, endIndex);
  if (rawTough.split(" (")[1] != undefined) {
    toughness.value = parseInt(rawTough.split(" (")[0]);
    toughness.armor = parseInt(rawTough.split("(")[1].split(")")[0]);
  } else {
    toughness.value = parseInt(rawTough);
    toughness.armor = 0;
  }

  return toughness;
}

async function buildActorSkills(statblock) {
  let skills = {};
  let startIndex = statblock.indexOf("Skills: ") + 8;
  //let endIndex = statblock.indexOf("Pace: ");
  let endIndex = getNextKeywordIndex(startIndex, statblock);

  let skillList: String[] = statblock.slice(startIndex, endIndex).split(",");
  skillList = skillList.map((skill) => skill.trim());
  skillList.map((skill) => {
    let skillName = skill.split(" d")[0];
    let die = skill.split(" d")[1];
    skills[skillName] = {
      name: skillName,
      die: parseInt(die.split("+")[0]),
      mod: die.split("+")[1] ? parseInt(die.split("+")[1]) : 0,
    };
  });
  return skills;
}

async function buildActorAttributes(statblock) {
  let attributes = {};
  let startIndex = statblock.indexOf("Attributes: ") + 12; //12 is Attributes: count
  let endIndex = getNextKeywordIndex(startIndex, statblock);
  let attrList: String[] = statblock.slice(startIndex, endIndex).split(",");
  attrList = attrList.map((attr) => attr.trim());
  attrList.map((attr) => {
    let attrName = attr.split(" d")[0];
    let die = attr.split(" d")[1];
    attributes[attrName] = {
      name: attrName,
      die: parseInt(die.split("+")[0]),
      mod: die.split("+")[1] ? parseInt(die.split("+")[1]) : 0,
    };
  });
  return attributes;
}

async function buildActorDescription(statblock: string) {
  let desc: string = "";
  //let endIndex = statblock.indexOf("Attributes:");
  let endIndex = getNextKeywordIndex(0, statblock); //description is always the first thing
  desc = statblock.slice(0, endIndex).trim();
  return desc;
}

function getNextKeywordIndex(startingIndex, statblock: string) {
  let charAtList = [];
  keywords.map((keyword) => {
    charAtList.push(statblock.indexOf(keyword, startingIndex));
    /*     console.log(
      `Keyword: ${keyword} Index: ${statblock.indexOf(keyword, startingIndex)}`
    ); */
  });

  //remove missing sections
  charAtList = charAtList.map((keywordIndex) => {
    if (keywordIndex == -1) {
      //Set endIndex to End of File if no Keyword sections left
      return statblock.length - 1;
    } else {
      return keywordIndex;
    }
  });

  let nextKeywordIndex = Math.min(...charAtList);
  return nextKeywordIndex;
}
