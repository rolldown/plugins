import * as emotionReact from "@emotion/react";
import { PureComponent } from "react";
import ReactDOM from "react-dom";
import { jsx } from "react/jsx-runtime";
//#region virtual:entry.tsx
const stylesInCallback = (props) => /* @__PURE__ */ emotionReact.css({
	color: "red",
	background: "yellow",
	width: `${props.scale * 100}px`
}, "label:stylesInCallback", "/*# sourceMappingURL=[sourcemap] */");
const styles = /* @__PURE__ */ emotionReact.css({
	color: "red",
	width: "20px"
}, "label:styles", "/*# sourceMappingURL=[sourcemap] */");
const styles2 = /* @__PURE__ */ emotionReact.css("color:red;width:20px;", "label:styles2", "/*# sourceMappingURL=[sourcemap] */");
var SimpleComponent = class extends PureComponent {
	render() {
		return /* @__PURE__ */ jsx("div", {
			className: styles,
			children: /* @__PURE__ */ jsx("span", { children: "hello" })
		});
	}
};
ReactDOM.render(/* @__PURE__ */ jsx(SimpleComponent, {}), document.querySelector("#app"));
//#endregion
export { SimpleComponent, styles, styles2, stylesInCallback };
