import { atom } from "jotai";
//#region countAtom.ts
const countAtom = atom(0);
countAtom.debugLabel = "countAtom";
//#endregion
export { countAtom as default };
