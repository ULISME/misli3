export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Метод не разрешён" });
  }

  try {
    const body = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", chunk => data += chunk);
      req.on("end", () => resolve(JSON.parse(data)));
      req.on("error", err => reject(err));
    });

    const { thoughts } = body;
    if (!thoughts || !thoughts.length) {
      return res.status(400).json({ error: "Нет мыслей для анализа" });
    }

    const userInput = thoughts.join("\n");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [
          {
            role: "system",
            content: "Ты — психолог. Анализируешь мысли пользователей без советов и оценок, выявляешь паттерны и повторяющиеся темы. Текст — быстрые ситуативные мысли из разных моментов дня."
          },
          {
            role: "user",
            content: userInput
          }
        ],
        temperature: 0.2,
        max_tokens: 500
      })
    });

    const dataResponse = await response.json();

    if (!dataResponse.choices || !dataResponse.choices[0].message) {
      return res.status(500).json({ error: "Не удалось получить анализ" });
    }

    res.status(200).json({ analysis: dataResponse.choices[0].message.content });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
}
