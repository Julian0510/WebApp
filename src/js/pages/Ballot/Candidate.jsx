import { Info } from '@mui/icons-material';
import withStyles from '@mui/styles/withStyles';
import PropTypes from 'prop-types';
import React, { Component, Suspense } from 'react';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import ActivityActions from '../../actions/ActivityActions';
import AnalyticsActions from '../../actions/AnalyticsActions';
import CandidateActions from '../../actions/CandidateActions';
import IssueActions from '../../actions/IssueActions';
import OrganizationActions from '../../actions/OrganizationActions';
import VoterGuideActions from '../../actions/VoterGuideActions';
import LoadingWheel from '../../common/components/Widgets/LoadingWheel';
import apiCalming from '../../common/utils/apiCalming';
import { isAndroidSizeFold } from '../../common/utils/cordovaUtils';
import historyPush from '../../common/utils/historyPush';
import { isWebApp } from '../../common/utils/isCordovaOrWebApp';
import { renderLog } from '../../common/utils/logging';
import toTitleCase from '../../common/utils/toTitleCase';
import CandidateStickyHeader from '../../components/Ballot/CandidateStickyHeader';
import ShareButtonDesktopTablet from '../../components/Share/ShareButtonDesktopTablet';
import { PageContentContainer } from '../../components/Style/pageLayoutStyles';
import EndorsementCard from '../../components/Widgets/EndorsementCard';
import SearchOnGoogle from '../../components/Widgets/SearchOnGoogle';
import SnackNotifier from '../../components/Widgets/SnackNotifier';
import ThisIsMeAction from '../../components/Widgets/ThisIsMeAction';
import ViewOnBallotpedia from '../../components/Widgets/ViewOnBallotpedia';
import webAppConfig from '../../config';
import AppObservableStore, { messageService } from '../../stores/AppObservableStore';
import BallotStore from '../../stores/BallotStore';
import CandidateStore from '../../stores/CandidateStore';
import IssueStore from '../../stores/IssueStore';
import VoterGuideStore from '../../stores/VoterGuideStore';
import VoterStore from '../../stores/VoterStore';
import { convertToInteger } from '../../utils/textFormat';

const CandidateItem = React.lazy(() => import(/* webpackChunkName: 'CandidateItem' */ '../../components/Ballot/CandidateItem'));
const DelayedLoad = React.lazy(() => import(/* webpackChunkName: 'DelayedLoad' */ '../../common/components/Widgets/DelayedLoad'));
const OpenExternalWebSite = React.lazy(() => import(/* webpackChunkName: 'OpenExternalWebSite' */ '../../common/components/Widgets/OpenExternalWebSite'));
const PositionList = React.lazy(() => import(/* webpackChunkName: 'PositionList' */ '../../components/Ballot/PositionList'));
const ViewUpcomingBallotButton = React.lazy(() => import(/* webpackChunkName: 'ViewUpcomingBallotButton' */ '../../components/Ready/ViewUpcomingBallotButton'));

// const nextReleaseFeaturesEnabled = webAppConfig.ENABLE_NEXT_RELEASE_FEATURES === undefined ? false : webAppConfig.ENABLE_NEXT_RELEASE_FEATURES;

// The component /pages/VoterGuide/OrganizationVoterGuideCandidate is based on this component
class Candidate extends Component {
  constructor (props) {
    super(props);
    this.state = {
      allCachedPositionsForThisCandidate: [],
      allCachedPositionsForThisCandidateLength: 0,
      candidate: {},
      candidateWeVoteId: '',
      organizationWeVoteId: '',
      positionListFromFriendsHasBeenRetrievedOnce: {},
      positionListHasBeenRetrievedOnce: {},
      scrolledDown: false,
      voterGuidesFromFriendsUpcomingHasBeenRetrievedOnce: {},
    };
  }

  componentDidMount () {
    // console.log('Candidate componentDidMount');
    window.scrollTo(0, 0);
    const { match: { params: {
      candidate_we_vote_id: candidateWeVoteId,
      organization_we_vote_id: organizationWeVoteId,
      modal_to_show: modalToShow,
      shared_item_code: sharedItemCode,
    } } } = this.props;
    this.appStateSubscription = messageService.getMessage().subscribe(() => this.onAppObservableStoreChange());
    this.candidateStoreListener = CandidateStore.addListener(this.onCandidateStoreChange.bind(this));
    this.voterGuideStoreListener = VoterGuideStore.addListener(this.onVoterGuideStoreChange.bind(this));
    // console.log('candidateWeVoteId:', candidateWeVoteId);
    if (candidateWeVoteId) {
      const candidate = CandidateStore.getCandidate(candidateWeVoteId);
      const { ballot_item_display_name: ballotItemDisplayName, contest_office_we_vote_id: officeWeVoteId } = candidate;
      // console.log('candidate:', candidate);
      this.setState({
        ballotItemDisplayName,
        candidate,
      });
      CandidateActions.candidateRetrieve(candidateWeVoteId);
      if (candidateWeVoteId &&
        !this.localPositionListHasBeenRetrievedOnce(candidateWeVoteId) &&
        !BallotStore.positionListHasBeenRetrievedOnce(candidateWeVoteId) &&
        !BallotStore.positionListHasBeenRetrievedOnce(officeWeVoteId)
      ) {
        CandidateActions.positionListForBallotItemPublic(candidateWeVoteId);
        const { positionListHasBeenRetrievedOnce } = this.state;
        positionListHasBeenRetrievedOnce[candidateWeVoteId] = true;
        this.setState({
          positionListHasBeenRetrievedOnce,
        });
      }
      if (candidateWeVoteId &&
        !this.localPositionListFromFriendsHasBeenRetrievedOnce(candidateWeVoteId) &&
        !BallotStore.positionListFromFriendsHasBeenRetrievedOnce(candidateWeVoteId) &&
        !BallotStore.positionListFromFriendsHasBeenRetrievedOnce(officeWeVoteId)
      ) {
        CandidateActions.positionListForBallotItemFromFriends(candidateWeVoteId);
        const { positionListFromFriendsHasBeenRetrievedOnce } = this.state;
        positionListFromFriendsHasBeenRetrievedOnce[candidateWeVoteId] = true;
        this.setState({
          positionListFromFriendsHasBeenRetrievedOnce,
        });
      }
    }

    // Get the latest guides to follow for this candidate

    // June 2018: Avoid hitting this same api multiple times, if we already have the data
    // const voterGuidesForId = VoterGuideStore.getVoterGuideForOrganizationId(organizationWeVoteId);
    // // console.log('voterGuidesForId:', voterGuidesForId);
    // if (voterGuidesForId && Object.keys(voterGuidesForId).length > 0) {
    //   // Do not request them again
    // } else {
    //   VoterGuideActions.voterGuidesToFollowRetrieveByBallotItem(candidateWeVoteId, 'CANDIDATE');
    // }

    if (apiCalming('organizationsFollowedRetrieve', 60000)) {
      OrganizationActions.organizationsFollowedRetrieve();
    }

    const allCachedPositionsForThisCandidate = CandidateStore.getAllCachedPositionsByCandidateWeVoteId(candidateWeVoteId);
    IssueActions.issueDescriptionsRetrieve(VoterStore.getVoterWeVoteId());
    IssueActions.issuesFollowedRetrieve(VoterStore.getVoterWeVoteId());
    if (VoterStore.electionId() && !IssueStore.issuesUnderBallotItemsRetrieveCalled(VoterStore.electionId())) {
      IssueActions.issuesUnderBallotItemsRetrieve(VoterStore.electionId());
      // IssueActions.issuesUnderBallotItemsRetrieveCalled(VoterStore.electionId()); // TODO: Move this to AppObservableStore? Currently throws error: 'Cannot dispatch in the middle of a dispatch'
    }

    this.setState({
      allCachedPositionsForThisCandidate,
      candidateWeVoteId,
      organizationWeVoteId,
      scrolledDown: AppObservableStore.getScrolledDown(),
    });
    const modalToOpen = modalToShow || '';
    if (modalToOpen === 'share') {
      clearTimeout(this.showShareModalTimer);
      this.showShareModalTimer = setTimeout(() => {
        AppObservableStore.setShowShareModal(true);
      }, 1000);
    } else if (modalToOpen === 'sic') { // sic = Shared Item Code
      if (sharedItemCode || '') {
        this.showShareItemModalTimer = setTimeout(() => {
          AppObservableStore.setShowSharedItemModal(sharedItemCode);
        }, 1000);
      }
    }
    if (apiCalming('activityNoticeListRetrieve', 10000)) {
      ActivityActions.activityNoticeListRetrieve();
    }
    AnalyticsActions.saveActionCandidate(VoterStore.electionId(), candidateWeVoteId);
  }

  // eslint-disable-next-line camelcase,react/sort-comp
  UNSAFE_componentWillReceiveProps (nextProps) {
    // console.log('Candidate componentWillReceiveProps');
    const { match: { params: nextParams } } = nextProps;
    const modalToOpen = nextParams.modal_to_show || '';
    if (modalToOpen === 'share') {
      clearTimeout(this.showShareModalTimer);
      this.showShareModalTimer = setTimeout(() => {
        AppObservableStore.setShowShareModal(true);
      }, 1000);
    } else if (modalToOpen === 'sic') { // sic = Shared Item Code
      const sharedItemCode = nextParams.shared_item_code || '';
      if (sharedItemCode) {
        clearTimeout(this.showShareModalItemTimer);
        this.this.showShareItemModalTimer = setTimeout(() => {
          AppObservableStore.setShowSharedItemModal(sharedItemCode);
        }, 1000);
      }
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    // This lifecycle method tells the component to NOT render if componentWillReceiveProps didn't see any changes
    if (this.state.allCachedPositionsForThisCandidateLength !== nextState.allCachedPositionsForThisCandidateLength) {
      // console.log('this.state.allCachedPositionsForThisCandidateLength:', this.state.allCachedPositionsForThisCandidateLength, ', nextState.allCachedPositionsForThisCandidateLength:', nextState.allCachedPositionsForThisCandidateLength);
      return true;
    }
    if (this.state.ballotItemDisplayName !== nextState.ballotItemDisplayName) {
      // console.log('this.state.ballotItemDisplayName:', this.state.ballotItemDisplayName, ', nextState.ballotItemDisplayName:', nextState.ballotItemDisplayName);
      return true;
    }
    if (this.state.candidateWeVoteId !== nextState.candidateWeVoteId) {
      // console.log('this.state.candidateWeVoteId:', this.state.candidateWeVoteId, ', nextState.candidateWeVoteId:', nextState.candidateWeVoteId);
      return true;
    }
    if (this.state.organizationWeVoteId !== nextState.organizationWeVoteId) {
      // console.log('this.state.organizationWeVoteId:', this.state.organizationWeVoteId, ', nextState.organizationWeVoteId:', nextState.organizationWeVoteId);
      return true;
    }
    if (this.state.scrolledDown !== nextState.scrolledDown) {
      // console.log('this.state.scrolledDown:', this.state.scrolledDown, ', nextState.scrolledDown:', nextState.scrolledDown);
      return true;
    }
    // console.log('Candidate shouldComponentUpdate FALSE');
    return false;
  }

  componentWillUnmount () {
    // console.log('Candidate componentWillUnmount');
    this.appStateSubscription.unsubscribe();
    this.candidateStoreListener.remove();
    this.voterGuideStoreListener.remove();
    clearTimeout(this.showShareModalTimer);
    clearTimeout(this.showShareItemModalTimer);
  }

  onAppObservableStoreChange () {
    this.setState({
      scrolledDown: AppObservableStore.getScrolledDown(),
    });
  }

  onCandidateStoreChange () {
    const { candidateWeVoteId } = this.state;
    // console.log('Candidate onCandidateStoreChange, candidateWeVoteId:', candidateWeVoteId);
    const allCachedPositionsForThisCandidate = CandidateStore.getAllCachedPositionsByCandidateWeVoteId(candidateWeVoteId);
    // console.log('allCachedPositionsForThisCandidate:', allCachedPositionsForThisCandidate);
    let allCachedPositionsForThisCandidateLength = 0;
    if (allCachedPositionsForThisCandidate) {
      allCachedPositionsForThisCandidateLength = allCachedPositionsForThisCandidate.length;
    }
    const candidate = CandidateStore.getCandidate(candidateWeVoteId);
    const { ballot_item_display_name: ballotItemDisplayName, google_civic_election_id: googleCivicElectionId } = candidate;
    if (googleCivicElectionId &&
      !VoterGuideStore.voterGuidesUpcomingFromFriendsStopped(googleCivicElectionId) &&
      !this.localVoterGuidesFromFriendsUpcomingHasBeenRetrievedOnce(googleCivicElectionId)
    ) {
      VoterGuideActions.voterGuidesFromFriendsUpcomingRetrieve(googleCivicElectionId);
      const { voterGuidesFromFriendsUpcomingHasBeenRetrievedOnce } = this.state;
      const googleCivicElectionIdInteger = convertToInteger(googleCivicElectionId);
      voterGuidesFromFriendsUpcomingHasBeenRetrievedOnce[googleCivicElectionIdInteger] = true;
      this.setState({
        voterGuidesFromFriendsUpcomingHasBeenRetrievedOnce,
      });
    }
    this.setState({
      ballotItemDisplayName,
      candidate,
      allCachedPositionsForThisCandidate,
      allCachedPositionsForThisCandidateLength,
    });
  }

  onVoterGuideStoreChange () {
    // console.log('Candidate onVoterGuideStoreChange');
    // Trigger an update of the candidate so we can get an updated position_list
    // CandidateActions.candidateRetrieve(this.state.candidateWeVoteId);
    // CandidateActions.positionListForBallotItemPublic(this.state.candidateWeVoteId);
  }

  goToBallot = () => {
    historyPush('/ballot');
  }

  openHowItWorksModal = () => {
    // console.log('Opening modal');
    AppObservableStore.setShowHowItWorksModal(true);
  }

  localPositionListHasBeenRetrievedOnce (candidateWeVoteId) {
    if (candidateWeVoteId) {
      const { positionListHasBeenRetrievedOnce } = this.state;
      return positionListHasBeenRetrievedOnce[candidateWeVoteId];
    }
    return false;
  }

  localPositionListFromFriendsHasBeenRetrievedOnce (candidateWeVoteId) {
    if (candidateWeVoteId) {
      const { positionListFromFriendsHasBeenRetrievedOnce } = this.state;
      return positionListFromFriendsHasBeenRetrievedOnce[candidateWeVoteId];
    }
    return false;
  }

  localVoterGuidesFromFriendsUpcomingHasBeenRetrievedOnce (googleCivicElectionId) {
    const googleCivicElectionIdInteger = convertToInteger(googleCivicElectionId);
    if (googleCivicElectionIdInteger) {
      const { voterGuidesFromFriendsUpcomingHasBeenRetrievedOnce } = this.state;
      return voterGuidesFromFriendsUpcomingHasBeenRetrievedOnce[googleCivicElectionIdInteger];
    }
    return false;
  }

  render () {
    renderLog('Candidate');  // Set LOG_RENDER_EVENTS to log all renders
    const { classes, match: { params } } = this.props;
    const { allCachedPositionsForThisCandidate, candidate, organizationWeVoteId, scrolledDown } = this.state;
    // console.log('candidate: ', candidate);
    if (!candidate || !candidate.ballot_item_display_name) {
      // console.log('No candidate or candidate.ballot_item_display_name, candidate:', candidate);
      return (
        <div className="container-fluid well u-stack--md u-inset--md">
          <div>{LoadingWheel}</div>
          <br />
        </div>
      );
    }
    // console.log('Candidate render');

    const candidateName = toTitleCase(candidate.ballot_item_display_name);
    const titleText = `${candidateName} - We Vote`;
    const descriptionText = `Information about ${candidateName}, candidate for ${candidate.contest_office_name}`;
    const voter = VoterStore.getVoter();
    const candidateAdminEditUrl = `${webAppConfig.WE_VOTE_SERVER_ROOT_URL}c/${candidate.id}/edit/?google_civic_election_id=${VoterStore.electionId()}&state_code=`;

    // TODO When we remove expandIssuesByDefault from CandidateItem, the page is pushed very wide. This needs to be fixed.
    //   This started happening when we implemented the flex-based "TwoColumns"
    return (
      <PageContentContainer>
        <SnackNotifier />
        <Helmet
          title={titleText}
          meta={[{ name: 'description', content: descriptionText }]}
        />
        {
          scrolledDown && (
            <CandidateStickyHeader candidate={candidate} />
          )
        }
        {/* The following style adjustment prevents horizontal scrolling from the .card style */}
        <div className="card" style={isWebApp() ? {} : { marginRight: 0, marginLeft: 0 }}>
          <TwoColumns>
            <LeftColumnWrapper>
              <Suspense fallback={<></>}>
                <CandidateItem
                  blockOnClickShowOrganizationModalWithPositions
                  candidateWeVoteId={candidate.we_vote_id}
                  expandIssuesByDefault
                  hideShowMoreFooter
                  organizationWeVoteId={organizationWeVoteId}
                  linkToOfficePage
                  showLargeImage
                  showOfficeName
                  showPositionStatementActionBar
                />
              </Suspense>
            </LeftColumnWrapper>
            <RightColumnWrapper className="u-show-desktop-tablet">
              <CandidateShareWrapper>
                <ShareButtonDesktopTablet candidateShare />
              </CandidateShareWrapper>
              {candidate.ballotpedia_candidate_url && (
                <ViewOnBallotpedia externalLinkUrl={candidate.ballotpedia_candidate_url} />
              )}
              {candidate.contest_office_name && (
                <SearchOnGoogle googleQuery={`${candidateName} ${candidate.contest_office_name}`} />
              )}
            </RightColumnWrapper>
          </TwoColumns>
        </div>
        { !!(allCachedPositionsForThisCandidate.length) && (
          <section className="card">
            <Suspense fallback={<></>}>
              <DelayedLoad showLoadingText waitBeforeShow={500}>
                <PositionList
                  incomingPositionList={allCachedPositionsForThisCandidate}
                  ballotItemDisplayName={candidate.ballot_item_display_name}
                  params={params}
                  positionListExistsTitle={(
                    <PositionListIntroductionText>
                      <Info classes={{ root: classes.informationIcon }} />
                      Opinions about this candidate are below. Use these filters to sort:
                    </PositionListIntroductionText>
                  )}
                />
              </DelayedLoad>
            </Suspense>
          </section>
        )}
        {(allCachedPositionsForThisCandidate.length < 3) && (
          <PromoteFurtherAction>
            <Suspense fallback={<></>}>
              <ViewUpcomingBallotButton onClickFunction={this.goToBallot} />
            </Suspense>
            <HowItWorksLink onClick={this.openHowItWorksModal}>
              How It Works
            </HowItWorksLink>
          </PromoteFurtherAction>
        )}
        <div className="u-show-desktop">
          <EndorsementCard
            bsPrefix="u-margin-top--sm u-stack--xs"
            variant="primary"
            buttonText="Endorsements missing?"
            text={`Are there endorsements for ${candidateName} that you expected to see?`}
          />
          <ThisIsMeAction
            kindOfOwner="POLITICIAN"
            nameBeingViewed={candidate.ballot_item_display_name}
            twitterHandleBeingViewed={candidate.twitter_handle}
          />
        </div>
        <br />
        {/* Show links to this candidate in the admin tools */}
        { (voter.is_admin || voter.is_verified_volunteer) && (
          <span className="u-wrap-links d-print-none">
            Admin only:
            <Suspense fallback={<></>}>
              <OpenExternalWebSite
                linkIdAttribute="candidateAdminEdit"
                url={candidateAdminEditUrl}
                target="_blank"
                className="open-web-site open-web-site__no-right-padding"
                body={(
                  <span>
                    edit
                    {' '}
                    {candidateName}
                  </span>
                )}
              />
            </Suspense>
          </span>
        )}
      </PageContentContainer>
    );
  }
}
Candidate.propTypes = {
  classes: PropTypes.object,
  match: PropTypes.object.isRequired,
};

const styles = () => ({
  informationIcon: {
    color: '#999',
    width: 16,
    height: 16,
    marginTop: '-3px',
    marginRight: 4,
  },
});

const CandidateShareWrapper = styled('div')`
  margin-bottom: 12px;
  padding-left: 2px;
`;

const LeftColumnWrapper = styled('div')`
  flex: 1 1 0;
`;

const HowItWorksLink = styled('div')`
  color: #065FD4;
  cursor: pointer;
  margin-top: 48px;
  &:hover {
    color: #4371cc;
  }
`;

const PositionListIntroductionText = styled('div')`
  color: #999;
`;

const PromoteFurtherAction = styled('div')`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-bottom: 48px;
  margin-top: 48px;
`;

const RightColumnWrapper = styled('div')`
  padding: 16px 16px 16px 0;
  width: fit-content;
`;

const TwoColumns = styled('div')`
  display: flex;
  margin: ${isAndroidSizeFold() ?  0  :  '0 -8px 0 -8px'};
`;

export default withStyles(styles)(Candidate);
