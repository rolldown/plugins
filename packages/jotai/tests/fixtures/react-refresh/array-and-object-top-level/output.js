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
globalThis.jotaiAtomCache.get("atoms.ts/arr.0", atom(3)), globalThis.jotaiAtomCache.get("atoms.ts/arr.1", atom(4));
globalThis.jotaiAtomCache.get("atoms.ts/obj.five", atom(5)), globalThis.jotaiAtomCache.get("atoms.ts/obj.six", atom(6));
//#endregion
