"use client";

import Image from "next/image";

type ButtonProps = {
  type: "button" | "submit";
  title: string;
  icon?: string;
  variant: string;
  full?: boolean;
  onClick?: () => void;
  showDownloadNotice?: boolean;
};

const Button = ({ type, title, icon, variant, full, onClick, showDownloadNotice }: ButtonProps) => {
	const handleClick = () => {
		if (showDownloadNotice) {
			// Inform the user this is a demo and direct them to TrekMate AI
			alert("This site is a demo. Mobile apps are coming soon. Try TrekMate AI now using the chat in the corner.");
			// Ask the floating chat to open
			if (typeof window !== "undefined") {
				window.dispatchEvent(new CustomEvent("open-chat"));
			}
		}
		if (onClick) onClick();
	};
  return (
    <button
      className={`flexCenter gap-3 rounded-full border ${variant} ${
        full && "w-full"
      }`}
      type={type}
			onClick={handleClick}
    >
      {icon && <Image src={icon} alt={title} width={24} height={24} />}
      <label className="bold-16 whitespace-nowrap cursor-pointer">
        {title}
      </label>
    </button>
  );
};

export default Button;
