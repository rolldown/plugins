import _JSXStyle from "styled-jsx/style";
import colors, { size } from "./constants";
import { jsx } from "react/jsx-runtime";
//#region virtual:entry.jsx
const color = "red";
const bar = /* @__PURE__ */ new String("div.jsx-e289522b703d9d97{font-size:3em}");
bar.__hash = "e289522b703d9d97";
const baz = /* @__PURE__ */ new String("div{font-size:3em}");
baz.__hash = "e289522b703d9d97";
const a = /* @__PURE__ */ new String(`div{font-size:${size}em}`);
a.__hash = "9f14d596b90c07ae";
const uh = bar;
const foo = /* @__PURE__ */ new String(`div.jsx-fc0c7510e5eae463{color:${color}}`);
foo.__hash = "fc0c7510e5eae463";
`${colors.green.light}`;
const b = {
	styles: /* @__PURE__ */ jsx(_JSXStyle, {
		id: "d40c39579139a6cc",
		children: `div.jsx-d40c39579139a6cc{color:${colors.green.light}}a.jsx-d40c39579139a6cc{color:red}`
	}),
	className: "jsx-d40c39579139a6cc"
};
const dynamic = (colors) => {
	colors.green.light, `${colors.green.light}`, _JSXStyle.dynamic([["8d28ee379db09a5a", [colors.green.light]]]);
};
var virtual_entry_default = {
	styles: /* @__PURE__ */ jsx(_JSXStyle, {
		id: "9217daf919c42513",
		children: `div.jsx-9217daf919c42513{font-size:3em}p.jsx-9217daf919c42513{color:${color}}`
	}),
	className: "jsx-9217daf919c42513"
};
//#endregion
export { a, b, baz, virtual_entry_default as default, dynamic, foo, uh };
