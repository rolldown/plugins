import _JSXStyle from "styled-jsx/style";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
function Component() {
	const id = "theme-1";
	const cssVariables = {
		"--primary-color": "#0070f3",
		"--secondary-color": "#ff0080"
	};
	const stringifyCssVariablesObject = (obj) => {
		return Object.entries(obj).map(([key, value]) => `${key}: ${value};`).join("\n");
	};
	const buttonColor = "var(--primary-color)";
	const backgroundColor = "#f0f0f0";
	return /* @__PURE__ */ jsxs("div", {
		className: _JSXStyle.dynamic([["b04afa7140b37fe4", [
			id,
			stringifyCssVariablesObject(cssVariables),
			buttonColor,
			backgroundColor
		]]]) + ` scope-${id}`,
		children: [
			/* @__PURE__ */ jsx("button", {
				className: _JSXStyle.dynamic([["b04afa7140b37fe4", [
					id,
					stringifyCssVariablesObject(cssVariables),
					buttonColor,
					backgroundColor
				]]]),
				children: "Global Styled Button"
			}),
			/* @__PURE__ */ jsx("div", {
				className: _JSXStyle.dynamic([["b04afa7140b37fe4", [
					id,
					stringifyCssVariablesObject(cssVariables),
					buttonColor,
					backgroundColor
				]]]),
				children: "Styled Div"
			}),
			/* @__PURE__ */ jsx(_JSXStyle, {
				id: "b04afa7140b37fe4",
				dynamic: [
					id,
					stringifyCssVariablesObject(cssVariables),
					buttonColor,
					backgroundColor
				],
				children: `.scope-${id}{${stringifyCssVariablesObject(cssVariables)}}.scope-${id} button{color:${buttonColor}}.scope-${id} div{background-color:${backgroundColor}}`
			})
		]
	});
}
//#endregion
export { Component as default };
