import _JSXStyle from "styled-jsx/style";
import styles from "./styles2";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
var virtual_entry_default = ({ level = 1 }) => {
	return /* @__PURE__ */ jsxs(`h${level}`, {
		className: `jsx-${styles.__hash} root`,
		children: [/* @__PURE__ */ jsx("p", {
			className: `jsx-${styles.__hash}`,
			children: "dynamic element"
		}), /* @__PURE__ */ jsx(_JSXStyle, {
			id: styles.__hash,
			children: styles
		})]
	});
};
//#endregion
export { virtual_entry_default as default };
