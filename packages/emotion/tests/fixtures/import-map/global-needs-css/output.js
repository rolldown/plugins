import "react";
import { SomeGlobalFromCore } from "package-two";
import { jsx } from "react/jsx-runtime";
//#region virtual:entry.tsx
const getBgColor = () => ({ backgroundColor: "#fff" });
var virtual_entry_default = () => /* @__PURE__ */ jsx(SomeGlobalFromCore, { styles: [{
	color: "hotpink",
	...getBgColor()
}, "/*# sourceMappingURL=[sourcemap] */"] });
//#endregion
export { virtual_entry_default as default };
