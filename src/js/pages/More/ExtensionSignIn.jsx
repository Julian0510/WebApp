import { Button } from '@mui/material';
import PropTypes from 'prop-types';
import React, { Component, Suspense } from 'react';
import styled from 'styled-components';
import LoadingWheel from '../../common/components/Widgets/LoadingWheel';
import { renderLog } from '../../common/utils/logging';
import { standardBoxShadow } from '../../components/Style/pageLayoutStyles';
import VoterStore from '../../stores/VoterStore';

const DelayedLoad = React.lazy(() => import(/* webpackChunkName: 'DelayedLoad' */ '../../common/components/Widgets/DelayedLoad'));
const SignInOptionsPanel = React.lazy(() => import(/* webpackChunkName: 'SignInOptionsPanel' */ '../../components/SignIn/SignInOptionsPanel'));


class ExtensionSignIn extends Component {
  constructor (props) {
    super(props);
    this.state = {
      voter: {},
      voterIsSignedIn: false,
    };
  }

  componentDidMount () {
    const { search: title } = this.props.location;  // https://localhost:3000/more/extensionsignin?title=2020%20Endorsements%20%7C%20Sierra%20Club&
    console.log(`SettingsDomain ExtensionSignIn title: ${title}`);
    this.onVoterStoreChange();
    // this.onOrganizationStoreChange();
    this.voterStoreListener = VoterStore.addListener(this.onVoterStoreChange.bind(this));
  }

  componentWillUnmount () {
    this.voterStoreListener.remove();
  }

  onVoterStoreChange () {
    const voter = VoterStore.getVoter();
    const voterIsSignedIn = voter.is_signed_in;
    this.setState({
      voter,
      voterIsSignedIn,
    });
  }

  render () {
    renderLog('extensionSignIn');  // Set LOG_RENDER_EVENTS to log all renders
    /* eslint-disable react/jsx-one-expression-per-line */
    /* eslint-disable react/jsx-max-props-per-line */
    const {
      voter, voterIsSignedIn,
    } = this.state;
    if (!voter) {
      return LoadingWheel;
    }
    // let title = localStorage.extensionTitle;
    // Unfortunately even local storage doesn't survive the Twitter redirects, we come back in the new instance, and the request handleOpenURL(
    //   comes back without the search terms.

    if (!voterIsSignedIn) {
      // console.log('voterIsSignedIn is false');
      return (
        <Suspense fallback={<></>}>
          <DelayedLoad showLoadingText waitBeforeShow={2000}>
            <SignInOuterWrapper>
              <SignInInnerWrapper>
                <SignInIntro>
                  Please sign in here:
                </SignInIntro>
                <SignInOptionsPanel />
              </SignInInnerWrapper>
            </SignInOuterWrapper>
          </DelayedLoad>
        </Suspense>
      );
    } else {
      return (
        <Wrapper>
          <div className="card" style={{ marginTop: '15%' }}>
            <Success>
              You are now signed in!
              <br />
              <br />
              {/* This button is a placeholder, feel free to improve */}
              <Button onClick={() => window.close()} color="primary" autoFocus style={{
                transition: 'none',
                color: '#fff',
                backgroundColor: '#1976d2',
                boxShadow: standardBoxShadow('medium'),
                transitionTimingFunction: 'none !important',
              }}
              >
                Return to the chrome extension
              </Button>
              <br />
              <br />
            </Success>
          </div>
        </Wrapper>
      );
    }
  }
}
ExtensionSignIn.propTypes = {
  location: PropTypes.object,
};


const SignInOuterWrapper = styled('div')`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const SignInInnerWrapper = styled('div')`
  padding: 24px;
  width: 50%;
  @media (max-width: 640px) {
    width: 100%;
  }
`;

const SignInIntro = styled('div')`
  color: #2e3c5d;
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 12px;
  text-align: center;
  @media (max-width: 576px) {
    font-size: 20px;
  }
`;

const Success = styled('div')`
  color: #2e3c5d;
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 12px;
  padding-top: 24px;
  text-align: center;
  @media (max-width: 576px) {
    font-size: 20px;
  }
`;

const Wrapper = styled('div')`
  background-color: #E9EBEE;
  margin-bottom: 64px;
  margin-left: 12px;
  margin-right: 12px;
`;

export default (ExtensionSignIn);
