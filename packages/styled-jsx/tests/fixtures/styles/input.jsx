import css, { resolve, global } from "styled-jsx/css";
import colors, { size } from "./constants";
const color = "red";

const bar = css`
  div {
    font-size: 3em;
  }
`;

export const baz = css.global`
  div {
    font-size: 3em;
  }
`;

export const a = global`
  div {
    font-size: ${size}em;
  }
`;

export const uh = bar;

export const foo = css`
  div {
    color: ${color};
  }
`;

css.resolve`
  div {
    color: ${colors.green.light};
  }
  a {
    color: red;
  }
`;

export const b = resolve`
  div {
    color: ${colors.green.light};
  }
  a { color: red }
`;

export const dynamic = (colors) => {
  const b = resolve`
    div {
      color: ${colors.green.light};
    }
    a { color: red }
  `;
};

export default css.resolve`
  div {
    font-size: 3em;
  }
  p {
    color: ${color};
  }
`;
