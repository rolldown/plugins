import _JSXStyle from "styled-jsx/style";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
function Component() {
	return /* @__PURE__ */ jsxs("div", {
		className: "jsx-e542efffb0da4acc parent",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "jsx-e542efffb0da4acc child",
				children: "Nested Selectors Test"
			}),
			/* @__PURE__ */ jsx("h1", {
				className: "jsx-e542efffb0da4acc",
				children: "Heading"
			}),
			/* @__PURE__ */ jsx(_JSXStyle, {
				id: "e542efffb0da4acc",
				children: ".parent.jsx-e542efffb0da4acc{position:relative}.parent.jsx-e542efffb0da4acc:hover{background-color:red}.parent.jsx-e542efffb0da4acc .child.jsx-e542efffb0da4acc{margin-top:10px}.parent.jsx-e542efffb0da4acc div.jsx-e542efffb0da4acc{padding:15px}.parent.jsx-e542efffb0da4acc h1.jsx-e542efffb0da4acc{font-size:24px}"
			})
		]
	});
}
//#endregion
export { Component as default };
