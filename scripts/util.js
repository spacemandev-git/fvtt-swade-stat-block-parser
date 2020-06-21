export const logger = function (message) {
  console.log(`Statblock Importer | ${message}`);
};

export const getItemCompendiums = function () {
  let itemCompendiumsList = game.packs
    .filter((el) => el.metadata.entity == "Item")
    .map((el) => {
      return `${el.metadata.package}.${el.metadata.name}`;
    });
  return itemCompendiumsList;
};
