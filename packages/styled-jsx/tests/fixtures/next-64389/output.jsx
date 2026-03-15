"use client";
import _JSXStyle from "styled-jsx/style";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
const color = "color: red;";
function RootLayout({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		className: "jsx-61c3a661b73d0c69",
		children: [
			/* @__PURE__ */ jsx("head", { className: "jsx-61c3a661b73d0c69" }),
			/* @__PURE__ */ jsx("body", {
				className: "jsx-61c3a661b73d0c69",
				children
			}),
			/* @__PURE__ */ jsx(_JSXStyle, {
				id: "61c3a661b73d0c69",
				children: `body{${color}}body p{font-size:72px}`
			})
		]
	});
}
//#endregion
export { RootLayout as default };
