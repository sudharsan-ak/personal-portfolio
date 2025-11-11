import { useState } from "react";
import { Clock } from "lucide-react";
import TimelineModal from "./TimelineModal";

export default function TimelineButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
        title="View My Tech Journey"
      >
        <Clock className="w-6 h-6" />
      </button>

      {/* Modal */}
      {isOpen && <TimelineModal setIsOpen={setIsOpen} />}
    </>
  );
}
