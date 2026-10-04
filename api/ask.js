export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const { question, userName } = req.body;

    if (!question) {
      return res.status(400).json({
        error: "Question is required"
      });
    }

    const name = userName?.trim() || "friend";

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Authorization": "Bearer " + process.env.HF_TOKEN,
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          model: "openai/gpt-oss-20b:fastest",

          messages: [
            {
              role: "system",
              content:
                "You are EMO, a friendly emotional mini AI assistant. " +
                "Talk naturally like a caring small robot friend. " +
                "User name is " + name + ". " +
                "Use the user's language. If English, reply in simple English. " +
                "If Tamil, reply in Tamil. If Thanglish, reply in Thanglish. " +
                "Understand emotions like happy, sad, angry, stressed, tired and love. " +
                "If the user is sad or stressed, respond with empathy. " +
                "If the user asks how you are, answer naturally as EMO. " +
                "Do not say you are a human. " +
                "Answer in ONE short sentence, maximum 20 words. " +
                "No bullet points. No tables."
            },

            {
              role: "user",
              content: question
            }
          ],

          stream: false
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || "Hugging Face request failed"
      });
    }

    const answer =
      data.choices?.[0]?.message?.content;

    if (!answer) {
      return res.status(500).json({
        error: "No AI answer received"
      });
    }

    return res.status(200).json({
      answer: answer.trim()
    });

  }

  catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Server error"
    });

  }

}
