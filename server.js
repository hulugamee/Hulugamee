const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// JSON request handling
app.use(express.json());

// Public folder
app.use(express.static(path.join(__dirname, "public")));

// Demo users
const users = {};

// Demo game state
let game = {
  status: "waiting",
  multiplier: 1.0,
  crashPoint: 2.75
};

// Create/get demo user
app.post("/api/user", (req, res) => {
  const telegramId = String(req.body.telegramId || "demo-user");

  if (!users[telegramId]) {
    users[telegramId] = {
      telegramId,
      balance: 1000,
      bet: 0,
      history: []
    };
  }

  res.json(users[telegramId]);
});

// Get balance
app.get("/api/balance/:telegramId", (req, res) => {
  const id = String(req.params.telegramId);

  if (!users[id]) {
    return res.status(404).json({
      error: "User not found"
    });
  }

  res.json({
    balance: users[id].balance
  });
});

// Start demo round
app.post("/api/game/start", (req, res) => {
  game = {
    status: "running",
    multiplier: 1.0,
    crashPoint: Number((1.2 + Math.random() * 5).toFixed(2))
  };

  res.json(game);
});

// Get current game
app.get("/api/game", (req, res) => {
  res.json(game);
});

// Demo bet
app.post("/api/bet", (req, res) => {
  const telegramId = String(req.body.telegramId || "demo-user");
  const amount = Number(req.body.amount);

  if (!users[telegramId]) {
    users[telegramId] = {
      telegramId,
      balance: 1000,
      bet: 0,
      history: []
    };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({
      error: "Invalid demo bet amount"
    });
  }

  if (amount > users[telegramId].balance) {
    return res.status(400).json({
      error: "Insufficient demo balance"
    });
  }

  users[telegramId].balance -= amount;
  users[telegramId].bet = amount;

  res.json({
    success: true,
    balance: users[telegramId].balance,
    bet: amount
  });
});

// Demo cash out
app.post("/api/cashout", (req, res) => {
  const telegramId = String(req.body.telegramId || "demo-user");

  if (!users[telegramId]) {
    return res.status(404).json({
      error: "User not found"
    });
  }

  if (users[telegramId].bet <= 0) {
    return res.status(400).json({
      error: "No active demo bet"
    });
  }

  const winAmount = Number(
    (users[telegramId].bet * game.multiplier).toFixed(2)
  );

  users[telegramId].balance += winAmount;

  users[telegramId].history.push({
    type: "cashout",
    bet: users[telegramId].bet,
    multiplier: game.multiplier,
    amount: winAmount,
    time: new Date().toISOString()
  });

  users[telegramId].bet = 0;

  res.json({
    success: true,
    winAmount,
    balance: users[telegramId].balance
  });
});

// Demo deposit request
app.post("/api/deposit", (req, res) => {
  const telegramId = String(req.body.telegramId || "demo-user");
  const reference = String(req.body.reference || "");

  res.json({
    success: true,
    status: "pending",
    telegramId,
    reference,
    message: "Demo deposit request received."
  });
});

// Demo withdrawal request
app.post("/api/withdraw", (req, res) => {
  const telegramId = String(req.body.telegramId || "demo-user");
  const amount = Number(req.body.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({
      error: "Invalid demo withdrawal amount"
    });
  }

  res.json({
    success: true,
    status: "pending",
    telegramId,
    amount,
    message: "Demo withdrawal request received."
  });
});

// Main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Hulugamee Aviator DEMO running on port ${PORT}`);
});
