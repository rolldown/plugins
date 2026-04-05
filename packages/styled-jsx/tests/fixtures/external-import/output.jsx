import _JSXStyle from "styled-jsx/style";
import { buttonStyles } from "./styles";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
function App() {
	return /* @__PURE__ */ jsxs("div", {
		className: `jsx-${buttonStyles.__hash}`,
		children: [/* @__PURE__ */ jsx("button", {
			className: `jsx-${buttonStyles.__hash}`,
			children: "Click"
		}), /* @__PURE__ */ jsx(_JSXStyle, {
			id: buttonStyles.__hash,
			children: buttonStyles
		})]
	});
}
//#endregion
export { App as default };
