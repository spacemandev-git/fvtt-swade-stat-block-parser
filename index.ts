import * as fs from 'fs/promises';
import { dirname } from 'path';
import {Actor} from './IActor'
import { start } from 'repl';

buildActorsFromDir('testdata').then( (actors) => {
  actors.map( actor => console.log(JSON.stringify(actor)))
})

async function buildActorsFromDir(dirName){
  let fileNames = await fs.readdir(dirName);
  let actors:Actor[] = []
  for (let fN in fileNames){
    actors.push(await buildActor(fileNames[fN].split('.')[0], (await (await fs.readFile(`${dirName}\\${fileNames[fN]}`)).toString())))
  }
  return actors;
}

async function buildActor(fileName, statblock){
  let actor:Actor = {
    name: fileName
  }
  actor.description = await buildActorDescription(statblock);
  actor.attributes = await buildActorAttributes(statblock);
  actor.skills = await buildActorSkills(statblock);
  actor.derivedStats = await buildActorDerivedStats(statblock);
  return actor;
}

async function buildActorDerivedStats(statblock){
  let derivedStats = {
    pace: 0,
    parry: 0,
    toughness: {
      value: 0,
      armor: 0
    }
  }
  let startIndex = statblock.indexOf("Pace:") - 5 //starts at beginning of Pace
  let endIndex = statblock.indexOf("Hindrances:")
  let derStats = statblock.slice(startIndex, endIndex).replace(/(\r\n|\n|\r)/gm, " ").split(';')

  derivedStats['pace'] = derStats[0].split(": ")[1]
  derivedStats['parry'] = derStats[1].split(": ")[1]
  derivedStats['toughness']['value'] = parseInt(derStats[2].split(": ")[0].split(' (')[0])
  derivedStats['toughness']['armor'] = parseInt(derStats[2].split(": ")[0].split(' (')[1].split(')')[0])
  return derivedStats
}

async function buildActorSkills(statblock){
  let skills = {}
  let startIndex = statblock.indexOf("Skills: ") + 8
  let endIndex = statblock.indexOf("Pace: ")
 
  let skillList:String[] = statblock.slice(startIndex, endIndex).replace(/(\r\n|\n|\r)/gm, " ").split(',')
  skillList = skillList.map(skill => skill.trim())
  skillList.map(skill => {
    let skillName = skill.split(" d")[0]
    let die = skill.split(" d")[1]
    skills[skillName] = {
      name: skillName,
      die: die.split("+")[0],
      mod: die.split("+")[1] ? die.split("+")[1] : 0
    }
  })
  return skills;
}

async function buildActorAttributes(statblock){
  let attributes = {}
  let startIndex = statblock.indexOf('Attributes: ') + 12 //12 is Attributes: count
  let endIndex = statblock.indexOf('Skills: ')
  let attrList:String[] = statblock.slice(startIndex,endIndex).replace(/(\r\n|\n|\r)/gm, " ").split(',')  
  attrList = attrList.map( attr => attr.trim())
  attrList.map(attr => {
    let attrName = attr.split(" d")[0]
    let die = attr.split(" d")[1]
    attributes[attrName] = {
      name: attrName,
      die: die.split("+")[0],
      mod: die.split("+")[1] ? die.split("+")[1] : 0
    }
  })
  //console.log(attributes)
  return attributes
}

async function buildActorDescription(statblock:string){
  let desc:string = ""
  let endIndex = statblock.indexOf('Attributes:')
  desc = statblock.slice(0, endIndex)
  desc = desc.replace(/(\r\n|\n|\r)/gm, " ").trim()
  return desc;
}

