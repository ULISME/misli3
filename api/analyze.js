export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { thoughts } = req.body;
  if (!thoughts) return res.status(400).json({ error: 'No thoughts provided' });

  // Временный анализ, просто для проверки
  const analysis = `Анализ полученных мыслей: ${thoughts.slice(0, 50)}...`;

  res.status(200).json({ analysis });
}
