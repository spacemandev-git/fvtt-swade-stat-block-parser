import * as fs from "fs/promises";
import { Actor } from "./IActor";

let keywords = [
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
  //actor.description = await buildActorDescription(statblock);
  //actor.attributes = await buildActorAttributes(statblock);
  //actor.skills = await buildActorSkills(statblock);
  //actor.derivedStats = await buildActorDerivedStats(statblock);
  //actor.hindrances = await buildActorHindrances(statblock);
  //actor.edges = await buildActorEdges(statblock);
  //actor.powers = await buildActorPowers(statblock);
  //actor.gear = await buildActorGear(statblock);
  return actor;
}

async function b