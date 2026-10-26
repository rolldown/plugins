import _JSXStyle from "styled-jsx/style";
import styles from "./styles";
import { jsx, jsxs } from "react/jsx-runtime";
// virtual:entry.jsx
var virtual_entry_default = () => /* @__PURE__ */ jsxs("div", {
	className: `jsx-${styles.__hash}`,
	children: [/* @__PURE__ */ jsx("p", {
		className: `jsx-${styles.__hash}`,
		children: "test"
	}), /* @__PURE__ */ jsx(_JSXStyle, {
		id: styles.__hash,
		children: styles
	})]
});
export { virtual_entry_default as default };
