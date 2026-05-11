import { css } from "@emotion/react";
//#region virtual:entry.ts
function media(...args) {
	return /* @__PURE__ */ css("@media (min-width:100px){", css(...args), ";}", "label:media;", "/*# sourceMappingURL=[sourcemap] */");
}
const test = /* @__PURE__ */ css(media`color: red;`, ";", "label:test;", "/*# sourceMappingURL=[sourcemap] */");
//#endregion
export { test };
