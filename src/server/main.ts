import ViteExpress from 'vite-express';
import app from './index.js';

const PORT = process.env.PORT ? +process.env.PORT : 3000;

ViteExpress.config({
    ignorePaths: (path) => path.includes('/api'),
});
ViteExpress.listen(app, PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}...`);
});
