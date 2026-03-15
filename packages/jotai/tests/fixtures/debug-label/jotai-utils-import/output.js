import { atomWithImmer } from "jotai/immer";
import { atomWithMachine } from "jotai/xstate";
//#region atoms.ts
const immerAtom = atomWithImmer(0);
immerAtom.debugLabel = "immerAtom";
const toggleMachineAtom = atomWithMachine(() => toggleMachine);
toggleMachineAtom.debugLabel = "toggleMachineAtom";
//#endregion
