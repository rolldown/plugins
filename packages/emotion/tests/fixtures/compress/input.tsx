import { css } from "@emotion/react";
import styled from "@emotion/styled";

const unitNormal = "1rem";
const unitLarge = "2rem";

export const Example = styled.div`
  margin: ${unitNormal} ${unitLarge};
`;

export const Animated = styled.div`
  & code {
    background-color: linen;
  }
  animation: ${({ animation }) => animation} 0.2s infinite ease-in-out alternate;
`;

export const shadowBorder = ({ width = "1px", color }) => css`
  box-shadow: inset 0px 0px 0px ${width} ${color};
`;

export const StyledInput = styled.input`
  ${shadowBorder({ color: "red", width: "4px" })}
`;
