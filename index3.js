const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const app = express();
app.use(express.json());

// 🔹 Cloudinary Configuration (hardcoded)
cloudinary.config({
  cloud_name: "dwmfqbbmp",       // your cloud name
  api_key: "117874648184923",    // your API key
  api_secret: "4iFNTp-qw4Zjz8bPNud7FXf_FJo" // your API secret
});

// 🔹 Multer setup (temporary local storage before upload to Cloudinary)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads"); // save locally first
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + ".jpg");
  },
});

const upload = multer({ storage: storage }).single("user_file");

// 🔹 Upload API
app.post("/upload", upload, async (req, res) => {
  try {
    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "my_uploads", // optional: organize files in a folder
    });

    // Remove file from local uploads folder after uploading to Cloudinary
    fs.unlinkSync(req.file.path);

    res.json({
      message: "File uploaded successfully!",
      url: result.secure_url, // Cloudinary CDN URL
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }
});

// 🔹 Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
