import { atom } from "jotai";
//#region atoms.ts
const atoms = atom(0);
atoms.debugLabel = "atoms";
//#endregion
export { atoms as default };
