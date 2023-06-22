import { Like } from "@prisma/client";

export type Spit = {
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  likes: Like[];
  _count: {
    likes: number;
  };
  id: string;
  content: string;
  creationTime: Date;
};
