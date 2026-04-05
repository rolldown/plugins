import _JSXStyle from "styled-jsx/style";
import styles, { foo } from "./styles";
import { jsx, jsxs } from "react/jsx-runtime";
//#endregion
//#region virtual:entry.jsx
const styles2 = (/* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, { get: (a, b) => (typeof require !== "undefined" ? require : a)[b] }) : x)(function(x) {
	if (typeof require !== "undefined") return require.apply(this, arguments);
	throw Error("Calling `require` for \"" + x + "\" in an environment that doesn't expose the `require` function. See https://rolldown.rs/in-depth/bundling-cjs#require-external-modules for more details.");
}))("./styles2");
var virtual_entry_default = () => /* @__PURE__ */ jsxs("div", {
	className: `jsx-801ecab075d7a5d0 jsx-${styles.__hash} jsx-${foo.__hash}`,
	children: [
		/* @__PURE__ */ jsx("p", {
			className: `jsx-801ecab075d7a5d0 jsx-${styles.__hash} jsx-${foo.__hash} foo`,
			children: "test"
		}),
		/* @__PURE__ */ jsx("p", {
			className: `jsx-801ecab075d7a5d0 jsx-${styles.__hash} jsx-${foo.__hash}`,
			children: "woot"
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: styles2.__hash,
			children: styles2
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: foo.__hash,
			children: foo
		}),
		/* @__PURE__ */ jsx("div", {
			className: `jsx-801ecab075d7a5d0 jsx-${styles.__hash} jsx-${foo.__hash}`,
			children: "woot"
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: "801ecab075d7a5d0",
			children: "p.jsx-801ecab075d7a5d0{color:red}div.jsx-801ecab075d7a5d0{color:green}"
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: styles.__hash,
			children: styles
		})
	]
});
const Test = () => /* @__PURE__ */ jsxs("div", {
	className: `jsx-801ecab075d7a5d0 jsx-${foo.__hash}`,
	children: [
		/* @__PURE__ */ jsx("p", {
			className: `jsx-801ecab075d7a5d0 jsx-${foo.__hash} foo`,
			children: "test"
		}),
		/* @__PURE__ */ jsx("p", {
			className: `jsx-801ecab075d7a5d0 jsx-${foo.__hash}`,
			children: "woot"
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: foo.__hash,
			children: foo
		}),
		/* @__PURE__ */ jsx("div", {
			className: `jsx-801ecab075d7a5d0 jsx-${foo.__hash}`,
			children: "woot"
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: "801ecab075d7a5d0",
			children: "p.jsx-801ecab075d7a5d0{color:red}div.jsx-801ecab075d7a5d0{color:green}"
		})
	]
});
//#endregion
export { Test, virtual_entry_default as default };
