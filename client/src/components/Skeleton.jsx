import React from 'react'

const Skeleton = () => {
    return (
        <main
            role="status"
            className="flex-1 flex flex-col justify-center items-center animate-pulse bg-gray-50 dark:bg-gray-800"
        >
            <div className="w-3/4 max-w-md">
                <div className="h-6 bg-gray-200 rounded-lg dark:bg-gray-700 w-full mb-4"></div>
                <div className="h-6 bg-gray-200 rounded-lg dark:bg-gray-700 w-full mb-4"></div>
                <div className="h-6 bg-gray-200 rounded-lg dark:bg-gray-700 w-full mb-4"></div>
                <div className="h-6 bg-gray-200 rounded-lg dark:bg-gray-700 w-full mb-4"></div>
                <div className="h-6 bg-gray-200 rounded-lg dark:bg-gray-700 w-full"></div>
            </div>
            <span className="sr-only">Loading...</span>
        </main>
    );
};

export default Skeleton;
