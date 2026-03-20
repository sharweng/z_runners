const path = require("path");
const fs = require("fs");

const loadJson = (segments) => {
  const filePath = path.join(__dirname, ...segments);
  return fs.existsSync(filePath) ? require(filePath) : null;
};

const categoriesSeed =
  loadJson(["..", "..", "..", "Frontend", "data", "categories.json"]) ||
  loadJson(["..", "..", "..", "Frontend", "assets", "data", "categories.json"]);

const productsSeed =
  loadJson(["..", "..", "..", "Frontend", "data", "products.json"]) ||
  loadJson(["..", "..", "..", "Frontend", "assets", "data", "products.json"]);

if (!categoriesSeed) {
  throw new Error("Unable to load categories seed data from Frontend/data or Frontend/assets/data");
}

if (!productsSeed) {
  throw new Error("Unable to load products seed data from Frontend/data or Frontend/assets/data");
}

const toId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value.$oid) return value.$oid;
  return String(value);
};

const categories = categoriesSeed.map((item) => {
  const id = toId(item._id);
  return {
    id,
    _id: id,
    name: item.name,
  };
});

const products = productsSeed.map((item) => {
  const id = toId(item._id);
  const categoryId = toId(item.category);
  const category = categories.find((c) => c.id === categoryId) || null;

  return {
    id,
    _id: id,
    name: item.name,
    brand: item.brand,
    image: item.image || "",
    description: item.description || "",
    richDescription: item.richDescription || "",
    price: Number(item.price || 0),
    category: category
      ? { id: category.id, _id: category._id, name: category.name }
      : null,
    countInStock: Number(item.countInStock || 0),
    rating: Number(item.rating || 0),
    numReviews: Number(item.numReviews || 0),
    isFeatured: Boolean(item.isFeatured),
    dateCreated: new Date().toISOString(),
  };
});

const users = [
  {
    id: "u_admin",
    _id: "u_admin",
    name: "Admin User",
    email: "admin@zrunners.local",
    phone: "0000000000",
    password: "admin123",
    isAdmin: true,
    image: "",
  },
];

const orders = [];

const makeId = (prefix) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

module.exports = {
  categories,
  products,
  users,
  orders,
  makeId,
};
