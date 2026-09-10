import app from './app';
import { authService } from './modules/auth/auth.service';

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await authService.seedAdmin();
  } catch (error) {
    console.error('[Auth] Falha ao criar o admin:', error);
  }

  app.listen(PORT, () => {
    console.log(`The Dark Library Backend running on http://localhost:${PORT}`);
  });
}

start();