const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Image = require("./models/image"); 

dotenv.config();
const app = express();
app.use(express.json());

// MongoDB Atlas connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// Multer setup (file handling)
const storage = multer.diskStorage({});
const upload = multer({ storage });

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});


// Upload Image
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "my_uploads",
    });

    // Save  MongoDB
    const newImage = new Image({
      public_id: result.public_id,
      url: result.secure_url,
    });

    await newImage.save();

    res.json({
      message: "File uploaded and saved to DB!",
      data: newImage,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Get All Images
app.get("/images", async (req, res) => {
  try {
    const images = await Image.find();
    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});
app.delete("/images/:id", async (req, res) => {
  try {
    // 1. MongoDB record
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    // 2. Cloudinary delete
    await cloudinary.uploader.destroy(image.public_id);

    // 3. MongoDB delete
    await Image.findByIdAndDelete(req.params.id);

    res.json({ message: "Image deleted from Cloudinary & MongoDB" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
