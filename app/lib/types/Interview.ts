import { Answer } from "./Answer";

export type Interview = {
  id: string;
  picture: string;
  name: string;
  email: string;
  location: string;
  age: number;
  answers: Answer[];
};
