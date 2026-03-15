import styled from "@emotion/styled";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.tsx
function IndexPage() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("h1", { children: "IndexPage" }),
		/* @__PURE__ */ jsx(IconWrapper, { className: "icon-chat" }),
		/* @__PURE__ */ jsx(IconWrapper, { className: "icon-check" })
	] });
}
const IconWrapper = /* @__PURE__ */ styled("div", {
	target: "eokgv1d0",
	label: "IconWrapper"
})("&[class^=\"icon-\"],[class*=\" icon-\"]{color:red;}&.icon-chat:before{content:\"\\e904\";}&.icon-check:before{content:\"\\e905\";}", "/*# sourceMappingURL=[sourcemap] */");
//#endregion
export { IndexPage as default };
