import express from 'express';
import cors from 'cors';
import cranesRoutes from './routes/cranesRoutes.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api', cranesRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
