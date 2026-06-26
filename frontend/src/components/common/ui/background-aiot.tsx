import React from 'react';
export function BackgroundAiot() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center p-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-20">
        <svg
          width="60"
          height="40"
          viewBox="0 0 60 40"
          className="text-blue-300"
        >
          <path
            d="M5 20C5 10 15 5 25 10C35 5 45 10 45 20"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M10 30C10 25 20 22 30 25C40 22 50 25 50 30"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
          />
        </svg>
      </div>

      <div className="absolute top-10 right-40">
        <div className="w-16 h-16 bg-yellow-200 rounded-full opacity-60"></div>
      </div>

      <div className="absolute bottom-20 left-10">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          className="text-blue-200"
        >
          <circle
            cx="20"
            cy="20"
            r="15"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx="20"
            cy="20"
            r="8"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>

      {/* Main content */}
      <div className="text-center max-w-2xl z-10">
        {/* Logo */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="flex">
                <span className="text-3xl font-bold text-blue-600">A</span>
                <span className="text-3xl font-bold text-red-500">I</span>
                <span className="text-3xl font-bold text-yellow-500">O</span>
                <span className="text-3xl font-bold text-green-500">T</span>
              </div>
              <span className="text-2xl font-semibold text-gray-700">
                AIOT INC
              </span>
            </div>
          </div>
          <p className="text-gray-600">AIoT株式会社</p>
        </div>

        {/* Main heading */}
        <h1 className="text-6xl font-black text-red-500 mb-6 leading-tight">
          GROWING SMARTER, HAPPIER
          <br />
          <span className="text-red-600">TOGETHER</span>
        </h1>

        {/* Subheading */}
        <p className="text-2xl text-yellow-600 font-medium mb-12">
          Build system fast, reliability with reasonable cost.
        </p>

        {/* Contact buttons */}
        <div className="flex justify-center space-x-6">
          <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors">
            +81-03-4500-6968
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors">
            aiot-global.com
          </button>
        </div>
      </div>
    </div>
  );
}
