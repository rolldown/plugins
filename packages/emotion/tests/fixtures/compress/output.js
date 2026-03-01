import { css } from "@emotion/react";
import styled from "@emotion/styled";
const Example = /* @__PURE__ */ styled("div", {
	target: "ejis9i80",
	label: "Example"
})("margin:", "1rem", " ", "2rem", ";", "/*# sourceMappingURL=[sourcemap] */");
const Animated = /* @__PURE__ */ styled("div", {
	target: "ejis9i81",
	label: "Animated"
})("& code{background-color:linen;}animation:", ({ animation }) => animation, " 0.2s infinite ease-in-out alternate;", "/*# sourceMappingURL=[sourcemap] */");
const shadowBorder = ({ width = "1px", color }) => /* @__PURE__ */ css("box-shadow:inset 0px 0px 0px ", width, " ", color, ";", "shadowBorder", "/*# sourceMappingURL=[sourcemap] */");
const StyledInput = /* @__PURE__ */ styled("input", {
	target: "ejis9i82",
	label: "StyledInput"
})(shadowBorder({
	color: "red",
	width: "4px"
}), "/*# sourceMappingURL=[sourcemap] */");
//#endregion
export { Animated, Example, StyledInput, shadowBorder };
