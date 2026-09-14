const createCrudController = require("./genericCrud");

module.exports = createCrudController("supplier", {
  searchFields: ["name", "email", "phone"],
});
