import { createAuthController } from './controllers/authController.js';

document.addEventListener('DOMContentLoaded', async () => {
  const controller = createAuthController();
  await controller.start();
});
