import { atom, useAtom } from "jotai";
import { jsx, jsxs } from "react/jsx-runtime";
//#region atoms.jsx
const countAtom = atom(0);
countAtom.debugLabel = "countAtom";
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
