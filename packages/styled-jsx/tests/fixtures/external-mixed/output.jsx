import _JSXStyle from "styled-jsx/style";
import { externalStyles } from "./styles";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
function App() {
	return /* @__PURE__ */ jsxs("div", {
		className: `jsx-ea672cdc862d9536 jsx-${externalStyles.__hash}`,
		children: [
			/* @__PURE__ */ jsx("p", {
				className: `jsx-ea672cdc862d9536 jsx-${externalStyles.__hash}`,
				children: "Hello"
			}),
			/* @__PURE__ */ jsx(_JSXStyle, {
				id: "ea672cdc862d9536",
				children: "p.jsx-ea672cdc862d9536{color:red}"
			}),
			/* @__PURE__ */ jsx(_JSXStyle, {
				id: externalStyles.__hash,
				children: externalStyles
			})
		]
	});
}
//#endregion
export { App as default };
