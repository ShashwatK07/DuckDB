import { useState } from "react";
import axios from "axios";
import Papa from "papaparse";
import {
    Paperclip,
    ArrowUp,
    Download,
} from "lucide-react";
import Skeleton from "../components/Skeleton";
import SpeechButton from "../components/SpeechButton";
import Navbar from "../components/navbar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const ChatPage = () => {
    const [prompt, setPrompt] = useState("");
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [answering, setAnswering] = useState(false)

    const url = import.meta.env.VITE_SERVER_URL;

    const uploadFile = async (file) => {
        if (!file) {
            alert("No file provided.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post(`${url}/api/chat/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setCsvFile(res.data.filePath);
            alert("File uploaded successfully!");
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const generateSQL = async () => {
        // if (!prompt || !csvFile) {
        //     alert("Please provide a prompt and upload a file.");
        //     return;
        // }

        try {
            setIsLoading(true);
            setAnswering(true)

            const res = await axios.post(
                `${url}/api/chat/generate`,
                { text: prompt, filePath: csvFile },
                { responseType: "blob" }
            );

            const reader = new FileReader();
            reader.onload = () => {
                const csvText = reader.result;
                Papa.parse(csvText, {
                    complete: (results) => {
                        const parsedData = results.data;
                        const formattedData = parsedData.slice(1).map((row) =>
                            Object.fromEntries(parsedData[0].map((key, i) => [key, row[i]]))
                        );

                        setResults((prevResults) => [
                            ...prevResults,
                            { prompt, csvData: parsedData, chartData: formattedData },
                        ]);
                        setIsLoading(false);
                        setPrompt("");
                    },
                });
            };
            reader.readAsText(res.data);
        } catch (error) {
            console.error("Error fetching CSV:", error);
            setIsLoading(false);
        }
    };

    const handleDownload = (csvData) => {
        if (!csvData || csvData.length === 0) {
            alert("No data available to download.");
            return;
        }

        const csvString = Papa.unparse(csvData);
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "data.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-center justify-start min-h-screen py-10 px-5 space-y-10">
                {results.map((result, index) => (
                    <div key={index} className="w-full max-w-4xl rounded-lg shadow-lg bg-white mb-4">
                        <div className="p-5 border-b">
                            <h3 className="font-bold">Query: {result.prompt}</h3>
                        </div>
                        <div className="p-5">
                            {isLoading ? (
                                <Skeleton />
                            ) : (
                                <>
                                    <div className="overflow-x-auto mb-5">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr>
                                                    {result.csvData[0]?.map((header, i) => (
                                                        <th key={i} className="border-b p-3">
                                                            {header}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {result.csvData.slice(1).map((row, rowIndex) => (
                                                    <tr key={rowIndex}>
                                                        {row.map((cell, cellIndex) => (
                                                            <td key={cellIndex} className="p-3 border-b">
                                                                {cell}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={result.chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey={result.csvData[0][0]} />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey={result.csvData[0][1]} fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </>
                            )}
                        </div>
                        <div className="p-5 border-t">
                            <button
                                className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-100"
                                onClick={() => handleDownload(result.csvData)}
                            >
                                <Download />
                                Download CSV
                            </button>
                        </div>
                    </div>
                ))}
                <div
                    className={`w-full max-w-4xl bg-white m-auto ${answering ? "fixed bottom-0 left-0 right-0 mb-6" : ""}`}
                >
                    {!answering && (
                        <h2 className="text-2xl font-semibold text-center mb-4">
                            What can I help with?
                        </h2>
                    )}

                    <div className="w-full max-w-4xl p-4 rounded-3xl shadow-lg bg-white m-auto">
                        <textarea
                            className={`w-full p-3 rounded-lg focus:outline-none ${answering ? "h-16" : "h-32"
                                }`}
                            placeholder="Message Super"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                        <div className="flex items-center justify-between mt-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <Paperclip />
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => uploadFile(e.target.files[0])}
                                    accept=".csv,.txt"
                                />
                            </label>
                            <div className="flex items-center gap-2">
                                <SpeechButton handlePrompt={setPrompt} />
                                <button
                                    className={`flex items-center justify-center w-10 h-10 rounded-full ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
                                        }`}
                                    onClick={generateSQL}
                                >
                                    <ArrowUp className="text-white" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default ChatPage;
