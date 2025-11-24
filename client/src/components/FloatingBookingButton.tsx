import { PopupButton } from "react-calendly";
import { useRef } from "react";
import { Calendar } from "lucide-react";

export default function FloatingBookingButton() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={wrapperRef} className="fixed bottom-6 right-6 z-50">
      {/* Hidden PopupButton */}
      <div className="absolute opacity-0 w-0 h-0 overflow-hidden pointer-events-none">
        <PopupButton
          url="https://calendly.com/sudharsanak1010"
          rootElement={document.getElementById("__next") || document.body}
          text="Book Meeting"
        />
      </div>
      
      {/* Custom Button - styled like TimelineButton */}
      <button
        onClick={() => {
          const popupButton = wrapperRef.current?.querySelector('button') as HTMLButtonElement;
          popupButton?.click();
        }}
        className="p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
        title="Schedule a meeting"
      >
        <Calendar className="w-5 h-5" />
      </button>
    </div>
  );
}
