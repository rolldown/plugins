import _JSXStyle from "styled-jsx/style";
import styles, { foo } from "./styles";
import { jsx, jsxs } from "react/jsx-runtime";
//#endregion
//#region virtual:entry.jsx
const styles2 = (/* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, { get: (a, b) => (typeof require !== "undefined" ? require : a)[b] }) : x)(function(x) {
	if (typeof require !== "undefined") return require.apply(this, arguments);
	throw Error("Calling `require` for \"" + x + "\" in an environment that doesn't expose the `require` function. See https://rolldown.rs/in-depth/bundling-cjs#require-external-modules for more details.");
}))("./styles2");
var virtual_entry_default = () => /* @__PURE__ */ jsxs("div", { children: [
	/* @__PURE__ */ jsx("p", { children: "test" }),
	/* @__PURE__ */ jsx("div", { children: "woot" }),
	/* @__PURE__ */ jsx("p", { children: "woot" }),
	/* @__PURE__ */ jsx(_JSXStyle, {
		id: styles2.__hash,
		children: styles2
	}),
	/* @__PURE__ */ jsx(_JSXStyle, {
		id: foo.__hash,
		children: foo
	}),
	/* @__PURE__ */ jsx(_JSXStyle, {
		id: styles.__hash,
		children: styles
	})
] });
//#endregion
export { virtual_entry_default as default };
