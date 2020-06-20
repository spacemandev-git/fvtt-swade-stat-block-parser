export const importActorData = function (actor) {
  // Commented out fields will be automatically created by the sheet
  let data = {};
  data.attributes = actor.attributes;
  data.stats = {
    speed: { sprintDie: "1d6", value: actor.pace },
    toughness: actor.toughness,
    parry: actor.parry,
    size: 0,
  };
  data.details = {
    biography: { value: actor.description },
  };
  data.powerPoints = importActorPowerPoints(actor);
  data.wildcard = actor.type == "character" ? true : false;

  return data;
};

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
