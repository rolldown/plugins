import { css } from "@emotion/react";
//#region virtual:entry.ts
function thing() {}
function doThing() {
	return /* @__PURE__ */ css("display:", thing(), ";", "label:doThing;", "/*# sourceMappingURL=[sourcemap] */");
}
//#endregion
export { doThing };
