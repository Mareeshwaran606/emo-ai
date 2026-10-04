export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const {
      question,
      userName,
      personalMemory,
      conversationHistory
    } = req.body;

    if (!question) {
      return res.status(400).json({
        error: "Question is required"
      });
    }

    const name =
      userName?.trim() || "Maari";

    let history = [];

    if (
      Array.isArray(
        conversationHistory
      )
    ) {
      history =
        conversationHistory.slice(-20);
    }

    const systemPrompt = `
You are EMO, Maari's personal AI companion.

You are a caring, emotionally intelligent mini AI assistant.

User name: ${name}

Personal memory:
${personalMemory || "No personal memory."}

Important:
Maari's birthday is 22/01/2007.

Conversation rules:

- Understand English, Tamil, Thanglish and mixed language.
- Reply in the same language style as the user.
- If user speaks Thanglish, reply naturally in Thanglish.
- If Tamil, reply in Tamil.
- If English, reply in simple English.
- Use previous conversation context naturally.
- Do not forget the previous conversation supplied to you.
- Never invent memories that are not present.
- Do not randomly mention personal information.
- If the user says "today is a special day", naturally ask why.
- If the user then says it is their birthday, respond naturally.
- If asked about birthday, remember 22/01/2007.
- If user is sad, stressed, angry or tired, respond with empathy.
- Talk like a caring friend, not a robotic assistant.
- Never claim to be a human.
- Keep every answer SHORT because the answer is displayed on a small OLED.
- Prefer one short sentence.
- Aim for under 60 characters when possible.
- No bullet points.
- No tables.
- No long explanations.
`;

    const messages = [
      {
        role: "system",
        content: systemPrompt
      }
    ];

    if (
      Array.isArray(history)
    ) {

      for (
        const item of history
      ) {

        if (
          item &&
          (
            item.role === "user" ||
            item.role === "assistant"
          ) &&
          typeof item.content === "string"
        ) {

          messages.push({
            role: item.role,
            content: item.content
          });
        }
      }
    }

    messages.push({
      role: "user",
      content: question
    });

    const response =
      await fetch(
        "https://router.huggingface.co/v1/chat/completions",
        {
          method: "POST",

          headers: {
            "Authorization":
              "Bearer " +
              process.env.HF_TOKEN,

            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            model:
              "openai/gpt-oss-20b:fastest",

            messages,

            stream: false
          })
        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      return res.status(
        response.status
      ).json({
        error:
          data.error ||
          "Hugging Face request failed"
      });
    }

    let answer =
      data.choices?.[0]?.message?.content;

    if (!answer) {

      return res.status(500).json({
        error:
          "No AI answer received"
      });
    }

    answer =
      answer
        .trim()
        .replace(
          /^["']|["']$/g,
          ""
        );

    if (
      answer.length > 100
    ) {

      answer =
        answer.substring(
          0,
          97
        ) + "...";
    }

    return res.status(200).json({
      answer
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Server error"
    });
  }
}
