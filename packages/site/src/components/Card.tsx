import type { ReactNode } from 'react';
import styled from 'styled-components';

type CardProps = {
  content: {
    title?: string;
    description: ReactNode;
    button?: ReactNode;
  };
  disabled?: boolean;
  fullWidth?: boolean;
};

const CardWrapper = styled.div<{
  fullWidth?: boolean | undefined;
  disabled?: boolean | undefined;
}>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : '100%')};
  background-color: ${({ theme }) => theme.colors.card?.default};
  margin-top: 2.4rem;
  margin-bottom: 2.4rem;
  padding: 2.4rem;
  border: 1px solid ${({ theme }) => theme.colors.border?.default};
  border-radius: ${({ theme }) => theme.radii.default};
  box-shadow: ${({ theme }) => theme.shadows.default};
  filter: opacity(${({ disabled }) => (disabled ? '.4' : '1')});
  align-self: stretch;
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
    margin-top: 1.2rem;
    margin-bottom: 1.2rem;
    padding: 1.6rem;
  }
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.large};
  margin: 0;
  text-align: center;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const Description = styled.div`
  margin-top: 2.4rem;
  margin-bottom: 2.4rem;
  text-align: center;
`;

export const Card = ({ content, disabled = false, fullWidth }: CardProps) => {
  const { title, description, button } = content;
  return (
    <CardWrapper fullWidth={fullWidth} disabled={disabled}>
      {title && <Title>{title}</Title>}
      <Description>{description}</Description>
      <div style={{ display: 'flex', justifyContent: 'center' }}>{button}</div>
    </CardWrapper>
  );
};
