export const importActorData = function (actor) {
  // Commented out fields will be automatically created by the sheet
  let data = {};
  data.attributes = actor.attributes;
  data.stats = {
    speed: { sprintDie: "1d6", value: actor.pace },
    toughness: {
      value:
        actor.toughness.value +
        (actor.toughness.armor > 0 ? `(${actor.toughness.armor})` : ""),
    },
    parry: actor.parry,
    size: 0,
  };
  data.details = {
    biography: {
      value: actor.description + "<p></p><p></p>" + getSpecialsAsHTML(actor),
    },
  };
  data.powerPoints = importActorPowerPoints(actor);
  data.wildcard = actor.type == "character" ? true : false;

  return data;
};

function getSpecialsAsHTML(actor) {
  let specials = "";
  let abilities = Object.keys(actor.specials);
  abilities.map((abl) => {
    specials += `<p>${abl} : ${actor.specials[abl]}</p>`;
  });
  return specials;
}

function importActorPowerPoints(actor) {
  let powerPoints = {};
  Object.keys(actor["powers"]).map((arcaneBackground) => {
    powerPoints[arcaneBackground] = {
      value: actor["powers"][arcaneBackground].pp_amt,
      max: actor["powers"][arcaneBackground].pp_amt,
    };
  });
  return powerPoints;
}
