import styled, { css } from "styled-components/native";
import { colors } from "../theme";

const EasyButton = styled.TouchableOpacity`
    flex-direction: row;
    border-radius: 999px;
    padding: 12px 16px;
    margin: 6px;
    justify-content: center;
    align-items: center;
    background: ${colors.surfaceSoft};
    border: 1px solid ${colors.border};

    ${(props) =>
        props.primary &&
        css`
            background: ${colors.primary};
            border-color: ${colors.primary};
        `
    }

    ${(props) =>
        props.secondary &&
        css`
            background: ${colors.accent};
            border-color: ${colors.accent};
        `
    }

    ${(props) => 
        props.danger &&
        css`
            background: ${colors.danger};
            border-color: ${colors.danger};
        `
    }

    ${(props) => 
        props.large &&
        css`
            min-width: 150px;
        `
    }

    ${(props) => 
        props.medium &&
        css`
            min-width: 110px;
        `
    }

    ${(props) => 
        props.small &&
        css`
            min-width: 44px;
        `
    }
`;

export default EasyButton