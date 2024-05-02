import { Answer } from "./Answer";

export type Interview = {
  id: string;
  picture: string;
  datenschutzErklaerung: string;
  name: string;
  location: string;
  age: number;
  answers: Answer[];
};
