import { atom } from "jotai";
//#region atoms.ts
const countAtom = atom(0);
countAtom.debugLabel = "countAtom";
const doubleAtom = atom((get) => get(countAtom) * 2);
doubleAtom.debugLabel = "doubleAtom";
//#endregion
