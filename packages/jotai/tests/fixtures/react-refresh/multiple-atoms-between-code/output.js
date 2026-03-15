import { atom } from "jotai";
//#region atoms.ts
globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
	cache: /* @__PURE__ */ new Map(),
	get(name, inst) {
		if (this.cache.has(name)) return this.cache.get(name);
		this.cache.set(name, inst);
		return inst;
	}
};
const countAtom = globalThis.jotaiAtomCache.get("atoms.ts/countAtom", atom(0));
globalThis.jotaiAtomCache.get("atoms.ts/doubleAtom", atom((get) => get(countAtom) * 2));
//#endregion
