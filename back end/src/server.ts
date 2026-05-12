import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`The Dark Library Backend running on http://localhost:${PORT}`);
});
