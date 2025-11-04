import { Fragment } from "react";

export default function Toast({ message, type = "success", onClose }) {
  return (
    <div
      className={`fixed top-5 right-5 max-w-sm w-full z-50 border-l-4 p-4 shadow-lg flex items-center gap-3 ${
        type === "success"
          ? "bg-green-50 border-green-400"
          : "bg-red-50 border-red-400"
      }`}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        {type === "success" ? (
          <svg
            className="h-6 w-6 text-green-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg
            className="h-6 w-6 text-red-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>

      {/* Message */}
      <div className="flex-1 text-xl text-gray-700">{message}</div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="ml-2 text-gray-400  hover:text-gray-600 font-bold text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}
