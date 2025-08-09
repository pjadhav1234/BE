export const getVideoRoom = (req, res) => {
  const roomId = `${req.user.role}-${req.user._id}-${Date.now()}`;
  res.json({ roomId });
};
