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
function createAtom(ov) {
	const valueAtom = atom(ov);
	return atom((get) => {
		return get(valueAtom);
	}, (_get, set, nextValue) => {
		set(valueAtom, nextValue);
	});
}
createAtom("Hello String!");
globalThis.jotaiAtomCache.get("atoms.ts/countAtom", atom(0));
//#endregion
