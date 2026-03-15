import { atomWithImmer } from "jotai/immer";
import { atomWithMachine } from "jotai/xstate";
//#region atoms.ts
globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
	cache: /* @__PURE__ */ new Map(),
	get(name, inst) {
		if (this.cache.has(name)) return this.cache.get(name);
		this.cache.set(name, inst);
		return inst;
	}
};
globalThis.jotaiAtomCache.get("atoms.ts/immerAtom", atomWithImmer(0));
globalThis.jotaiAtomCache.get("atoms.ts/toggleMachineAtom", atomWithMachine(() => toggleMachine));
//#endregion
