import _JSXStyle from "styled-jsx/style";
import styles from "./styles";
import { jsx, jsxs } from "react/jsx-runtime";
//#endregion
//#region virtual:entry.jsx
const styles2 = (/* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, { get: (a, b) => (typeof require !== "undefined" ? require : a)[b] }) : x)(function(x) {
	if (typeof require !== "undefined") return require.apply(this, arguments);
	throw Error("Calling `require` for \"" + x + "\" in an environment that doesn't expose the `require` function. See https://rolldown.rs/in-depth/bundling-cjs#require-external-modules for more details.");
}))("./styles2");
const Test1 = () => /* @__PURE__ */ jsxs("div", {
	className: `jsx-${styles2.__hash} jsx-${styles.__hash}`,
	children: [
		/* @__PURE__ */ jsx("p", {
			className: `jsx-${styles2.__hash} jsx-${styles.__hash}`,
			children: "external only"
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: styles.__hash,
			children: styles
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: styles2.__hash,
			children: styles2
		})
	]
});
const Test2 = () => /* @__PURE__ */ jsxs("div", {
	className: `jsx-c13393f875fc158e jsx-${styles.__hash}`,
	children: [
		/* @__PURE__ */ jsx("p", {
			className: `jsx-c13393f875fc158e jsx-${styles.__hash}`,
			children: "external and static"
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: "c13393f875fc158e",
			children: "p.jsx-c13393f875fc158e{color:red}"
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: styles.__hash,
			children: styles
		})
	]
});
const Test3 = ({ color }) => /* @__PURE__ */ jsxs("div", {
	className: `jsx-${styles.__hash} ` + _JSXStyle.dynamic([["36fb8178b420e502", [color]]]),
	children: [
		/* @__PURE__ */ jsx("p", {
			className: `jsx-${styles.__hash} ` + _JSXStyle.dynamic([["36fb8178b420e502", [color]]]),
			children: "external and dynamic"
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: "36fb8178b420e502",
			dynamic: [color],
			children: `p.__jsx-style-dynamic-selector{color:${color}}`
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: styles.__hash,
			children: styles
		})
	]
});
const Test4 = ({ color }) => /* @__PURE__ */ jsxs("div", {
	className: `jsx-65d8b60c1e33ba41 jsx-${styles.__hash} ` + _JSXStyle.dynamic([["4d0e2d62b5eff848", [color]]]),
	children: [
		/* @__PURE__ */ jsx("p", {
			className: `jsx-65d8b60c1e33ba41 jsx-${styles.__hash} ` + _JSXStyle.dynamic([["4d0e2d62b5eff848", [color]]]),
			children: "external, static and dynamic"
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: "65d8b60c1e33ba41",
			children: "p.jsx-65d8b60c1e33ba41{display:inline-block}"
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: "4d0e2d62b5eff848",
			dynamic: [color],
			children: `p.__jsx-style-dynamic-selector{color:${color}}`
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: styles.__hash,
			children: styles
		})
	]
});
const Test5 = () => /* @__PURE__ */ jsxs("div", {
	className: "jsx-ebc8fe79ced3de11",
	children: [
		/* @__PURE__ */ jsx("p", {
			className: "jsx-ebc8fe79ced3de11",
			children: "static only"
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: "65d8b60c1e33ba41",
			children: "p.jsx-ebc8fe79ced3de11{display:inline-block}"
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: "c13393f875fc158e",
			children: "p.jsx-ebc8fe79ced3de11{color:red}"
		})
	]
});
const Test6 = ({ color }) => /* @__PURE__ */ jsxs("div", {
	className: "jsx-65d8b60c1e33ba41 " + _JSXStyle.dynamic([["4d0e2d62b5eff848", [color]]]),
	children: [
		/* @__PURE__ */ jsx("p", {
			className: "jsx-65d8b60c1e33ba41 " + _JSXStyle.dynamic([["4d0e2d62b5eff848", [color]]]),
			children: "static and dynamic"
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: "65d8b60c1e33ba41",
			children: "p.jsx-65d8b60c1e33ba41{display:inline-block}"
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: "4d0e2d62b5eff848",
			dynamic: [color],
			children: `p.__jsx-style-dynamic-selector{color:${color}}`
		})
	]
});
const Test7 = ({ color }) => /* @__PURE__ */ jsxs("div", {
	className: _JSXStyle.dynamic([["36fb8178b420e502", [color]]]),
	children: [/* @__PURE__ */ jsx("p", {
		className: _JSXStyle.dynamic([["36fb8178b420e502", [color]]]),
		children: "dynamic only"
	}), /* @__PURE__ */ jsx(_JSXStyle, {
		id: "36fb8178b420e502",
		dynamic: [color],
		children: `p.__jsx-style-dynamic-selector{color:${color}}`
	})]
});
const Test8 = ({ color }) => {
	if (color) {
		const innerProps = { color };
		return /* @__PURE__ */ jsxs("div", {
			className: _JSXStyle.dynamic([["4b81fc1d5d4e9d3c", [innerProps.color]]]),
			children: [/* @__PURE__ */ jsx("p", {
				className: _JSXStyle.dynamic([["4b81fc1d5d4e9d3c", [innerProps.color]]]),
				children: "dynamic with scoped compound variable"
			}), /* @__PURE__ */ jsx(_JSXStyle, {
				id: "4b81fc1d5d4e9d3c",
				dynamic: [innerProps.color],
				children: `p.__jsx-style-dynamic-selector{color:${innerProps.color}}`
			})]
		});
	}
};
const Test9 = ({ color }) => {
	const innerProps = { color };
	return /* @__PURE__ */ jsxs("div", {
		className: _JSXStyle.dynamic([["663b620258f0353b", [innerProps.color]]]),
		children: [/* @__PURE__ */ jsx("p", {
			className: _JSXStyle.dynamic([["663b620258f0353b", [innerProps.color]]]),
			children: "dynamic with compound variable"
		}), /* @__PURE__ */ jsx(_JSXStyle, {
			id: "663b620258f0353b",
			dynamic: [innerProps.color],
			children: `p.__jsx-style-dynamic-selector{color:${innerProps.color}}`
		})]
	});
};
const foo = "red";
const Test10 = () => /* @__PURE__ */ jsxs("div", {
	className: "jsx-36fb8178b420e502",
	children: [/* @__PURE__ */ jsx("p", {
		className: "jsx-36fb8178b420e502",
		children: "dynamic with constant variable"
	}), /* @__PURE__ */ jsx(_JSXStyle, {
		id: "36fb8178b420e502",
		children: `p.jsx-36fb8178b420e502{color:${foo}}`
	})]
});
const Test11 = ({ color }) => {
	return /* @__PURE__ */ jsx("ul", {
		className: "items",
		children: Array.from({ length: 5 }).map((item, i) => /* @__PURE__ */ jsxs("li", {
			className: _JSXStyle.dynamic([["08e051f98bc93b44", [color]]]) + " item",
			children: [
				/* @__PURE__ */ jsx(_JSXStyle, {
					id: "08e051f98bc93b44",
					dynamic: [color],
					children: `.item.__jsx-style-dynamic-selector{color:${color}}`
				}),
				"Item #",
				i + 1
			]
		}, i))
	});
};
//#endregion
export { Test1, Test10, Test11, Test2, Test3, Test4, Test5, Test6, Test7, Test8, Test9 };
