import _JSXStyle from "styled-jsx/style";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
function Component() {
	return /* @__PURE__ */ jsxs("div", {
		className: "jsx-f5c0bd4223033404 wrapper",
		children: [/* @__PURE__ */ jsx("div", {
			className: "jsx-f5c0bd4223033404 animated",
			children: "Animated Element"
		}), /* @__PURE__ */ jsx(_JSXStyle, {
			id: "f5c0bd4223033404",
			children: `@keyframes customAnimation{0%{opacity:0;transform:scale(0)}50%{opacity:0.5;transform:rotate(180deg)}to{opacity:1;transform:scale(1)}}.wrapper.jsx-f5c0bd4223033404 .animated.jsx-f5c0bd4223033404{animation:customAnimation 1000ms ease-in-out forwards;animation-delay:200ms}`
		})]
	});
}
//#endregion
export { Component as default };
