import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fileRoutes from './routes/duckDBRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/chat', fileRoutes);
app.use('/api/auth')

app.get('/', (req, res) => {
    res.json({ message: 'Server running successfully' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
