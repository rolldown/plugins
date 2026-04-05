import css from "hell";
import { jsx } from "react/jsx-runtime";
//#region virtual:entry.jsx
const color = "red";
const uh = css`
  div {
    font-size: 3em;
  }
`;
const foo = css`
  div {
    color: ${color};
  }
`;
var virtual_entry_default = css`
  div {
    font-size: 3em;
  }
  p {
    color: ${color};
  }
`;
const AnotherTitle = styled.h1`
  color: red;
  font-size: 50px;
`.extend`
  color: blue;
`;
const Component = () => /* @__PURE__ */ jsx(AnotherTitle, { children: "My page" });
//#endregion
export { Component, virtual_entry_default as default, foo, uh };
