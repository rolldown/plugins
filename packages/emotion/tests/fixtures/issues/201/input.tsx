import styled from "@emotion/styled";

function makeOptions() {
  return {
    shouldForwardProp: (propertyName: string) => !propertyName.startsWith("$"),
  };
}
export const ContainerWithOptions = styled("div", makeOptions())`
  color: hotpink;
`;

export const ContainerWithOptions2 = styled(
  "div",
  makeOptions(),
)({
  color: "hotpink",
});
