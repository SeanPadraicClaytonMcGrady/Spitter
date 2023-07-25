import { useSession } from "next-auth/react";
import { IconHoverEffect } from "./IconHoverEffect";
import { ImTongue, ImTongue2 } from "react-icons/im";

type DislikeButtonProps = {
  onClick: () => void;
  isLoading: boolean;
  dislikedByMe: boolean;
  dislikeCount: number;
};

export function DislikeButton({
  isLoading,
  onClick,
  dislikedByMe,
  dislikeCount,
}: DislikeButtonProps) {
  const session = useSession();
  const DislikeIcon = dislikedByMe ? ImTongue2 : ImTongue;

  if (session.status !== "authenticated") {
    return (
      <div className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500">
        <DislikeIcon />
        <span>{dislikeCount}</span>
      </div>
    );
  }
  return (
    <button
      disabled={isLoading}
      onClick={onClick}
      className={`group -ml-2 flex items-center gap-1 self-start transition-colors duration-200 ${
        dislikedByMe
          ? "text-blue-500"
          : "text-gray-500 hover:text-blue-500 focus-visible:text-blue-500"
      }`}
    >
      <IconHoverEffect red>
        <DislikeIcon
          className={`transition-colors duration-200 ${
            dislikedByMe
              ? "fill-blue-500"
              : "fill-gray-500 group-hover:fill-blue-500 group-focus-visible:fill-blue-500"
          }`}
        />
      </IconHoverEffect>
      <span>{dislikeCount}</span>
    </button>
  );
}
