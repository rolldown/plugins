import _JSXStyle from "styled-jsx/style";
import { jsx } from "react/jsx-runtime";
//#region virtual:entry.jsx
function NavigationItem({ active, className }) {
	return /* @__PURE__ */ jsx("span", {
		className: "jsx-ef555c6982df9e5b " + (cn({ active }, className, "navigation-item") || ""),
		children: /* @__PURE__ */ jsx(_JSXStyle, {
			id: "ef555c6982df9e5b",
			children: ".navigation-item.jsx-ef555c6982df9e5b a:after{content:attr(data-text);content:attr(data-text) / \"\"}"
		})
	});
}
//#endregion
export { NavigationItem as default };
