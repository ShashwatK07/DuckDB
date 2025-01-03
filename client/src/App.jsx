import React, { useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import { ChartNoAxesColumnIncreasing, Users, Calendar, DollarSign, Paperclip, Plus, ArrowRight, Download } from 'lucide-react';
import Skeleton from './components/Skeleton';

const App = () => {

  const [prompt, setPrompt] = useState("");
  const [csvData, setCsvData] = useState([]);
  const [isLoading, setIsLoading] = useState(false)
  const [display, setDisplay] = useState(false)
  const [csvFile, setCsvFile] = useState(null)

  const url = "https://duckdb-curc.onrender.com"
  // const url = "http://localhost:8080"

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [badgeCount, setBadgeCount] = useState(0);

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSelection = (data) => {
    setBadgeCount(1);
    setIsDropdownOpen(false);
    setCsvFile(data)
  };

  const customPrompt = (data) => {
    setPrompt(data)
  }

  const uploadFile = async (file) => {
    if (!file) {
      throw new Error('No file provided for upload.');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${url}/upload_file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(res.data)
      setCsvFile(res.data.filePath)
      alert("File uploaded successfully!")
      return res.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      if (error.res) {
        throw new Error(error.res.data.error || 'File upload failed.');
      } else {
        throw new Error('An unexpected error occurred while uploading the file.');
      }
    }
  };

  const generateSQL = async () => {
    try {
      if (!prompt) {
        alert("Please enter a prompt")
        return
      }

      if (!csvFile) {
        alert("Please upload a file")
        return
      }

      console.log(prompt, csvFile)

      setIsLoading(true)
      setDisplay(true)
      const res = await axios.post(`${url}/generate_sql`, {
        text: prompt,
        filePath: csvFile
      }, { responseType: 'blob' });

      if (res.status >= 500) {
        alert("Internal Server Error or prompt entered is not relevent to the file.")
        return
      }

      const reader = new FileReader();
      reader.onload = () => {
        const csvText = reader.result;

        Papa.parse(csvText, {
          complete: (results) => {
            setCsvData(results.data);
            setIsLoading(false)
          },
        });
      };
      reader.readAsText(res.data);
    } catch (error) {
      console.error('Error fetching CSV:', error);
      setIsLoading(false)
      setDisplay(false)
      setBadgeCount(0)
    }
  };

  const handleDownload = () => {
    if (!csvData || csvData.length === 0) {
      alert("No data available to download");
      return;
    }

    try {

      const csvString = Papa.unparse(csvData);
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = 'data.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating the download:", error);
    }
  };

  return (
    <div className="flex w-full h-full items-center justify-center flex-col py-10 px-10 gap-4">
      <div className="flex flex-col gap-3 mt-9 justify-center items-center">
        <h2 className="text-3xl font-bold">DuckDB Query Interface</h2>
        <div className="text-gray-500 text-lg">Analyze your data using natural language queries</div>
      </div>

      <div className="flex w-[70vw] items-center">
        <label className="inline-flex items-center cursor-pointer">
          <input type="checkbox" value="" className="sr-only peer" checked />
          <div className="relative w-11 h-6  rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-black"></div>
          <span className="ms-3 text-sm font-medium text-gray-900">Duck DB</span>
        </label>
      </div>

      <div className="rounded-xl w-[70vw] h-[50vh] flex p-5 shadow-lg shadow-slate-300 gap-2 flex-col mb-5">
        <h2 className="text-gray-500">Enter a query below, or try one of these samples:</h2>
        <div className="flex flex-row gap-2 mt-2 flex-wrap">
          <button className='flex items-center justify-center shadow-sm shadow-slate-300 rounded-lg py-1 px-2 gap-1 text-sm'
            onClick={() => customPrompt("Show me the top 5 customers by total orders")}>
            <ChartNoAxesColumnIncreasing size={18} />
            <span>
              Show me the top 5 customers by total orders
            </span>
          </button>
          <button className='flex items-center justify-center shadow-sm shadow-slate-300 rounded-lg py-1 px-2 gap-1 text-sm'
            onClick={() => customPrompt("Calculate average order value by country")}>
            <Users size={18} />
            <span>
              Calculate average order value by country
            </span>
          </button>
          <button className='flex items-center justify-center shadow-sm shadow-slate-300 rounded-lg py-1 px-2 gap-1 text-sm'
            onClick={() => customPrompt("List all orders from the past month")}>
            <Calendar size={18} />
            <span>
              List all orders from the past month
            </span>
          </button>
          <button className='flex items-center justify-center shadow-sm shadow-slate-300 rounded-lg py-1 px-2 gap-1 text-sm'
            onClick={() => customPrompt("Find customers who spent more than $1000")}>
            <DollarSign size={18} />
            <span>
              Find customers who spent more than $1000
            </span>
          </button>
        </div>
        <div className="flex flex-col h-full shadow-sm rounded-xl p-3 border-[1px] border-gray-300 mt-3">
          <textarea
            className="flex-1 placeholder-gray-500 focus:outline-none focus:ring-0 border-none bg-transparent"
            placeholder='Enter your natural language query...'
            onChange={(e) => setPrompt(e.target.value)}
            value={prompt}
          />
          <div className='flex flex-row'>
            <label className="flex items-center mx-2 cursor-pointer">
              <Paperclip size={18} />
              <input
                type="file"
                className="hidden"
                onChange={(e) => uploadFile(e.target.files[0])}
                accept=".csv,.txt"
              />
            </label>
            <div className="relative hover:border-2 border-black rounded-lg py-1">
              <button
                id="dropdownButton"
                onClick={handleDropdownToggle}
                className="mx-2 relative"
              >
                <Plus size={16} />

              </button>
              {badgeCount > 0 && (
                <div className="absolute inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-black border-2 border-white rounded-full top-0 right-0 transform translate-x-1/2 -translate-y-1/2 z-10 dark:border-gray-900">
                  {badgeCount}
                </div>
              )}
              {isDropdownOpen && (
                <div
                  id="dropdown"
                  className="absolute z-10 divide-y divide-gray-100 rounded-lg shadow w-44 mt-2 bg-white"
                >
                  <ul
                    className="py-2 text-sm"
                    aria-labelledby="dropdownButton"
                  >
                    <li>
                      <button
                        onClick={() => handleSelection("https://res.cloudinary.com/dn2filzyc/raw/upload/v1735426746/sales_data")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-300"
                      >
                        sales.csv
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleSelection("https://res.cloudinary.com/dn2filzyc/raw/upload/v1735426786/customer_data")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-300"
                      >
                        customer.csv
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <button className={`bg-black py-1 px-2 rounded-lg mx-2 ml-auto ${isLoading ? "bg-slate-400 cursor-not-allowed" : ""}`} onClick={generateSQL}><ArrowRight size={18} className='text-white' /></button>
          </div>
        </div>
      </div>

      {display && (
        <div className="rounded-xl w-[70vw] h-auto flex shadow-lg shadow-slate-300 flex-col mb-5">
          {isLoading ? <Skeleton /> :
            <>
              <div className="flex w-full items-center justify-between border-b p-5">
                <div className="font-bold">Query Results</div>
                <button className="border border-gray-300 rounded-md flex gap-2 py-1 px-2 text-sm hover:bg-gray-100 active:scale-95" onClick={handleDownload}>
                  <Download size={18} />
                  <span>Download CSV</span>
                </button>
              </div>
              <div className="overflow-auto h-[56vh] px-3">
                <table className="table-auto w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border-b px-4 py-3 text-left text-sm text-gray-400">INDEX</th>
                      {csvData && csvData.length > 0 && csvData[0].map((header, index) => (
                        <th
                          key={index}
                          className="border-b px-4 py-3 text-left text-sm text-gray-400"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData && csvData.slice(1, -1).map((row, rowIndex) => (
                      <tr key={rowIndex} className={`text-gray-400`}>
                        <td className=" px-4 py-2 text-sm text-gray-700">{rowIndex + 1}</td>
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className=" px-4 py-2 text-sm text-gray-700"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          }
        </div>
      )}
    </div>
  );
}

export default App;
