const createCrudController = require("./genericCrud");

module.exports = createCrudController("category", {
  searchFields: ["name"],
  include: { products: false },
});
