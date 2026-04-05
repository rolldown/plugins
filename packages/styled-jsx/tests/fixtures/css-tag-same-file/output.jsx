import _JSXStyle from "styled-jsx/style";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
var virtual_entry_default = ({ children }) => /* @__PURE__ */ jsxs("div", {
	className: `jsx-${styles.__hash}`,
	children: [/* @__PURE__ */ jsx("p", {
		className: `jsx-${styles.__hash}`,
		children
	}), /* @__PURE__ */ jsx(_JSXStyle, {
		id: styles.__hash,
		children: styles
	})]
});
const styles = /* @__PURE__ */ new String("p.jsx-202c70686e534920{color:red}");
styles.__hash = "202c70686e534920";
var Test = class extends React.Component {
	render() {
		return /* @__PURE__ */ jsxs("div", {
			className: `jsx-${styles.__hash}`,
			children: [/* @__PURE__ */ jsx("p", {
				className: `jsx-${styles.__hash}`,
				children: this.props.children
			}), /* @__PURE__ */ jsx(_JSXStyle, {
				id: styles.__hash,
				children: styles
			})]
		});
	}
};
//#endregion
export { Test, virtual_entry_default as default };
