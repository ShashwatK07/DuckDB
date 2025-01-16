import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const renderChart = () => {
    const chartData = processedData.map(row => {
        const chartRow: Record<string, any> = { ...row };
        for (const [key, value] of Object.entries(row)) {
            if (typeof value === 'string' && value.match(/^\d{2}-\d{2}-\d{4}$/)) {
                chartRow[key] = new Date(value.split('-').reverse().join('-')).getTime();
            }
        }
        return chartRow;
    });

    const commonProps = {
        width: 800,
        height: 400,
        margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    const chartTheme = {
        backgroundColor: 'transparent',
        textColor: 'text-gray-600 dark:text-gray-300'
    };

    switch (selectedChart) {
        case 'line':
            return (
                <LineChart {...commonProps} data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey={columns[0]} stroke="#9CA3AF" tickFormatter={(value) => typeof value === 'number' ? formatDate(value) : value} />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
                        labelStyle={{ color: '#E5E7EB' }}
                        itemStyle={{ color: '#E5E7EB' }}
                        labelFormatter={(value) => typeof value === 'number' ? formatDate(value) : value}
                    />
                    <Legend wrapperStyle={{ color: '#E5E7EB' }} />
                    {numericColumns.map((col, i) => (
                        <Line key={col} type="monotone" dataKey={col} stroke={COLORS[i % COLORS.length]} />
                    ))}
                </LineChart>
            );
        case 'bar':
            return (
                <BarChart {...commonProps} data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey={columns[0]} stroke="#9CA3AF" tickFormatter={(value) => typeof value === 'number' ? formatDate(value) : value} />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
                        labelStyle={{ color: '#E5E7EB' }}
                        itemStyle={{ color: '#E5E7EB' }}
                        labelFormatter={(value) => typeof value === 'number' ? formatDate(value) : value}
                    />
                    <Legend wrapperStyle={{ color: '#E5E7EB' }} />
                    {numericColumns.map((col, i) => (
                        <Bar key={col} dataKey={col} fill={COLORS[i % COLORS.length]} />
                    ))}
                </BarChart>
            );
        case 'area':
            return (
                <AreaChart {...commonProps} data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey={columns[0]} stroke="#9CA3AF" tickFormatter={(value) => typeof value === 'number' ? formatDate(value) : value} />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
                        labelStyle={{ color: '#E5E7EB' }}
                        itemStyle={{ color: '#E5E7EB' }}
                        labelFormatter={(value) => typeof value === 'number' ? formatDate(value) : value}
                    />
                    <Legend wrapperStyle={{ color: '#E5E7EB' }} />
                    {numericColumns.map((col, i) => (
                        <Area key={col} type="monotone" dataKey={col} fill={COLORS[i % COLORS.length]} stroke={COLORS[i % COLORS.length]} />
                    ))}
                </AreaChart>
            );
        case 'scatter':
            return (
                <ScatterChart {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey={numericColumns[0]} name={numericColumns[0]} stroke="#9CA3AF" />
                    <YAxis dataKey={numericColumns[1]} name={numericColumns[1]} stroke="#9CA3AF" />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
                        labelStyle={{ color: '#E5E7EB' }}
                        itemStyle={{ color: '#E5E7EB' }}
                        cursor={{ strokeDasharray: '3 3' }}
                    />
                    <Legend wrapperStyle={{ color: '#E5E7EB' }} />
                    <Scatter name="Data Points" data={chartData} fill="#8884d8" />
                </ScatterChart>
            );
        case 'pie':
            return (
                <PieChart {...commonProps}>
                    <Pie
                        data={chartData}
                        cx={400}
                        cy={200}
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey={numericColumns[0]}
                        nameKey={columns[0]}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={cell - ${index}} fill={COLORS[index % COLORS.length]} />
              ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
                        labelStyle={{ color: '#E5E7EB' }}
                        itemStyle={{ color: '#E5E7EB' }}
                    />
                    <Legend wrapperStyle={{ color: '#E5E7EB' }} />
                </PieChart>
            );
        default:
            return null;
    }
};