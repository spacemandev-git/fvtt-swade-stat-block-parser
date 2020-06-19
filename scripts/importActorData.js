export const importActorData = function (actor) {
  // Commented out fields will be automatically created by the sheet
  let data = {};
  data.attributes = importActorAttributes(actor);
  data.stats = {};
  data.details = {};
  data.powerPoints = {};
  //data.fatigue = {}
  //data.wounds = {}
  //data.advances = {}
  //data.bennies = {}
  //data.owned = {}
  data.status = {};
  data.initiative = {};
  data.wildcard = actor.type == "character" ? true : false;

  return data;
};

function importActorAttributes(actor) {
  let attributes = actor.attributes;

  return attributes;
}
