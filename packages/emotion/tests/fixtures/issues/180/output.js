import { css } from "@emotion/react";
import styled from "@emotion/styled";
import "react/jsx-runtime";
//#region virtual:entry.tsx
function myStyled(Component) {
	return /* @__PURE__ */ styled(Component, {
		target: "e16jl22g0",
		label: "myStyled"
	})("background-color:red;", "/*# sourceMappingURL=[sourcemap] */");
}
function myCss(color) {
	return /* @__PURE__ */ css("background-color:", color, ";", "myCss", "/*# sourceMappingURL=[sourcemap] */");
}
myCss("red");
myStyled("div");
//#endregion
