// api/quote.ts

export default async function handler(req, res) {
  const quotes = [
    "Stay hungry, stay foolish.",
    "Code is like humor — when you have to explain it, it’s bad.",
    "Simplicity is the soul of efficiency.",
    "First, solve the problem. Then, write the code.",
    "The best error message is the one that never shows up.",
  ];

  const random = quotes[Math.floor(Math.random() * quotes.length)];

  return res.status(200).json({
    quote: random,
    timestamp: new Date().toISOString(),
  });
}
