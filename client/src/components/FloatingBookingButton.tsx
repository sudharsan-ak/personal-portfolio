import { PopupButton } from "react-calendly";

export default function FloatingBookingButton() {
  return (
    <div className="fixed top-6 right-6 z-50">
      <PopupButton
        url="https://calendly.com/sudharsanak1010" // <-- Replace with your actual Calendly link
        rootElement={document.getElementById("__next") || document.body}
        text=""
        className="
          p-3 
          bg-primary 
          text-primary-foreground 
          rounded-full 
          shadow-lg 
          hover:scale-110 
          transition-transform 
          duration-300 
          flex items-center justify-center
        "
      >
        {/* Calendar Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
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
