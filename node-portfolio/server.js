const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');

app.use(express.static(publicDir));

// SPA fallback. Using app.use instead of app.get('*') keeps this compatible
// with Express 5 / path-to-regexp.
app.use((req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Regine portfolio running on http://localhost:${PORT}`);
});
