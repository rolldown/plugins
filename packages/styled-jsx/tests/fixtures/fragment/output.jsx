import _JSXStyle from "styled-jsx/style";
import React from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
var virtual_entry_default = () => /* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("p", {
		className: "jsx-9da872362bca41c1",
		children: "Testing!!!"
	}),
	/* @__PURE__ */ jsx("p", {
		className: "jsx-9da872362bca41c1 foo",
		children: "Bar"
	}),
	/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("h3", {
		id: "head",
		className: "jsx-9da872362bca41c1",
		children: "Title..."
	}), /* @__PURE__ */ jsxs(React.Fragment, { children: [
		/* @__PURE__ */ jsx("p", {
			className: "jsx-9da872362bca41c1",
			children: "hello"
		}),
		/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("p", {
			className: "jsx-9da872362bca41c1",
			children: "foo"
		}), /* @__PURE__ */ jsx("p", {
			className: "jsx-9da872362bca41c1",
			children: "bar"
		})] }),
		/* @__PURE__ */ jsx("p", {
			className: "jsx-9da872362bca41c1",
			children: "world"
		})
	] })] }),
	/* @__PURE__ */ jsx(_JSXStyle, {
		id: "9da872362bca41c1",
		children: "p.jsx-9da872362bca41c1{color:#0ff}.foo.jsx-9da872362bca41c1{color:#ff69b4;font-size:18px}#head.jsx-9da872362bca41c1{text-decoration:underline}"
	})
] });
function Component1() {
	return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("div", { children: "test" }) });
}
function Component2() {
	return /* @__PURE__ */ jsx("div", {
		className: "jsx-e591a16799b896aa",
		children: /* @__PURE__ */ jsx(_JSXStyle, {
			id: "e591a16799b896aa",
			children: "div.jsx-e591a16799b896aa{color:red}"
		})
	});
}
//#endregion
export { Component1, Component2, virtual_entry_default as default };
