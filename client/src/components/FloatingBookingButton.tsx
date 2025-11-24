import { PopupButton } from "react-calendly";

export default function FloatingBookingButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <PopupButton
        url="https://calendly.com/your-username" // <-- Replace with your Calendly link
        rootElement={document.getElementById("__next") || document.body}
        text=""
        className="
          flex items-center justify-center
          w-14 h-14
          rounded-full
          bg-blue-600 
          hover:bg-blue-700
          dark:bg-blue-500 
          dark:hover:bg-blue-600
          shadow-lg
          cursor-pointer
          transition-all duration-200
        "
      >
        {/* Calendar Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 
               002-2V7a2 2 0 00-2-2H5a2 2 0 
               00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </PopupButton>
    </div>
  );
}
