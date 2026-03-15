import { atomWithImmer } from "jotai/immer";
import { atomWithMachine } from "jotai/xstate";
const immerAtom = atomWithImmer(0);
const toggleMachineAtom = atomWithMachine(() => toggleMachine);
