import { v2 as cloudinary } from 'cloudinary';
import { parse } from 'csv-parse/sync';
import duckdb from 'duckdb';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from "fs/promises";
import axios from "axios";
import Papa from "papaparse";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export const uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file provided." });
    }

    try {

        const filePath = req.file.path;
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type: "raw",
            public_id: req.file.originalname.split(".")[0],
        });

        await fs.unlink(filePath);

        res.status(200).json({
            message: "File uploaded successfully!",
            filePath: uploadResult.secure_url,
        });
    } catch (error) {
        res.status(500).json({ error: `Error uploading to Cloudinary: ${error.message}` });
    }
};

export const generateSQL = async (req, res) => {
    const { text, filePath } = req.body;

    if (!text || !filePath) {
        return res.status(400).json({ error: "Missing required input." });
    }

    try {

        const response = await axios.get(filePath, { responseType: "arraybuffer" });
        const fileContent = response.data.toString("utf8");

        const csvData = parse(fileContent, { columns: true });

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
            You are an expert SQL generator. Given the following text request: "${text}"
            and the structure of this CSV file: ${JSON.stringify(csvData.slice(0, 5))},
            provide an SQL query only, using 'uploaded_csv' as the table name.
        `;

        const aiResponse = await model.generateContent(prompt);
        let sqlQuery = aiResponse.response.text();
        sqlQuery = sqlQuery.replace(/```/g, "").replace(/sql/g, "").trim();
        const csvReference = `read_csv_auto('${filePath}')`;
        sqlQuery = sqlQuery.replace(/uploaded_csv/g, csvReference);

        console.log(sqlQuery)

        const db = new duckdb.Database(":memory:");
        const conn = db.connect();
        const result = await new Promise((resolve, reject) => {
            conn.all(sqlQuery, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        conn.close();
        const resultCsv = Papa.unparse(result);

        res.setHeader('Content-Disposition', 'attachment; filename=output.csv');
        res.setHeader('Content-Type', 'text/csv');
        res.status(200).send(resultCsv);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: `Error: ${error.message}` });
    }
}


export const generateSuggestion = async (req, res) => {
    try {
        const { filePath } = req.body;

        if (!filePath) {
            return res.status(400).json({ error: "Missing required input." });
        }

        const response = await axios.get(filePath, { responseType: "arraybuffer" });
        const fileContent = response.data.toString("utf8");

        const csvData = parse(fileContent, { columns: true });

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
            You are an expert in data analysis and visualization. Based on the structure of this CSV file: ${JSON.stringify(csvData.slice(0, 5))},
            suggest five diverse questions or queries that a user might ask to analyze or understand the data.Data given should be in points with no heading or description in bullet points(don't give bullet point symbol just text and column names in single quotes).
        `;

        const aiResponse = await model.generateContent(prompt);
        const suggestions = aiResponse.response.text().split('\n').map(line => line.trim()).filter(line => line);

        res.status(200).json({
            analysisSuggestions: suggestions.slice(0, 5),
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: `Error: ${error.message}` });
    }
};
