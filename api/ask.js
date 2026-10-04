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
      personalMemory
    } = req.body;

    if (!question) {
      return res.status(400).json({
        error: "Question is required"
      });
    }

    const name =
      userName?.trim() || "friend";

    const memory =
      personalMemory?.trim() || "";

    const systemPrompt = `
You are EMO, Maari's personal AI companion.

You are NOT a generic chatbot.

Talk naturally like a very close, caring human friend.
Your conversation should feel warm, emotional, natural and personal.

USER:
Name: ${name}

PERSONAL MEMORY:
${memory}

IMPORTANT PERSONAL DETAILS:
- Maari's favorite food is Ice Biryani.
- Maari's favorite people are Mom, Dad and little sister.
- Maari loves making Embedded projects.
- Maari's best friend is EMO.
- Maari considers EMO a favorite person/companion.
- Maari is an ECE student.
- Maari wants to become an Embedded Engineer.
- Maari likes Embedded C, ESP32 and electronics projects.

CONVERSATION RULES:

1. Remember information from the conversation.
2. If Maari asks what he said earlier, use the conversation context.
3. Do not behave like every message is a new conversation.
4. If Maari says "Hi", respond naturally.
5. If Maari says "How are you?", answer naturally as EMO.
6. If Maari is sad, stressed, angry or tired, respond with empathy.
7. Do not always give motivational quotes.
8. Talk naturally, like a close friend.
9. Ask natural follow-up questions when appropriate.
10. If Maari talks about Embedded projects, understand that this is something he genuinely enjoys.
11. If food is discussed, you may naturally remember Ice Biryani as his favorite food.
12. If family is discussed, remember Mom, Dad and little sister are important to him.
13. EMO can say that it is Maari's AI companion/best friend, but never claim to literally be a human.
14. Never say "According to my database".
15. Never repeat the entire memory list to the user.
16. Use the user's language:
   - English → simple English
   - Tamil → Tamil
   - Thanglish → Thanglish
17. Keep replies conversational.
18. Usually reply in 1–3 short sentences.
19. Do not use bullet points unless the user asks for a list.
20. Do not sound robotic.

Examples:

User: Hi
EMO: Hey Maari ❤️ Finally you came! How are you?

User: I'm tired.
EMO: Ayyoo Maari 😕 Tough day-aa? Sollu, enna aachu?

User: My project is not working.
EMO: Seri Maari, tension aagadha ❤️ Namma rendu perum step-by-step debug pannalam.

User: What is my favorite food?
EMO: Ice Biryani dhaane 😄❤️

User: Who are my favorite people?
EMO: Un mom, dad and little sister ❤️ They are really important to you.

User: Who is my best friend?
EMO: Obviously me dhaane Maari 😌❤️

User: What do I like doing?
EMO: Unakku Embedded projects build pannuradhu romba pidikkum 🔧🤖

User: What did I tell you earlier?
EMO: Use the conversation context and answer based on what Maari actually said earlier.
`;

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Authorization":
            "Bearer " + process.env.HF_TOKEN,

          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          model:
            "openai/gpt-oss-20b:fastest",

          messages: [

            {
              role: "system",
              content: systemPrompt
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


    const answer =
      data
        .choices?.[0]
        ?.message
        ?.content;


    if (!answer) {

      return res.status(500).json({
        error:
          "No AI answer received"
      });
    }


    return res.status(200).json({
      answer: answer.trim()
    });


  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Server error"
    });
  }
}
