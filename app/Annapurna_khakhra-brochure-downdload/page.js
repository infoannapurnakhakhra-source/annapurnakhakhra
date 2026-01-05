"use client";

import React, { useState } from "react";

const BrochureDownloadPage = () => {
  const [showToast, setShowToast] = useState(false);

  const downloadBrochure = () => {
    const pdfUrl = "/Annapurna%20khakhra%20brochure.pdf"; // from /public

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "Annapurna khakhra brochure.pdf";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 via-white to-yellow-50 min-h-screen flex items-center justify-center p-4">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .download-btn {
          position: relative;
          overflow: hidden;
        }

        .download-btn::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .download-btn:hover::before {
          width: 300px;
          height: 300px;
        }
      `}</style>

      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
          <div className="grid md:grid-cols-2 gap-0">

            {/* Left Section */}
            <div className="bg-gradient-to-br from-[#7d4b0e] to-[#a0682a] p-8 md:p-12 flex flex-col justify-center items-center text-white">
              <div className="animate-float mb-6">
                <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-3 text-center">Annapurna khakhra Brochure</h2>
              <p className="text-blue-100 text-center text-sm">
                Download our comprehensive brochure to learn more about our products and prices
              </p>
            </div>

            {/* Right Section */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Get Your Brochure</h3>
              <p className="text-gray-600 text-sm mb-6">
                Click the button below to download the brochure instantly
              </p>

              <button
                onClick={downloadBrochure}
                className="download-btn w-full bg-gradient-to-br from-[#7d4b0e] to-[#a0682a] text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Brochure
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div
        className={`fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-transform duration-300 ${
          showToast ? "translate-x-0" : "translate-x-[calc(100%+1rem)]"
        }`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Brochure downloaded successfully!</span>
      </div>
    </div>
  );
};

export default BrochureDownloadPage;
