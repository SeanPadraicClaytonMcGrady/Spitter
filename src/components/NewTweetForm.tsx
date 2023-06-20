import { useSession } from "next-auth/react";
import Button from "./Button";
import { ProfileImage } from "./ProfileImage";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

function updateTextAreaSize(textArea?: HTMLTextAreaElement) {
  if (textArea == null) return;
  textArea.style.height = "0";
  textArea.style.height = `${textArea.scrollHeight}px`;
}

export default function NewTweetForm() {
  const session = useSession();
  const [inputValue, setInputValue] = useState<string>("");
  const textAreaRef = useRef<HTMLTextAreaElement>();
  const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
    updateTextAreaSize(textArea);
    textAreaRef.current = textArea;
  }, []);

  useLayoutEffect(() => {
    updateTextAreaSize(textAreaRef.current);
  });

  if (session.status !== "authenticated") return;

  return (
    <form className="flex flex-col gap-2 border-b px-4 py-2">
      <div className="flex gap-4">
        <ProfileImage src={session.data.user.image} />
        <textarea
          ref={inputRef}
          style={{ height: 0 }}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="What's happening?"
          className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none"
        />
      </div>
      <Button className="self-end">Spit</Button>
    </form>
  );
}
