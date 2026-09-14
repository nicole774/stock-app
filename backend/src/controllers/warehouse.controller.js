const createCrudController = require("./genericCrud");

module.exports = createCrudController("warehouse", {
  searchFields: ["name", "code"],
});
