const createCrudController = require("./genericCrud");

module.exports = createCrudController("customer", {
  searchFields: ["name", "email", "phone"],
});
