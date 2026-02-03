export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { thoughts } = req.body;

    if (!thoughts || !Array.isArray(thoughts)) {
      return res.status(400).json({ error: "thoughts must be an array" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API key not found in env" });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://misli3-psi.vercel.app",
        "X-Title": "misli3-psi"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [
          {
            role: "system",
            content: "Ты анализируешь мысли человека и находишь эмоциональные паттерны."
          },
          {
            role: "user",
            content: thoughts.join(", ")
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "OpenRouter вернул ошибку",
        details: data
      });
    }

    return res.status(200).json({
      analysis: data.choices[0].message.content
    });

  } catch (err) {
    return res.status(500).json({
      error: "Внутренняя ошибка",
      details: String(err)
    });
  }
}
