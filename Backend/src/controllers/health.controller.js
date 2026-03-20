const getHealth = (req, res) => {
  res.status(200).json({
    ok: true,
    service: "z_runners_backend",
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  getHealth,
};
