import express from 'express';
import { uploadFile, generateSQL } from '../controllers/duckDBController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/upload', upload.single('file'), uploadFile);
router.post('/generate', generateSQL);

export default router;
