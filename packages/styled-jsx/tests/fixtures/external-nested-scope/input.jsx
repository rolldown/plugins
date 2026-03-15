import css from "styled-jsx/css";

export function test() {
  return css.resolve`
    div {
      color: red;
    }
  `;
}
