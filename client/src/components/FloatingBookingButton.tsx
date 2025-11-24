import { PopupButton } from "react-calendly";

export default function FloatingBookingButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50">

      <PopupButton
        url="https://calendly.com/sudharsanak1010"  // <-- Replace this
        rootElement={document.getElementById("__next") || document.body}
        text=""
        className="
          group
          relative
          flex items-center justify-center
          w-16 h-16
          rounded-full
          cursor-pointer
          transition-all duration-300
        "
      >

        {/* Glowing gradient effect */}
        <span
          className="
            absolute inset-0
            rounded-full
            bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500
            opacity-80
            blur-xl
            group-hover:blur-2xl
            group-hover:opacity-100
            transition-all
            duration-500
            animate-pulse
            dark:opacity-60
          "
        ></span>

        {/* Inner button */}
        <span
          className="
            relative
            flex items-center justify-center
            w-full h-full
            rounded-full
            bg-white text-blue-700
            dark:bg-gray-900 dark:text-blue-300
            shadow-xl
            transition-all duration-300
            group-hover:scale-110
            group-hover:shadow-2xl
          "
        >
          {/* Calendar Icon */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-7 w-7'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 
                 002-2V7a2 2 0 00-2-2H5a2 2 0 
                 00-2 2v12a2 2 0 002 2z'
            />
          </svg>
        </span>

      </PopupButton>

    </div>
  );
}
