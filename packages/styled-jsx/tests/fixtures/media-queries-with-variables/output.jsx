import _JSXStyle from "styled-jsx/style";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
function Component() {
	const ResponsiveBreakpoint = {
		mobile: "768px",
		tablet: "1024px",
		desktop: "1440px"
	};
	const breakpoint = "mobile";
	const mobileWidth = 320;
	return /* @__PURE__ */ jsxs("div", {
		className: _JSXStyle.dynamic([["aeabfe9c620ccc2e", [ResponsiveBreakpoint[breakpoint], mobileWidth]]]) + " component",
		children: [/* @__PURE__ */ jsx("div", {
			className: _JSXStyle.dynamic([["aeabfe9c620ccc2e", [ResponsiveBreakpoint[breakpoint], mobileWidth]]]) + " active",
			children: "Responsive Element"
		}), /* @__PURE__ */ jsx(_JSXStyle, {
			id: "aeabfe9c620ccc2e",
			dynamic: [ResponsiveBreakpoint[breakpoint], mobileWidth],
			children: `.component.__jsx-style-dynamic-selector{width:100%}@media (max-width:${ResponsiveBreakpoint[breakpoint]}){.component.__jsx-style-dynamic-selector{width:${mobileWidth}px}.component.active.__jsx-style-dynamic-selector{color:#00f}.component.__jsx-style-dynamic-selector div.__jsx-style-dynamic-selector{display:block}}`
		})]
	});
}
//#endregion
export { Component as default };
