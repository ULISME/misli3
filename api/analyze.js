export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { thoughts } = req.body;

    if (!thoughts || !Array.isArray(thoughts)) {
      return res.status(400).json({ error: "Неверный формат thoughts" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "OPENROUTER_API_KEY не найден" });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://misli3-psi.vercel.app",
        "X-Title": "misli"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [
          {
            role: "system",
            content: "Ты анализируешь мысли человека, выделяешь ключевые темы, эмоции и паттерны."
          },
          {
            role: "user",
            content: thoughts.join("\n")
          }
        ],
        temperature: 0.4
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "OpenRouter вернул ошибку",
        details: data
      });
    }

    const analysis = data.choices?.[0]?.message?.content;

    if (!analysis) {
      return res.status(500).json({ error: "Пустой ответ от модели" });
    }

    return res.status(200).json({ analysis });
  } catch (err) {
    return res.status(500).json({
      error: "Не удалось получить анализ",
      details: err.message
    });
  }
}
