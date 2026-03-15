import { jsx, jsxs } from "react/jsx-runtime";
import { atom, useAtom } from "jotai";
//#region atoms.jsx
globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
	cache: /* @__PURE__ */ new Map(),
	get(name, inst) {
		if (this.cache.has(name)) return this.cache.get(name);
		this.cache.set(name, inst);
		return inst;
	}
};
const countAtom = globalThis.jotaiAtomCache.get("atoms.jsx/countAtom", atom(0));
function AboutPage() {
	const [count, setCount] = useAtom(countAtom);
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("div", { children: "About us" }),
		count,
		" ",
		/* @__PURE__ */ jsx("button", {
			onClick: () => setCount((c) => c + 1),
			children: "+1"
		})
	] });
}
//#endregion
export { AboutPage as default };
