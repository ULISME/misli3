import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { thoughts } = req.body;
  if (!thoughts) return res.status(400).json({ error: 'No thoughts provided' });

  const PROMPT = `Ты — квалифицированный психолог и аналитик мыслей. 
Проводишь холодный анализ мыслей без советов и личных привязок. 
Выводишь повторяющиеся паттерны и зацикленности. 
Учти, что мысли пользователя пишутся в случайный момент дня и являются быстрыми, ситуативными.`;

  try {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: PROMPT },
          { role: 'user', content: thoughts }
        ],
        max_tokens: 500,
        temperature: 0.3
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-071487ddbfab4b9fa7bdc606559ce21c'
        }
      }
    );

    const analysis = response.data.choices?.[0]?.message?.content || 'Нет данных для анализа';
    res.status(200).json({ analysis });
  } catch (e) {
    console.log('Ошибка DeepSeek:', e.response?.data || e.message);
    res.status(500).json({ error: 'Не удалось выполнить анализ' });
  }
}
