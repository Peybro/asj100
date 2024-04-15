import { Answer } from "./Answer";

export type Interview = {
  id: string;
  picture: string;
  name: string;
  age: number;
  answers: Answer[];
};
