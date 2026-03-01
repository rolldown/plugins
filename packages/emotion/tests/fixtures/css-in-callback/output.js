import { Global, css } from "@emotion/react";
import styled from "@emotion/styled";
import { PureComponent } from "react";
import ReactDOM from "react-dom";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.tsx
const stylesInCallback = (props) => /* @__PURE__ */ css({
	color: "red",
	background: "yellow",
	width: `${props.scale * 100}px`
}, "label:stylesInCallback", "/*# sourceMappingURL=[sourcemap] */");
const styles = /* @__PURE__ */ css({
	color: "red",
	width: "20px"
}, "label:styles", "/*# sourceMappingURL=[sourcemap] */");
const styles2 = /* @__PURE__ */ css("color:red;width:20px;", "styles2", "/*# sourceMappingURL=[sourcemap] */");
const DivContainer = /* @__PURE__ */ styled("div", {
	target: "e1i4ntoh0",
	label: "DivContainer"
})({ background: "red" }, "/*# sourceMappingURL=[sourcemap] */");
const DivContainer2 = /* @__PURE__ */ styled("div", {
	target: "e1i4ntoh1",
	label: "DivContainer2"
})("background:red;", "/*# sourceMappingURL=[sourcemap] */");
const ContainerWithOptions = /* @__PURE__ */ styled("div", {
	shouldForwardProp: (propertyName) => !propertyName.startsWith("$"),
	target: "e1i4ntoh2",
	label: "ContainerWithOptions"
})("color:hotpink;", "/*# sourceMappingURL=[sourcemap] */");
const SpanContainer = /* @__PURE__ */ styled("span", {
	target: "e1i4ntoh3",
	label: "SpanContainer"
})({ background: "yellow" }, "/*# sourceMappingURL=[sourcemap] */");
const DivContainerExtended = /* @__PURE__ */ styled(DivContainer, {
	target: "e1i4ntoh4",
	label: "DivContainerExtended"
})("/*# sourceMappingURL=[sourcemap] */");
const DivContainerExtended2 = /* @__PURE__ */ styled(DivContainer, {
	target: "e1i4ntoh5",
	label: "DivContainerExtended2"
})({}, "/*# sourceMappingURL=[sourcemap] */");
const Container = /* @__PURE__ */ styled("button", {
	target: "e1i4ntoh6",
	label: "Container"
})("background:red;", stylesInCallback, " ", () => css({ background: "red" }), "  color:yellow;font-size:12px;", "/*# sourceMappingURL=[sourcemap] */");
const Container2 = /* @__PURE__ */ styled("div", {
	target: "e1i4ntoh7",
	label: "Container2"
})("background:red;", "/*# sourceMappingURL=[sourcemap] */");
var SimpleComponent = class extends PureComponent {
	render() {
		return /* @__PURE__ */ jsxs(Container, {
			css: /* @__PURE__ */ css("color:hotpink;", "SimpleComponent", "/*# sourceMappingURL=[sourcemap] */"),
			children: [/* @__PURE__ */ jsx(Global, { styles: [css("html,body{padding:3rem 1rem;margin:0;background:papayawhip;min-height:100%;font-family:Helvetica,Arial,sans-serif;font-size:24px;}"), "/*# sourceMappingURL=[sourcemap] */"] }), /* @__PURE__ */ jsx("span", { children: "hello" })]
		});
	}
};
ReactDOM.render(/* @__PURE__ */ jsx(SimpleComponent, {}), document.querySelector("#app"));
//#endregion
export { Container2, ContainerWithOptions, DivContainer2, DivContainerExtended, DivContainerExtended2, SimpleComponent, SpanContainer, styles, styles2 };
