import { atom } from "jotai";
const countAtom = atom(0);
let counter = 0;
const increment = () => ++counter;
const doubleAtom = atom((get) => get(countAtom) * 2);
