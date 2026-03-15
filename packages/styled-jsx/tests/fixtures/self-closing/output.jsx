import _JSXStyle from "styled-jsx/style";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
function SelfClosing() {
	return /* @__PURE__ */ jsxs("div", {
		className: "jsx-f453ed22ae30f54b",
		children: [
			/* @__PURE__ */ jsx("br", { className: "jsx-f453ed22ae30f54b" }),
			/* @__PURE__ */ jsx("hr", { className: "jsx-f453ed22ae30f54b" }),
			/* @__PURE__ */ jsx("img", {
				src: "test.png",
				className: "jsx-f453ed22ae30f54b"
			}),
			/* @__PURE__ */ jsx(_JSXStyle, {
				id: "f453ed22ae30f54b",
				children: "hr.jsx-f453ed22ae30f54b{border:1px solid red}"
			})
		]
	});
}
//#endregion
export { SelfClosing as default };
