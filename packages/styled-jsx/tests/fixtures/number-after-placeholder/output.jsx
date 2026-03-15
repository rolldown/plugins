import _JSXStyle from "styled-jsx/style";
import Link from "next/link";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
function IndexPage() {
	return /* @__PURE__ */ jsxs("div", {
		className: "jsx-38aea2b98e40317a",
		children: [
			"Hello World.",
			" ",
			/* @__PURE__ */ jsx(Link, {
				href: "/about",
				children: /* @__PURE__ */ jsx("a", {
					className: "jsx-38aea2b98e40317a",
					children: "Abound"
				})
			}),
			/* @__PURE__ */ jsx(_JSXStyle, {
				id: "38aea2b98e40317a",
				children: "a.jsx-38aea2b98e40317a{color:rgba(171,205,239,.07)}"
			})
		]
	});
}
//#endregion
export { IndexPage as default };
