import _JSXStyle from "styled-jsx/style";
import styles from "./styles";
import { jsx, jsxs } from "react/jsx-runtime";
// virtual:entry.jsx
function App() {
	return /* @__PURE__ */ jsxs("div", {
		className: `jsx-${styles.__hash}`,
		children: [/* @__PURE__ */ jsx("button", {
			className: `jsx-${styles.__hash}`,
			children: "Click"
		}), /* @__PURE__ */ jsx(_JSXStyle, {
			id: styles.__hash,
			children: styles
		})]
	});
}
export { App as default };
