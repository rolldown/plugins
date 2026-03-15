import { atom } from "jotai";
//#region src/atoms/countAtom.ts
const countAtom = atom(0);
countAtom.debugLabel = "countAtom";
//#endregion
export { countAtom as default };
