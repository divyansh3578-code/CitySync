import express from "express";
import connectDB from "./db.js";
import Complaint from "./models/complaint.js";
import cloudinary from "./cloudinary.js";
import axios from "axios";

const app = express();
connectDB();

const userState = {};        // category
const descriptionStore = {}; // description
const tempStorage = {};      // image

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.post("/webhook", async (req, res) => {
  console.log("Webhook hit!");

  const message = req.body.Body;
  const from = req.body.From;
  const numMedia = req.body.NumMedia;
  const mediaUrl = req.body.MediaUrl0;

  console.log("Message:", message);
  console.log("From:", from);

  let reply = "";

  // ✅ STEP 1: IMAGE RECEIVED
  if (parseInt(numMedia) > 0) {

    console.log("Image received from Twilio:", mediaUrl);

    const category = userState[from] || "not specified";
    const description = descriptionStore[from] || "no description";

    try {
      // download image
      const response = await axios.get(mediaUrl, {
        responseType: "arraybuffer",
        auth: {
          username: "xxxxxxxx",
          password: "xxxxxxxx"
        }
      });

      const base64Image = Buffer.from(response.data, "binary").toString("base64");

      // upload to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${base64Image}`
      );

      const finalImageUrl = uploadResponse.secure_url;

      console.log("Uploaded to Cloudinary:", finalImageUrl);

      // store temporarily
      tempStorage[from] = {
        category,
        description,
        imageUrl: finalImageUrl
      };

      reply = "📍 Please enter your address/location for this complaint.";

    } catch (error) {
      console.error("Image error:", error);
      reply = "❌ Error processing image. Try again.";
    }

    res.set("Content-Type", "text/xml");
    return res.send(`
      <Response>
        <Message>${reply}</Message>
      </Response>
    `);
  }

  // ✅ STEP 2: START FLOW
  else if (message === "Hi" || message === "hi") {
    reply = `Hello from CitySync 
Please choose the type of your problem:

1. Pothole
2. Report an accident
3. Report drainage problem`;
  }

  // ✅ STEP 3: CATEGORY
  else if (message === "1") {
    userState[from] = "pothole";
    reply = "You chose Pothole 🛣️\n📝 Please describe the problem.";
  }

  else if (message === "2") {
    userState[from] = "accident";
    reply = "You chose Accident 🚨\n📝 Please describe the problem.";
  }

  else if (message === "3") {
    userState[from] = "drainage";
    reply = "You chose Drainage 💧\n📝 Please describe the problem.";
  }

  // ✅ STEP 4: DESCRIPTION
  else if (userState[from] && !descriptionStore[from]) {

    descriptionStore[from] = message;

    console.log("Description stored:", message);

    reply = "📸 Please upload an image of the problem.";

    res.set("Content-Type", "text/xml");
    return res.send(`
      <Response>
        <Message>${reply}</Message>
      </Response>
    `);
  }

  // ✅ STEP 5: ADDRESS → FINAL SAVE
  else if (tempStorage[from]) {

    const { category, description, imageUrl } = tempStorage[from];
    const address = message;

    console.log("Address received:", address);

    try {
      await Complaint.create({
        phone: from,
        category,
        description,
        imageUrl,
        address
      });

      console.log("Complaint saved to DB");

      // cleanup
      delete userState[from];
      delete descriptionStore[from];
      delete tempStorage[from];

      reply = `✅ Complaint registered successfully!
📍 Address: ${address}`;

    } catch (error) {
      console.error("DB error:", error);
      reply = "❌ Error saving complaint.";
    }

    res.set("Content-Type", "text/xml");
    return res.send(`
      <Response>
        <Message>${reply}</Message>
      </Response>
    `);
  }

  // fallback
  else {
    reply = "Invalid option. Please type Hi to start.";
  }

  res.set("Content-Type", "text/xml");
  res.send(`
    <Response>
      <Message>${reply}</Message>
    </Response>
  `);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
