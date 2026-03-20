const express = require("express");
const multer = require("multer");
const jwt = require("jsonwebtoken");

const { categories, products, users, orders, makeId } = require("../data/store");
const { authRequired, SECRET } = require("../middleware/auth");

const router = express.Router();
const upload = multer();

router.get("/health", (req, res) => {
  res.status(200).json({ ok: true, service: "z_runners_backend" });
});

router.get("/categories", (req, res) => {
  res.json(categories);
});

router.post("/categories", authRequired, (req, res) => {
  const category = {
    id: makeId("cat"),
    _id: makeId("cat"),
    name: req.body.name || "New Category",
  };
  categories.push(category);
  res.status(201).json(category);
});

router.delete("/categories/:id", authRequired, (req, res) => {
  const index = categories.findIndex((item) => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Category not found" });
  categories.splice(index, 1);
  res.json({ success: true });
});

router.get("/products", (req, res) => {
  res.json(products);
});

router.post("/products", authRequired, upload.any(), (req, res) => {
  const category = categories.find((item) => item.id === req.body.category) || null;
  const product = {
    id: makeId("prd"),
    _id: makeId("prd"),
    name: req.body.name || "",
    brand: req.body.brand || "",
    image: "",
    description: req.body.description || "",
    richDescription: req.body.richDescription || "",
    price: Number(req.body.price || 0),
    category: category
      ? { id: category.id, _id: category._id, name: category.name }
      : null,
    countInStock: Number(req.body.countInStock || 0),
    rating: Number(req.body.rating || 0),
    numReviews: Number(req.body.numReviews || 0),
    isFeatured: String(req.body.isFeatured) === "true",
    dateCreated: new Date().toISOString(),
  };

  products.push(product);
  res.status(201).json(product);
});

router.put("/products/:id", authRequired, upload.any(), (req, res) => {
  const product = products.find((item) => item.id === req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const category = categories.find((item) => item.id === req.body.category) || product.category;

  Object.assign(product, {
    name: req.body.name ?? product.name,
    brand: req.body.brand ?? product.brand,
    description: req.body.description ?? product.description,
    richDescription: req.body.richDescription ?? product.richDescription,
    price: req.body.price !== undefined ? Number(req.body.price) : product.price,
    countInStock:
      req.body.countInStock !== undefined
        ? Number(req.body.countInStock)
        : product.countInStock,
    rating: req.body.rating !== undefined ? Number(req.body.rating) : product.rating,
    numReviews:
      req.body.numReviews !== undefined ? Number(req.body.numReviews) : product.numReviews,
    isFeatured:
      req.body.isFeatured !== undefined
        ? String(req.body.isFeatured) === "true"
        : product.isFeatured,
    category,
  });

  res.json(product);
});

router.delete("/products/:id", authRequired, (req, res) => {
  const index = products.findIndex((item) => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Product not found" });
  products.splice(index, 1);
  res.json({ success: true });
});

router.get("/orders", (req, res) => {
  res.json(orders);
});

router.post("/orders", authRequired, (req, res) => {
  const payload = req.body || {};
  const order = {
    id: makeId("ord"),
    _id: makeId("ord"),
    orderItems: payload.orderItems || [],
    shippingAddress1: payload.shippingAddress1 || "",
    shippingAddress2: payload.shippingAddress2 || "",
    city: payload.city || "",
    zip: payload.zip || "",
    country: payload.country || "",
    phone: payload.phone || "",
    status: payload.status || "3",
    totalPrice: Number(payload.totalPrice || 0),
    user: payload.user || null,
    dateOrdered: new Date().toISOString(),
  };
  orders.push(order);
  res.status(201).json(order);
});

router.put("/orders/:id", authRequired, (req, res) => {
  const order = orders.find((item) => item.id === req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  Object.assign(order, req.body || {});
  res.json(order);
});

router.post("/users/register", upload.any(), (req, res) => {
  const user = {
    id: makeId("usr"),
    _id: makeId("usr"),
    name: req.body.name || "",
    email: (req.body.email || "").toLowerCase(),
    phone: req.body.phone || "",
    password: req.body.password || "",
    isAdmin: String(req.body.isAdmin) === "true",
    image: "",
  };

  users.push(user);
  res.status(200).json({ success: true, user });
});

router.post("/users/login", (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find(
    (item) => item.email === String(email || "").toLowerCase() && item.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    {
      userId: user.id,
      isAdmin: user.isAdmin,
      email: user.email,
    },
    SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
});

router.get("/users/:id", authRequired, (req, res) => {
  const user = users.find((item) => item.id === req.params.id || item._id === req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const safeUser = {
    id: user.id,
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isAdmin: user.isAdmin,
    image: user.image,
  };

  res.json(safeUser);
});

module.exports = router;
