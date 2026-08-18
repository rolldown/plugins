import styled from "@emotion/styled";
import * as emotion from "@emotion/react";
import { css, keyframes } from "@emotion/react";
//#region virtual:entry.tsx
const Component = "div";
const StyledMemberTag = /* @__PURE__ */ styled("button", {
	target: "e1r3sr4i0",
	...process.env.NODE_ENV === "production" ? {} : { label: "virtual-entry-StyledMemberTag" }
})("color:hotpink;", "/*# sourceMappingURL=[sourcemap] */");
const StyledComponentTag = /* @__PURE__ */ styled(Component, {
	target: "e1r3sr4i1",
	...process.env.NODE_ENV === "production" ? {} : { label: "virtual-entry-StyledComponentTag" }
})("color:hotpink;", "/*# sourceMappingURL=[sourcemap] */");
const StyledNestedCall = /* @__PURE__ */ styled("button", {
	shouldForwardProp: () => true,
	target: "e1r3sr4i2",
	...process.env.NODE_ENV === "production" ? {} : { label: "virtual-entry-StyledNestedCall" }
})({ color: "hotpink" }, "/*# sourceMappingURL=[sourcemap] */");
const StyledMemberCall = /* @__PURE__ */ styled("button", {
	target: "e1r3sr4i3",
	...process.env.NODE_ENV === "production" ? {} : { label: "virtual-entry-StyledMemberCall" }
})({ color: "hotpink" }, "/*# sourceMappingURL=[sourcemap] */");
const cssTag = /* @__PURE__ */ css("color:hotpink;", ...process.env.NODE_ENV === "production" ? [] : ["label:virtual-entry-cssTag;"], "/*# sourceMappingURL=[sourcemap] */");
const keyframesTag = /* @__PURE__ */ keyframes("from{opacity:0;}to{opacity:1;}", ...process.env.NODE_ENV === "production" ? [] : ["virtual-entry-keyframesTag"], "/*# sourceMappingURL=[sourcemap] */");
const cssCall = /* @__PURE__ */ css({ color: "hotpink" }, ...process.env.NODE_ENV === "production" ? [] : ["label:virtual-entry-cssCall"], "/*# sourceMappingURL=[sourcemap] */");
const keyframesCall = /* @__PURE__ */ keyframes({
	from: { opacity: 0 },
	to: { opacity: 1 }
}, ...process.env.NODE_ENV === "production" ? [] : ["virtual-entry-keyframesCall"], "/*# sourceMappingURL=[sourcemap] */");
const namespaceCssTag = /* @__PURE__ */ emotion.css("color:hotpink;", ...process.env.NODE_ENV === "production" ? [] : ["label:virtual-entry-namespaceCssTag;"], "/*# sourceMappingURL=[sourcemap] */");
const namespaceKeyframesTag = /* @__PURE__ */ emotion.keyframes("from{opacity:0;}to{opacity:1;}", ...process.env.NODE_ENV === "production" ? [] : ["virtual-entry-namespaceKeyframesTag"], "/*# sourceMappingURL=[sourcemap] */");
const namespaceCssCall = /* @__PURE__ */ emotion.css({ color: "hotpink" }, ...process.env.NODE_ENV === "production" ? [] : ["label:virtual-entry-namespaceCssCall"], "/*# sourceMappingURL=[sourcemap] */");
const namespaceKeyframesCall = /* @__PURE__ */ emotion.keyframes({
	from: { opacity: 0 },
	to: { opacity: 1 }
}, ...process.env.NODE_ENV === "production" ? [] : ["virtual-entry-namespaceKeyframesCall"], "/*# sourceMappingURL=[sourcemap] */");
//#endregion
export { StyledComponentTag, StyledMemberCall, StyledMemberTag, StyledNestedCall, cssCall, cssTag, keyframesCall, keyframesTag, namespaceCssCall, namespaceCssTag, namespaceKeyframesCall, namespaceKeyframesTag };
