export const generateRoom = (req, res) => {
  const roomId = `vc-${req.user._id}-${Date.now()}`;
  res.json({ roomId });
};
