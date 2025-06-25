import { Answer } from "./Answer";

export type Interview = {
  id: string;
  name?: string;
  answers: Answer[];
};
