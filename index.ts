import * as fs from "fs/promises";
import { Actor } from "./IActor";

const keywords = [
  "Attributes",
  "Skills",
  "Pace",
  "Parry",
  "Toughness",
  "Hindrances",
  "Edges",
  "Gear",
  "Special Abilities",
];

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
  //actor.derivedStats = await buildActorDerivedStats(statblock);
  actor.pace = await buildActorPace(statblock);
  actor.parry = await buildActorParry(statblock);
  actor.toughness = await buildActorToughness(statblock);
  actor.hindrances = await buildActorHindrances(statblock);
  actor.edges = await buildActorEdges(statblock);
  //actor.powers = await buildActorPowers(statblock);
  //actor.gear = await buildActorGear(statblock);
  return actor;
}

async function buildActorGear(statblock) {
  let gear = {};
  let startIndex = statblock.indexOf("Gear: ");
  if (startIndex == -1) {
    return gear;
  }
  let endIndex = getNextKeywordIndex(startIndex, statblock);
  let gearSection = statblock.slice(startIndex, endIndex);

  console.log(gearSection);
  return gear;
}

async function buildActorEdges(statblock) {
  let edges: string[] = [];
  let startIndex = statblock.indexOf("Edges: ") + 7;
  if (startIndex == -1) {
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
  if (startIndex == -1) {
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
    toughness.value = parseInt(rawTough.split("(")[1].split(")")[0]);
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
  let endIndex = getNextKeywordIndex(startIndex, getNextKeywordIndex);

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
  //let endIndex = statblock.indexOf("Skills: ");
  let endIndex = getNextKeywordIndex(startIndex, statblock);
  let attrList: String[] = statblock
    .slice(startIndex, endIndex)
    .replace(/(\r\n|\n|\r)/gm, " ")
    .split(",");
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
  //console.log(attributes)
  return attributes;
}

async function buildActorDescription(statblock: string) {
  let desc: string = "";
  //let endIndex = statblock.indexOf("Attributes:");
  let endIndex = getNextKeywordIndex(0, statblock); //description is always the first thing
  desc = statblock.slice(0, endIndex).trim();
  return desc;
}

function getNextKeywordIndex(startingIndex, statblock) {
  let charAtList = [];
  keywords.map((keyword) => {
    charAtList.push(statblock.indexOf(keyword, startingIndex));
  });

  //remove missing sections
  charAtList.map((keywordIndex) => {
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
