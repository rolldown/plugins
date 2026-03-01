import styled from "@emotion/styled";

// Tagged template with empty object
export const TaggedEmpty = styled(Component, {})`
  color: red;
`;

// Call expression with empty object
export const CallEmpty = styled(Component, {})({ color: 'red' });
