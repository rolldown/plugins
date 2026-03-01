import styled from "@emotion/styled";
//#region virtual:entry.tsx
function makeOptions() {
	return { shouldForwardProp: (propertyName) => !propertyName.startsWith("$") };
}
const ContainerWithOptions = /* @__PURE__ */ styled("div", {
	target: "e1mmxd2q0",
	label: "ContainerWithOptions",
	...makeOptions()
})("color:hotpink;", "/*# sourceMappingURL=[sourcemap] */");
const ContainerWithOptions2 = /* @__PURE__ */ styled("div", {
	target: "e1mmxd2q1",
	label: "ContainerWithOptions2",
	...makeOptions()
})({ color: "hotpink" }, "/*# sourceMappingURL=[sourcemap] */");
//#endregion
export { ContainerWithOptions, ContainerWithOptions2 };
