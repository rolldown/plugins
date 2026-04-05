import _JSXStyle from "styled-jsx/style";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
const buttonStyles = /* @__PURE__ */ new String("button.jsx-71a07331e660d371{color:red;padding:10px}");
buttonStyles.__hash = "71a07331e660d371";
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
