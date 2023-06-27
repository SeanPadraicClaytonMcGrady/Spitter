import { useSession } from "next-auth/react";
import Button from "./Button";
import { ProfileImage } from "./ProfileImage";
import {
  FormEvent,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { api } from "~/utils/api";

function updateTextAreaSize(textArea?: HTMLTextAreaElement) {
  if (textArea == null) return;
  textArea.style.height = "0";
  textArea.style.height = `${textArea.scrollHeight}px`;
}

function Form() {
  const session = useSession();
  const [inputValue, setInputValue] = useState<string>("");
  const textAreaRef = useRef<HTMLTextAreaElement>();
  const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
    updateTextAreaSize(textArea);
    textAreaRef.current = textArea;
  }, []);
  const trpcUtils = api.useContext();

  useLayoutEffect(() => {
    updateTextAreaSize(textAreaRef.current);
  });

  const createSpit = api.spit.create.useMutation({
    onSuccess: (newSpit) => {
      setInputValue("");

      if (session.status !== "authenticated") {
        return;
      }

      trpcUtils.spit.infiniteFeed.setInfiniteData({}, (oldData) => {
        if (oldData == null || oldData.pages[0] == null) return;

        const newCachedSpit = {
          ...newSpit,
          likeCount: 0,
          likedByMe: false,
          user: {
            id: session.data.user.id,
            name: session.data.user.name || null,
            image: session.data.user.image || null,
          },
        };

        return {
          ...oldData,
          pages: [
            {
              ...oldData.pages[0],
              spits: [newCachedSpit, ...oldData.pages[0].spits],
            },
            ...oldData.pages.slice(1),
          ],
        };
      });
    },
  });

  if (session.status !== "authenticated") return;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    createSpit.mutate({ content: inputValue });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 border-b px-4 py-2"
    >
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

export default function NewSpitForm() {
  const session = useSession();
  if (session.status !== "authenticated") return null;

  return <Form />;
}
