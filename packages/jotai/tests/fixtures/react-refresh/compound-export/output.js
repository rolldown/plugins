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
const one = globalThis.jotaiAtomCache.get("atoms.ts/one", atom(1));
const two = globalThis.jotaiAtomCache.get("atoms.ts/two", atom(2));
//#endregion
export { one, two };
