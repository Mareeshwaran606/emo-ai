export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        error: "Question is required"
      });
    }

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
              role: "user",
              content:
                "Answer in exactly ONE short sentence. " +
                "Maximum 12 words. " +
                "Use very simple English. " +
                "No table. No bullet points. " +
                "User question: " + question
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
