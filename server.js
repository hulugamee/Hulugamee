const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// JSON data fudhachuuf
app.use(express.json());

// public folder keessaa faayiloota agarsiisuuf
app.use(express.static(path.join(__dirname, "public")));

// Demo users
let users = [
  {
    id: 1,
    telegramId: "demo001",
    name: "Demo User",
    balance: 1000
  }
];

// Users hunda ilaalu
app.get("/api/users", (req, res) => {
  res.json(users);
});

// User tokko balance ilaalu
app.get("/api/users/:telegramId", (req, res) => {
  const user = users.find(
    u => u.telegramId === req.params.telegramId
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User hin argamne"
    });
  }

  res.json({
    success: true,
    user
  });
});

// Balance dabalu
app.post("/api/admin/add-balance", (req, res) => {
  const { telegramId, amount } = req.body;

  const user = users.find(
    u => u.telegramId === telegramId
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User hin argamne"
    });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Amount sirrii miti"
    });
  }

  user.balance += Number(amount);

  res.json({
    success: true,
    message: "Balance dabalamte",
    balance: user.balance
  });
});

// Balance hir'isu
app.post("/api/admin/remove-balance", (req, res) => {
  const { telegramId, amount } = req.body;

  const user = users.find(
    u => u.telegramId === telegramId
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User hin argamne"
    });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Amount sirrii miti"
    });
  }

  user.balance -= Number(amount);

  if (user.balance < 0) {
    user.balance = 0;
  }

  res.json({
    success: true,
    message: "Balance hir'ate",
    balance: user.balance
  });
});

// Homepage
app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

app.listen(PORT, () => {
  console.log(`Hulugamee server running on port ${PORT}`);
});
