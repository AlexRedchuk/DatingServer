const { getFileStream } = require("../utils/s3");
const { Router } = require("express");
const router = Router();
const auth = require("../middlewares/auth");



router.get("/images/:key", async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});


module.exports = router;
