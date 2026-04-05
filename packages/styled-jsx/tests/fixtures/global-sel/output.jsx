import _JSXStyle from "styled-jsx/style";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
const Test = () => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("div", {
	className: "jsx-9e744f33d59a4019 container",
	children: [
		/* @__PURE__ */ jsxs("div", {
			className: "jsx-9e744f33d59a4019 p1",
			children: [".p1 -This is another parent.", /* @__PURE__ */ jsxs("div", {
				className: "jsx-9e744f33d59a4019 c1",
				children: [".c1 - This should be orange bg.", /* @__PURE__ */ jsx("div", {
					className: "jsx-9e744f33d59a4019 c2",
					children: ".c2 - This should be orange bg as well."
				})]
			})]
		}),
		/* @__PURE__ */ jsx("hr", { className: "jsx-9e744f33d59a4019 my-4" }),
		/* @__PURE__ */ jsx("h3", {
			className: "jsx-9e744f33d59a4019 mb-2",
			children: "Compiled CSS"
		}),
		compiledCss ? /* @__PURE__ */ jsx("pre", {
			className: "jsx-9e744f33d59a4019",
			children: formatCss(compiledCss)
		}) : /* @__PURE__ */ jsx("p", {
			className: "jsx-9e744f33d59a4019",
			children: "Loading CSS..."
		})
	]
}), /* @__PURE__ */ jsx(_JSXStyle, {
	id: "9e744f33d59a4019",
	children: "#css-test-page-id.jsx-9e744f33d59a4019{color:red}.p1.jsx-9e744f33d59a4019{background:purple!important}.c2.jsx-9e744f33d59a4019,.c1{background:orange!important}.container.jsx-9e744f33d59a4019{max-width:1000px;margin:0 auto;padding:1rem}"
})] });
//#endregion
export { Test };
