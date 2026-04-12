import express from "express";
import connectDB from "./db.js";
import Complaint from "./models/complaint.js";
import cloudinary from "./cloudinary.js";
import axios from "axios";
import getRoadwaysPriority from "./utils/roadwayPriority.js";
import cors from "cors";
import { getPriorityFromAI } from "./openai.js";
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
connectDB();

const userState = {};        // category
const descriptionStore = {}; // description
const tempStorage = {};      // image

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

function getMinistry(category) {
  const c = category.toLowerCase();

  if (c.includes("pothole") || c.includes("road")) {
    return "road";
  }

  if (c.includes("train") || c.includes("rail") || c.includes("track")) {
    return "rail";
  }

  if (c.includes("drain") || c.includes("water") || c.includes("sewage")) {
    return "municipal";
  }

  // fallback
  return "municipal";
}
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

   // const category = userState[from] || "not specified";
   const categoryData = userState[from] || {};

//const ministry = categoryData.ministry || "unknown";
//const type = categoryData.type || "unknown";
    const description = descriptionStore[from] || "no description";

    try {
      // download image
      const response = await axios.get(mediaUrl, {
        responseType: "arraybuffer",
        auth: {
          username: "AC8aaa2e64c4e46bcb10aae60a9c627932",
          password: "03ac1bf87522318ef675a17c100c7987"
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
    /* tempStorage[from] = {
        category,
        description,
        imageUrl: finalImageUrl
      };
*/
const categoryData = userState[from] || {};

const ministry = categoryData.ministry || "unknown";
const type = categoryData.type || "unknown";

tempStorage[from] = {
  category: ministry,
  type: type,
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
    reply = reply = `Hello from CitySync 🚀

Please choose the type of your problem:

1. Pothole
2. Accident
3. Railways Issue
4. Drainage
5. Garbage

Reply with the number (1-5).`;
  }

  // ✅ STEP 3: CATEGORY
  else if (message === "1") {
  userState[from] = { ministry: "road", type: "pothole" };
  reply = "You selected Pothole 🛣️\nPlease describe the problem.";
}

else if (message === "2") {
  userState[from] = { ministry: "road", type: "accident" };
  reply = "You selected Accident 🚨\nPlease describe the problem.";
}

else if (message === "3") {
  userState[from] = { ministry: "rail", type: "railway" };
  reply = "You selected Railway Issue 🚆\nPlease describe the problem.";
}

else if (message === "4") {
  userState[from] = { ministry: "municipal", type: "drainage" };
  reply = "You selected Drainage 💧\nPlease describe the problem.";
}

else if (message === "5") {
  userState[from] = { ministry: "municipal", type: "garbage" };
  reply = "You selected Garbage 🗑️\nPlease describe the problem.";
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

  

  
    

   /* else if (tempStorage[from]) {
  const { category, description, imageUrl } = tempStorage[from];
  const address = message;

  console.log("Address received:", address);

  try {
    // 🧠 Normalize inputs
    const normalizedAddress = address.trim().toLowerCase();

    // 🔁 Map category to standard format
    let mappedCategory = "";

    if (category === "pothole") mappedCategory = "POTHOLE";
    else if (category === "accident") mappedCategory = "ACCIDENT";
    else if (category === "drainage") mappedCategory = "WATERLOGGING";

    // 🚧 Department (for now)
    const department = "ROADWAYS";

    // 🔁 Frequency (same category + same address)
    const frequency = await Complaint.countDocuments({
      category: mappedCategory,
      address: normalizedAddress,
      department
    });

    // ⚡ Priority calculation
    const priority = getRoadwaysPriority(
      mappedCategory,
      frequency + 1
    );

 
    const ministry = getMinistry(category);

await Complaint.create({
  phone: from,
  category: ministry,   // ✅ STORE MINISTRY HERE
  description,
  imageUrl,
  address
});

    console.log("Complaint saved with priority:", priority);

    // cleanup
    delete userState[from];
    delete descriptionStore[from];
    delete tempStorage[from];

    reply = `✅ Complaint registered successfully!
📍 Address: ${address}
⚡ Priority: ${priority}`;

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
}*/

else if (tempStorage[from]) {

  const { category, type, description, imageUrl } = tempStorage[from];
  const address = message;

  console.log("Address received:", address);

  try {
    // 🔥 AI CALL (ONLY ONCE)
    const aiResult = await getPriorityFromAI(description);
    const priority = aiResult.label;
    const priorityScore = aiResult.score;

    console.log("AI RESULT:", aiResult);
    console.log("SAVING OBJECT:", {
  phone: from,
  category,
  type,
  description,
  address,
  imageUrl,
  priority,
  priorityScore
});

    // ✅ SAVE TO DB
    await Complaint.create({
      phone: from,
      category,
      type,
      description,
      address,
      imageUrl,
      priority,
      priorityScore
    });

    console.log("Complaint saved to DB");

    // cleanup
    delete userState[from];
    delete descriptionStore[from];
    delete tempStorage[from];

    reply = `✅ Complaint registered successfully!
📍 Address: ${address}
⚡ Priority: ${priority.toUpperCase()}`;

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


app.get("/complaints/:dept", async (req, res) => {
  try {
    const dept = req.params.dept.toLowerCase();

    const complaints = await Complaint.find({
      category: dept   // ✅ this is your ministry field
    }).sort({ priorityScore: -1, createdAt: -1 })

    res.json(complaints);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching complaints" });
  }
});
app.get("/complaint/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    res.json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching complaint" });
  }
});
app.get("/issue/:id", async (req, res) => {
  try {
    const issue = await Complaint.findById(req.params.id)

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" })
    }

    res.json(issue)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})


app.get("/complaints/user/:phone", async (req, res) => {
  try {
    const phone = req.params.phone;

    const complaints = await Complaint.find({ phone }).sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching user complaints" });
  }
});
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
