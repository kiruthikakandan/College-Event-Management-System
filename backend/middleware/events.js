router.get('/test', auth, (req, res) => {
  res.json({
    message: "Protected route working",
    user: req.user
  });
});