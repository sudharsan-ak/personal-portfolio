import { useState } from "react";
import { PopupWidget } from "react-calendly";

export default function FloatingBookingButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-5 rounded-full shadow-lg transition-all duration-300"
      >
        Book a Meeting
      </button>

      {/* Calendly popup */}
      {open && (
        <PopupWidget
          url="https://calendly.com/sudharsanak1010"
          rootElement={document.getElementById("__next") || document.body}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
