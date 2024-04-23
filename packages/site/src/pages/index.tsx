import styled from 'styled-components';

import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  Card,
} from '../components';
import { defaultSnapOrigin } from '../config';
import { useMetaMask, useMetaMaskContext, useRequestSnap } from '../hooks';
import { isLocalSnap, shouldDisplayReconnectButton } from '../utils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: orange};
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error?.muted};
  border: 1px solid ${({ theme }) => theme.colors.error?.default};
  color: ${({ theme }) => theme.colors.error?.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const ListItem = styled.li`
  text-align: left;
  padding-bottom: 1.2rem;
`;

const Index = () => {
  const { error } = useMetaMaskContext();
  const { isFlask, snapsDetected, installedSnap } = useMetaMask();
  const requestSnap = useRequestSnap();

  console.log('🚀 ~ defaultSnapOrigin:', defaultSnapOrigin);

  // const isMetaMaskReady = isLocalSnap(defaultSnapOrigin)
  //   ? isFlask
  //   : snapsDetected;
  //TODO: temp because of no deploy for metamask
  const isMetaMaskReady = isFlask;

  return (
    <Container>
      <Heading>
        Welcome to <Span>TACo Snap! 🌮</Span>
      </Heading>
      <CardContainer>
        {error && (
          <ErrorMessage>
            <b>An error happened:</b> {error.message}
          </ErrorMessage>
        )}
        <Card
          content={{
            title: '🌮 TACo-Snap usage 🌮',
            description: (
              <p>
                <ol>
                  <ListItem>
                    Install and open TACo-Snap application on MetaMask.
                  </ListItem>
                  <ListItem>
                    Click on store message, fill the only one address that is
                    allow to decrypt de message, and fill the message and add a
                    label to access your keys from keychain.(e.g. your seed
                    phrase){' '}
                  </ListItem>
                  <ListItem>
                    Copy the key access key, and share it, or store it where you
                    want. Don't worry your message is in safe. Note: you can get
                    the key when you want by looking in your keychain.
                  </ListItem>
                  <ListItem>
                    To decrypt a message you need a key and your wallet must to
                    be the same wallet that who generated the key allowed to
                    decrypt the message.
                  </ListItem>
                </ol>
              </p>
            ),
          }}
          disabled={!installedSnap}
        />
        {!isMetaMaskReady && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the TACo-Snap 🌮',
              button: (
                <ConnectButton
                  onClick={requestSnap}
                  disabled={!isMetaMaskReady}
                />
              ),
            }}
            disabled={!isMetaMaskReady}
          />
        )}
        {shouldDisplayReconnectButton(installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description: 'Re-install the TACo-Snap 🌮',
              button: (
                <ReconnectButton
                  onClick={requestSnap}
                  disabled={!installedSnap}
                />
              ),
            }}
            disabled={!installedSnap}
          />
        )}
      </CardContainer>
    </Container>
  );
};

export default Index;
