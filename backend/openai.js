import OpenAI from "openai";

const openai = new OpenAI({
 apiKey: "xxxxxxxxxx"
});

export async function getPriorityFromAI(description) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Classify civic complaints into only one word: high, medium, or low."
        },
        {
          role: "user",
          content: description
        }
      ],
      max_tokens: 5
    });

    const result = response.choices[0].message.content.toLowerCase().trim();

    if (result.includes("high")) return { label: "high", score: 3 };
    if (result.includes("low")) return { label: "low", score: 1 };
    return { label: "medium", score: 2 };

  } catch (err) {
    console.error("AI error:", err);
    return { label: "medium", score: 2 };
  }
}
