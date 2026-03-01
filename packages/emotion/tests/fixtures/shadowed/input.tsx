import styled from "@emotion/styled";

export function foo() {
  const a = styled.div`
  color: red;
  .foo {
    color: blue;
    /**
      multi line comments
    */
  }
  /* /* */
  width: 10px;
`;
  console.log(a);

  var styled;
}
