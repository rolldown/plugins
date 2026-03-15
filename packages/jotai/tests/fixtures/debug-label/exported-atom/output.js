import { atom } from "jotai";
//#region atoms.ts
const countAtom = atom(0);
countAtom.debugLabel = "countAtom";
//#endregion
export { countAtom };
