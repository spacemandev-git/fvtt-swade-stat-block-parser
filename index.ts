import * as fs from "fs/promises";
import { Actor } from "./IActor";

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
        await (await fs.readFile(`${dirName}\\${fileNames[fN]}`)).toString()
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
  actor.derivedStats = await buildActorDerivedStats(statblock);
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
  let endIndex = statblock.indexOf("Special Abilities: ");
  if (endIndex == -1) {
    endIndex = statblock.length - 1;
  }
  let gearSection = statblock.slice(startIndex, endIndex);

  console.log(gearSection);
  return gear;
}

async function buildActorEdges(statblock) {
  let edges: string[] = [];
  let startIndex = statblock.indexOf("Edges: ");
  let endIndex = statblock.indexOf("Gear: ");

  if (endIndex == -1) {
    //try next section
    endIndex = statblock.indexOf("Special Abilities: ");
    if (endIndex == -1) {
      //Edges is the last section, try end of file
      endIndex = statblock.length - 1;
    }
  }
  let edgeList = statblock
    .slice(startIndex, endIndex)
    .split(": ")[1]
    .replace(/(\r\n|\n|\r)/gm, " ");
  if (edgeList[0] != "—") {
    edges = edgeList.split(",").map((edge) => edge.trim());
  }
  return edges;
}

async function buildActorHindrances(statblock) {
  let hindranceDict = JSON.parse((await fs.readFile("./h.json")).toString());
  let hindrances = {};

  let startIndex = statblock.indexOf("Hindrances: ");
  if (startIndex == -1) {
    //no Hindrances exist
    return hindrances;
  }
  let endIndex = statblock.indexOf("Edges: ");

  //Interface Zero goes Edges => Hindrances instead of Hindrances => Edges

  let hindranceList = statblock
    .slice(startIndex, endIndex)
    .replace(/(\r\n|\n|\r)/gm, " ")
    .split(": ")[1]
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

async function buildActorDerivedStats(statblock) {
  let derivedStats = {
    pace: 0,
    parry: 0,
    toughness: {
      value: 0,
      armor: 0,
    },
  };
  let startIndex = statblock.indexOf("Pace:");
  let endIndex = statblock.indexOf("Hindrances:");
  let derStats = statblock
    .slice(startIndex, endIndex)
    .replace(/(\r\n|\n|\r)/gm, " ")
    .split(";");

  derivedStats["pace"] = parseInt(derStats[0].split(": ")[1]);
  derivedStats["parry"] = parseInt(derStats[1].split(": ")[1]);

  //Toughness could have () armor value or it could not
  derivedStats["toughness"]["value"] = parseInt(
    derStats[2].split(": ")[1].split(" (")[0]
  );

  //check if armor is present
  if (derStats[2].split(": ")[1].split(" (")[1] != undefined) {
    derivedStats["toughness"]["armor"] = parseInt(
      derStats[2].split(": ")[1].split(" (")[1].split(")")[0]
    );
  } else {
    derivedStats["toughness"]["armor"] = 0;
  }
  return derivedStats;
}

async function buildActorSkills(statblock) {
  let skills = {};
  let startIndex = statblock.indexOf("Skills: ") + 8;
  let endIndex = statblock.indexOf("Pace: ");

  let skillList: String[] = statblock
    .slice(startIndex, endIndex)
    .replace(/(\r\n|\n|\r)/gm, " ")
    .split(",");
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
  let endIndex = statblock.indexOf("Skills: ");
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
  let endIndex = statblock.indexOf("Attributes:");
  desc = statblock.slice(0, endIndex);
  desc = desc.replace(/(\r\n|\n|\r)/gm, " ").trim();
  return desc;
}
