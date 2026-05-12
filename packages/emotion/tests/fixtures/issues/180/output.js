import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.tsx
function myStyled(Component) {
	return /* @__PURE__ */ styled(Component, {
		target: "et92jda0",
		label: "myStyled"
	})("background-color:red;", "/*# sourceMappingURL=[sourcemap] */");
}
function myCss(color) {
	return /* @__PURE__ */ css("background-color:", color, ";", "label:myCss;", "/*# sourceMappingURL=[sourcemap] */");
}
const myStyles = myCss("red");
const Div = myStyled("div");
function App() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Div, { children: "one" }), /* @__PURE__ */ jsx("div", {
		css: myStyles,
		children: "two"
	})] });
}
const styles = {
	keyA: /* @__PURE__ */ css({ padding: 0 }, "label:keyA", "/*# sourceMappingURL=[sourcemap] */"),
	keyB: /* @__PURE__ */ css({ margin: 0 }, "label:keyB", "/*# sourceMappingURL=[sourcemap] */")
};
const App2 = () => /* @__PURE__ */ jsx("div", {
	classname: styles.keyA,
	children: "hello world"
});
//#endregion
export { App, App2 };
