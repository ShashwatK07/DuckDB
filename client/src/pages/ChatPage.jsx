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
import useAuthStore from "../../store/authStore";

const ChatPage = () => {
    const [prompt, setPrompt] = useState("");
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [answering, setAnswering] = useState(false)
    const { theme } = useAuthStore()

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
        <div className={`${theme === "dark" ? "bg-[#181C14] text-white" : "bg-[#F5EFFF] text-black"}`}>
            <Navbar />
            <div className="flex flex-col items-center justify-start min-h-screen p-10 space-y-5 max-h-[25px]">
                {/* Result component */}
                {results.map((result, index) => (
                    <div
                        key={index}
                        className={`w-3/4 max-w-4xl h-3/4 overflow-y-auto rounded-lg shadow-sm ${theme === "dark" ? "bg-[#181C14] text-white" : "bg-[#F5EFFF] text-black"} mb-4 mx-auto`}
                        style={{ height: "80%" }}
                    >
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
                {/* Chat component */}
                <div
                    className={`w-full max-w-4xl ${theme === "dark" ? "bg-[#181C14] text-white" : "bg-[#F5EFFF] text-black"} m-auto rounded-3xl ${answering ? " bottom-0 left-0 right-0 mb-3" : ""}`}
                >
                    {!answering && (
                        <h2 className="text-4xl font-semibold text-center mb-6">
                            What can I help with?
                        </h2>
                    )}

                    <div className={`w-full max-w-4xl p-4 ${theme === "dark" ? "bg-[#3C3D37] text-[#F5EFFF]" : "bg-[#E5D9F2] text-black"} rounded-3xl m-auto`}>
                        <textarea
                            className={`w-full rounded-lg bg-transparent focus:outline-none ${answering ? "h-7" : "h-32"
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
        </div >
    );
};

export default ChatPage;
