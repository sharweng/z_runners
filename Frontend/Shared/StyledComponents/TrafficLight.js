import styled, { css } from "styled-components/native";
import { colors } from "../theme";

const TrafficLight = styled.View`
  border-radius: 50px;
  width: 10px;
  height: 10px;
  padding: 10px;

  ${(props) =>
    props.available &&
    css`
      background: ${colors.success};
    `}

  ${(props) =>
    props.limited &&
    css`
      background: ${colors.warning};
    `}

    ${(props) =>
    props.unavailable &&
    css`
      background: ${colors.danger};
    `}
`;

export default TrafficLight;