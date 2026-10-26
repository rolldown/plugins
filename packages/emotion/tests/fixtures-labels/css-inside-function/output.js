import { css } from "@emotion/css";
// virtual:entry.ts
const wrapFunction = (cb) => {
	return cb();
};
const classes = wrapFunction(() => {
	return { class1: /* @__PURE__ */ css({ color: "red" }, "label:class1", "/*# sourceMappingURL=[sourcemap] */") };
});
export { classes };
