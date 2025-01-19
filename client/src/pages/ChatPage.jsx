import { useState } from "react";
import axios from "axios";
import Papa from "papaparse";
import {
    Paperclip,
    ArrowUp,
    Download,
    AudioLines,
} from "lucide-react";
import Skeleton from "../components/Skeleton";
import SpeechButton from "../components/SpeechButton";
import Navbar from "../components/navbar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import useAuthStore from "../../store/authStore";
import Vapi from "@vapi-ai/web";


const ChatPage = () => {
    const [prompt, setPrompt] = useState("");
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [answering, setAnswering] = useState(false)
    const { theme } = useAuthStore()
    const [selectedChart, setSelectedChart] = useState("BarChart");

    const url = import.meta.env.VITE_SERVER_URL;
    const vapi = new Vapi("0b954f96-76d4-490e-8878-460153e57a48");


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
        if (!prompt || !csvFile) {
            alert("Please provide a prompt and upload a file.");
            return;
        }

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
        <div className={`flex flex-col h-screen ${theme === "dark" ? "bg-[#181C14] text-white" : "bg-[#F5EFFF] text-black"}`}>
            <Navbar />
            <main className="flex flex-col flex-1 overflow-y-auto items-center justify-start p-3 space-y-5">

                {results.map((result, index) => {

                    const renderChart = () => {
                        switch (selectedChart) {
                            case "BarChart":
                                return (
                                    <BarChart data={result.chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey={result.csvData[0][0]} />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey={result.csvData[0][1]} fill="#8884d8" />
                                    </BarChart>
                                );
                            case "LineChart":
                                return (
                                    <LineChart data={result.chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey={result.csvData[0][0]} />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey={result.csvData[0][1]} stroke="#82ca9d" />
                                    </LineChart>
                                );
                            case "PieChart":
                                return (
                                    <PieChart>
                                        <Pie
                                            data={result.chartData}
                                            dataKey={result.csvData[0][1]}
                                            nameKey={result.csvData[0][0]}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#8884d8"
                                            label
                                        />
                                        <Tooltip />
                                    </PieChart>
                                );
                            default:
                                return null;
                        }
                    };

                    return (
                        <div
                            key={index}
                            className={`w-3/4 max-w-4xl h-3/4 overflow-y-auto rounded-lg shadow-sm ${theme === "dark" ? "bg-[#181C14] text-white" : "bg-[#F5EFFF] text-black"
                                } mb-4 mx-auto`}
                            style={{ height: "80%" }}
                        >
                            {isLoading ? (
                                <Skeleton />
                            ) : (
                                <>
                                    <div className="p-5 border-b">
                                        <h3 className="font-bold">Query: {result.prompt}</h3>
                                    </div>
                                    <div className="p-5">
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
                                        <div className="mb-5">
                                            <div className="flex justify-center gap-3 mb-4">
                                                <button
                                                    className={`px-3 py-2 border rounded-md ${selectedChart === "BarChart" ? "bg-gray-300" : ""
                                                        }`}
                                                    onClick={() => setSelectedChart("BarChart")}
                                                >
                                                    Bar Chart
                                                </button>
                                                <button
                                                    className={`px-3 py-2 border rounded-md ${selectedChart === "LineChart" ? "bg-gray-300" : ""
                                                        }`}
                                                    onClick={() => setSelectedChart("LineChart")}
                                                >
                                                    Line Chart
                                                </button>
                                                <button
                                                    className={`px-3 py-2 border rounded-md ${selectedChart === "PieChart" ? "bg-gray-300" : ""
                                                        }`}
                                                    onClick={() => setSelectedChart("PieChart")}
                                                >
                                                    Pie Chart
                                                </button>
                                            </div>
                                            <ResponsiveContainer width="100%" height={300}>
                                                {renderChart()}
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </>
                            )}
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
                    );
                })}

                <div
                    className={`w-full max-w-4xl ${theme === "dark" ? "bg-[#181C14] text-white" : "bg-[#F5EFFF] text-black"}  rounded-3xl m-auto ${answering ? " bottom-0 mb-3" : ""}`}
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
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <AudioLines />
                                    <input
                                        type="file"
                                        className="hidden"
                                    />
                                </label>
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

            </main>
        </div >
    );
};

export default ChatPage;
