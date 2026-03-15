import { atom } from "jotai";
export const countAtom = atom(0);
export const doubleAtom = atom((get) => get(countAtom) * 2);
