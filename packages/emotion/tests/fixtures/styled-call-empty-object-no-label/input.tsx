import styled from "@emotion/styled";

// Tagged template with empty object, label disabled
export const TaggedEmpty = styled(Component, {})`
  color: red;
`;

// Call expression with empty object, label disabled
export const CallEmpty = styled(Component, {})({ color: 'red' });
