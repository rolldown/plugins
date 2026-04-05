import _JSXStyle from "styled-jsx/style";
import "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
function SimplePage() {
	return /* @__PURE__ */ jsx(ComponentWithChildAsProp, { trigger: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
		className: "jsx-8e4623adab1b6ef0 text animated",
		children: "Text"
	}), /* @__PURE__ */ jsx(_JSXStyle, {
		id: "8e4623adab1b6ef0",
		children: ".text.jsx-8e4623adab1b6ef0{color:#00f}.text.jsx-8e4623adab1b6ef0:hover{color:red}"
	})] }) });
}
const ComponentWithChildAsProp = ({ trigger }) => {
	return /* @__PURE__ */ jsx("div", { children: trigger });
};
//#endregion
export { SimplePage as default };
