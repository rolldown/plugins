import _JSXStyle from "styled-jsx/style";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
const attrs = { id: "test" };
const Test1 = () => /* @__PURE__ */ jsxs("div", {
	className: "jsx-775a8a7a8a08c4e8",
	children: [
		/* @__PURE__ */ jsx("span", {
			...attrs,
			"data-test": "test",
			className: "jsx-775a8a7a8a08c4e8 " + (attrs && attrs.className != null && attrs.className || ""),
			children: "test"
		}),
		/* @__PURE__ */ jsx(Component, {}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: "775a8a7a8a08c4e8",
			children: "span.jsx-775a8a7a8a08c4e8{color:red}"
		})
	]
});
const Test2 = () => /* @__PURE__ */ jsx("span", { children: "test" });
const Test3 = () => /* @__PURE__ */ jsxs("div", {
	className: "jsx-775a8a7a8a08c4e8",
	children: [/* @__PURE__ */ jsx("span", {
		className: "jsx-775a8a7a8a08c4e8",
		children: "test"
	}), /* @__PURE__ */ jsx(_JSXStyle, {
		id: "775a8a7a8a08c4e8",
		children: "span.jsx-775a8a7a8a08c4e8{color:red}"
	})]
});
var virtual_entry_default = class {
	render() {
		return /* @__PURE__ */ jsxs("div", {
			className: "jsx-b485c50475c9486c",
			children: [/* @__PURE__ */ jsx("p", {
				className: "jsx-b485c50475c9486c",
				children: "test"
			}), /* @__PURE__ */ jsx(_JSXStyle, {
				id: "b485c50475c9486c",
				children: "p.jsx-b485c50475c9486c{color:red}"
			})]
		});
	}
};
//#endregion
export { Test1, Test2, Test3, virtual_entry_default as default };
