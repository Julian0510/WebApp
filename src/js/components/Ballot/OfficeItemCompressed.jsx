import withStyles from '@mui/styles/withStyles';
import withTheme from '@mui/styles/withTheme';
import PropTypes from 'prop-types';
import React, { Component, Suspense } from 'react';
import styled from 'styled-components';
import OfficeActions from '../../actions/OfficeActions';
import historyPush from '../../common/utils/historyPush';
import { isCordova } from '../../common/utils/isCordovaOrWebApp';
import { renderLog } from '../../common/utils/logging';
import normalizedImagePath from '../../common/utils/normalizedImagePath';
import toTitleCase from '../../common/utils/toTitleCase';
import AppObservableStore from '../../stores/AppObservableStore';
import BallotStore from '../../stores/BallotStore';
import CandidateStore from '../../stores/CandidateStore';
import SupportStore from '../../stores/SupportStore';
import { sortCandidateList } from '../../utils/positionFunctions';
import {
  OverflowContainer,
  PositionRowListEmptyWrapper,
  PositionRowListInnerWrapper,
  PositionRowListOneWrapper,
  PositionRowListOuterWrapper,
  PositionRowListScoreColumn,
  PositionRowListScoreHeader,
  PositionRowListScoreSpacer,
} from '../Style/PositionRowListStyles';
import signInModalGlobalState from '../Widgets/signInModalGlobalState';
import PositionRowEmpty from './PositionRowEmpty';
import PositionRowList from './PositionRowList';

const BallotItemSupportOpposeScoreDisplay = React.lazy(() => import(/* webpackChunkName: 'BallotItemSupportOpposeScoreDisplay' */ '../Widgets/ScoreDisplay/BallotItemSupportOpposeScoreDisplay'));
const DelayedLoad = React.lazy(() => import(/* webpackChunkName: 'DelayedLoad' */ '../../common/components/Widgets/DelayedLoad'));
const ImageHandler = React.lazy(() => import(/* webpackChunkName: 'ImageHandler' */ '../ImageHandler'));
const IssuesByBallotItemDisplayList = React.lazy(() => import(/* webpackChunkName: 'IssuesByBallotItemDisplayList' */ '../Values/IssuesByBallotItemDisplayList'));
const ItemActionBar = React.lazy(() => import(/* webpackChunkName: 'ItemActionBar' */ '../Widgets/ItemActionBar/ItemActionBar'));
const ShowMoreButtons = React.lazy(() => import(/* webpackChunkName: 'ShowMoreButtons' */ '../Widgets/ShowMoreButtons'));

const SHOW_ALL_CANDIDATES_IF_FEWER_THAN_THIS_NUMBER_OF_BALLOT_ITEMS = 5;
const NUMBER_OF_CANDIDATES_TO_DISPLAY = 3;

// This is related to components/VoterGuide/VoterGuideOfficeItemCompressed
class OfficeItemCompressed extends Component {
  targetRef = React.createRef();

  constructor (props) {
    super(props);
    this.state = {
      candidateListForDisplay: [],
      limitNumberOfCandidatesShownToThisNumber: NUMBER_OF_CANDIDATES_TO_DISPLAY,
      organizationWeVoteId: '',
      positionListFromFriendsHasBeenRetrievedOnce: {},
      positionListHasBeenRetrievedOnce: {},
      showAllCandidates: false,
    };

    this.getCandidateLink = this.getCandidateLink.bind(this);
    this.getOfficeLink = this.getOfficeLink.bind(this);
    this.goToCandidateLink = this.goToCandidateLink.bind(this);
    this.goToOfficeLink = this.goToOfficeLink.bind(this);
    // this.onClickShowOrganizationModalWithAllInfo = this.onClickShowOrganizationModalWithAllInfo.bind(this);
    this.onClickShowOrganizationModalWithBallotItemInfo = this.onClickShowOrganizationModalWithBallotItemInfo.bind(this);
    this.onClickShowOrganizationModalWithPositions = this.onClickShowOrganizationModalWithPositions.bind(this);
    this.showAllCandidates = this.showAllCandidates.bind(this);
    this.showLessCandidates = this.showLessCandidates.bind(this);
  }

  componentDidMount () {
    this.candidateStoreListener = CandidateStore.addListener(this.onCandidateStoreChange.bind(this));
    this.supportStoreListener = SupportStore.addListener(this.onSupportStoreChange.bind(this));
    this.onCandidateStoreChange();
    const { candidateList, officeWeVoteId } = this.props;
    let candidateListLength = 0;
    if (candidateList && candidateList.length > 0) {
      candidateListLength = candidateList.length;
    }
    this.setState({
      candidateListLength,
    });
    const organizationWeVoteId = (this.props.organization && this.props.organization.organization_we_vote_id) ? this.props.organization.organization_we_vote_id : this.props.organizationWeVoteId;
    // console.log('OfficeItemCompressed componentDidMount, organizationWeVoteId:', organizationWeVoteId);
    this.setState({
      organizationWeVoteId,
      // componentDidMount: true,
    });
    if (candidateList && candidateList.length && officeWeVoteId) {
      if (officeWeVoteId &&
        !this.localPositionListHasBeenRetrievedOnce(officeWeVoteId) &&
        !BallotStore.positionListHasBeenRetrievedOnce(officeWeVoteId)
      ) {
        OfficeActions.positionListForBallotItemPublic(officeWeVoteId);
        const { positionListHasBeenRetrievedOnce } = this.state;
        positionListHasBeenRetrievedOnce[officeWeVoteId] = true;
        this.setState({
          positionListHasBeenRetrievedOnce,
        });
      }
      if (officeWeVoteId &&
        !this.localPositionListFromFriendsHasBeenRetrievedOnce(officeWeVoteId) &&
        !BallotStore.positionListFromFriendsHasBeenRetrievedOnce(officeWeVoteId)
      ) {
        OfficeActions.positionListForBallotItemFromFriends(officeWeVoteId);
        const { positionListFromFriendsHasBeenRetrievedOnce } = this.state;
        positionListFromFriendsHasBeenRetrievedOnce[officeWeVoteId] = true;
        this.setState({
          positionListFromFriendsHasBeenRetrievedOnce,
        });
      }
    }
  }

  componentDidCatch (error, info) {
    // We should get this information to Splunk!
    console.error('OfficeItemCompressed caught error: ', `${error} with info: `, info);
  }

  componentWillUnmount () {
    this.candidateStoreListener.remove();
    this.supportStoreListener.remove();
  }

  // See https://reactjs.org/docs/error-boundaries.html
  static getDerivedStateFromError (error) { // eslint-disable-line no-unused-vars
    // Update state so the next render will show the fallback UI, We should have "Oh snap" page
    console.log('OfficeItemCompressed error:', error);
    return { hasError: true };
  }

  onCandidateStoreChange () {
    if (!signInModalGlobalState.get('textOrEmailSignInInProcess')) {
      // console.log('OfficeItemCompressed, onCandidateStoreChange');
      const { candidateList, officeWeVoteId } = this.props;
      let candidateListLength = 0;
      if (candidateList && candidateList.length > 0) {
        candidateListLength = candidateList.length;
      }
      this.setState({
        candidateListLength,
      });
      // console.log('OfficeItemCompressed onCandidateStoreChange', officeWeVoteId);
      let changeFound = false;
      if (candidateListLength && officeWeVoteId) {
        if (officeWeVoteId &&
          !this.localPositionListHasBeenRetrievedOnce(officeWeVoteId) &&
          !BallotStore.positionListHasBeenRetrievedOnce(officeWeVoteId)
        ) {
          OfficeActions.positionListForBallotItemPublic(officeWeVoteId);
          const { positionListHasBeenRetrievedOnce } = this.state;
          positionListHasBeenRetrievedOnce[officeWeVoteId] = true;
          this.setState({
            positionListHasBeenRetrievedOnce,
          });
        }
        if (officeWeVoteId &&
          !this.localPositionListFromFriendsHasBeenRetrievedOnce(officeWeVoteId) &&
          !BallotStore.positionListFromFriendsHasBeenRetrievedOnce(officeWeVoteId)
        ) {
          OfficeActions.positionListForBallotItemFromFriends(officeWeVoteId);
          const { positionListFromFriendsHasBeenRetrievedOnce } = this.state;
          positionListFromFriendsHasBeenRetrievedOnce[officeWeVoteId] = true;
          this.setState({
            positionListFromFriendsHasBeenRetrievedOnce,
          });
        }
        const candidateListForDisplay = [];
        let newCandidate = {};
        if (candidateList) {
          candidateList.forEach((candidate) => {
            if (candidate && candidate.we_vote_id) {
              newCandidate = CandidateStore.getCandidate(candidate.we_vote_id);
              if (newCandidate && newCandidate.we_vote_id) {
                candidateListForDisplay.push(newCandidate);
              } else {
                candidateListForDisplay.push(candidate);
              }
              if (!changeFound) {
                if (candidate.ballot_item_display_name !== newCandidate.ballot_item_display_name) {
                  changeFound = true;
                }
                if (candidate.candidate_photo_url_medium !== newCandidate.candidate_photo_url_medium) {
                  changeFound = true;
                }
                if (candidate.party !== newCandidate.party) {
                  changeFound = true;
                }
              }
            } else {
              candidateListForDisplay.push(candidate);
            }
          });
        }
        let sortedCandidateList = {};
        if (candidateListForDisplay && candidateListForDisplay.length) {
          sortedCandidateList = sortCandidateList(candidateListForDisplay);
          const { totalNumberOfBallotItems } = this.props;
          const limitCandidatesShownBecauseMoreThanDefaultNumberOfBallotItems = (totalNumberOfBallotItems && totalNumberOfBallotItems > SHOW_ALL_CANDIDATES_IF_FEWER_THAN_THIS_NUMBER_OF_BALLOT_ITEMS);
          if (!limitCandidatesShownBecauseMoreThanDefaultNumberOfBallotItems) {
            // If the ballot is only show 5 ballot items, then don't limit the number of candidates we show
            this.setState({
              limitNumberOfCandidatesShownToThisNumber: candidateList.length,
            });
          }
        }
        this.setState({
          candidateListForDisplay: sortedCandidateList,
          // changeFound,
        });
      }
    }
  }

  onSupportStoreChange () {
    // Trigger re-render, so we show/hide candidates as voter support changes
    this.setState({});
  }

  // onClickShowOrganizationModalWithAllInfo (candidateWeVoteId) {
  //   AppObservableStore.setOrganizationModalBallotItemWeVoteId(candidateWeVoteId);
  //   AppObservableStore.setShowOrganizationModal(true);
  // }

  onClickShowOrganizationModalWithBallotItemInfo (candidateWeVoteId) {
    AppObservableStore.setOrganizationModalBallotItemWeVoteId(candidateWeVoteId);
    AppObservableStore.setShowOrganizationModal(true);
    AppObservableStore.setHideOrganizationModalPositions(true);
  }

  onClickShowOrganizationModalWithPositions (candidateWeVoteId) {
    AppObservableStore.setOrganizationModalBallotItemWeVoteId(candidateWeVoteId);
    AppObservableStore.setShowOrganizationModal(true);
    AppObservableStore.setHideOrganizationModalBallotItemInfo(true);
  }

  getCandidateLink (candidateWeVoteId) {
    if (this.state.organizationWeVoteId) {
      // If there is an organizationWeVoteId, signal that we want to link back to voter_guide for that organization
      return `/candidate/${candidateWeVoteId}/btvg/${this.state.organizationWeVoteId}`;
    } else {
      // If no organizationWeVoteId, signal that we want to link back to default ballot
      return `/candidate/${candidateWeVoteId}/b/btdb`; // back-to-default-ballot
    }
  }

  getOfficeLink () {
    if (this.state.organizationWeVoteId) {
      // If there is an organizationWeVoteId, signal that we want to link back to voter_guide for that organization
      return `/office/${this.props.officeWeVoteId}/btvg/${this.state.organizationWeVoteId}`;
    } else {
      // If no organizationWeVoteId, signal that we want to link back to default ballot
      return `/office/${this.props.officeWeVoteId}/b/btdb`; // back-to-default-ballot
    }
  }

  generateCandidates = () => {
    const { candidateList, externalUniqueId } = this.props;
    let { candidatesToShowForSearchResults } = this.props;
    candidatesToShowForSearchResults = candidatesToShowForSearchResults || [];
    const { candidateListForDisplay, limitNumberOfCandidatesShownToThisNumber, showAllCandidates } = this.state;
    // If voter has chosen 1+ candidates, only show those
    const supportedCandidatesList = candidateList.filter((candidate) => candidatesToShowForSearchResults.includes(candidate.we_vote_id) || ((SupportStore.getVoterOpposesByBallotItemWeVoteId(candidate.we_vote_id) || SupportStore.getVoterSupportsByBallotItemWeVoteId(candidate.we_vote_id)) && !candidate.withdrawn_from_election));
    const candidatesToRender = (supportedCandidatesList.length && !showAllCandidates) ? supportedCandidatesList : candidateListForDisplay;
    const candidatesToRenderLength = candidatesToRender.length;
    const hideCandidateDetails = false; // supportedCandidatesList.length;
    let candidateCount = 0;
    return (
      <CandidatesContainer>
        { candidatesToRender.slice(0, limitNumberOfCandidatesShownToThisNumber)
          .map((oneCandidate) => {
            if (!oneCandidate || !oneCandidate.we_vote_id) {
              return null;
            }
            candidateCount += 1;
            const candidatePartyText = oneCandidate.party && oneCandidate.party.length ? `${oneCandidate.party}` : '';
            const avatarCompressed = `card-main__avatar-compressed${isCordova() ? '-cordova' : ''}`;
            const avatarBackgroundImage = normalizedImagePath('../img/global/svg-icons/avatar-generic.svg');

            return (
              <div key={`candidate_preview-${oneCandidate.we_vote_id}-${externalUniqueId}`}>
                <CandidateContainer>
                  <CandidateWrapper>
                    <CandidateInfo>
                      <CandidateTopRow>
                        <Candidate
                          id={`officeItemCompressedCandidateImageAndName-${oneCandidate.we_vote_id}-${externalUniqueId}`}
                          onClick={() => this.onClickShowOrganizationModalWithBallotItemInfo(oneCandidate.we_vote_id)}
                        >
                          {/* Candidate Image */}
                          <Suspense fallback={<></>}>
                            <ImageHandler
                              className={avatarCompressed}
                              sizeClassName="icon-candidate-small u-push--sm "
                              imageUrl={oneCandidate.candidate_photo_url_medium}
                              alt=""
                              kind_of_ballot_item="CANDIDATE"
                              style={{ backgroundImage: { avatarBackgroundImage } }}
                            />
                          </Suspense>
                          {/* Candidate Name */}
                          <div>
                            <CandidateName>
                              {oneCandidate.ballot_item_display_name}
                            </CandidateName>
                            <CandidateParty>
                              {candidatePartyText}
                            </CandidateParty>
                          </div>
                        </Candidate>
                        {/*  /!* Show check mark or score *!/ */}
                        <BallotItemSupportOpposeCountDisplayWrapper style={{ display: 'none' }}>
                          {/* u-show-mobile */}
                          <Suspense fallback={<></>}>
                            <BallotItemSupportOpposeScoreDisplay
                              ballotItemWeVoteId={oneCandidate.we_vote_id}
                              onClickFunction={this.onClickShowOrganizationModalWithPositions}
                            />
                          </Suspense>
                        </BallotItemSupportOpposeCountDisplayWrapper>
                      </CandidateTopRow>
                      <CandidateBottomRow>
                        {!hideCandidateDetails && (
                          <Suspense fallback={<></>}>
                            {/* If there is a quote about the candidate, show that. If not, show issues related to candidate */}
                            <DelayedLoad showLoadingText waitBeforeShow={500}>
                              <IssuesByBallotItemDisplayList
                                ballotItemDisplayName={oneCandidate.ballot_item_display_name}
                                ballotItemWeVoteId={oneCandidate.we_vote_id}
                                externalUniqueId={`officeItemCompressed-${oneCandidate.we_vote_id}-${externalUniqueId}`}
                              />
                            </DelayedLoad>
                          </Suspense>
                        )}
                        {!hideCandidateDetails && (
                          <ItemActionBarOutsideWrapper>
                            <Suspense fallback={<></>}>
                              <ItemActionBar
                                ballotItemWeVoteId={oneCandidate.we_vote_id}
                                ballotItemDisplayName={oneCandidate.ballot_item_display_name}
                                commentButtonHide
                                externalUniqueId={`OfficeItemCompressed-ItemActionBar-${oneCandidate.we_vote_id}-${externalUniqueId}`}
                                hidePositionPublicToggle
                                positionPublicToggleWrapAllowed
                                shareButtonHide
                              />
                            </Suspense>
                          </ItemActionBarOutsideWrapper>
                        )}
                      </CandidateBottomRow>
                    </CandidateInfo>
                  </CandidateWrapper>
                  <PositionRowListOuterWrapper>
                    {/*  className="u-show-desktop-tablet" */}
                    <OverflowContainer>
                      <PositionRowListInnerWrapper>
                        <PositionRowListOneWrapper>
                          <PositionRowList
                            ballotItemWeVoteId={oneCandidate.we_vote_id}
                            showSupport
                          />
                        </PositionRowListOneWrapper>
                        <PositionRowListOneWrapper>
                          <PositionRowList
                            ballotItemWeVoteId={oneCandidate.we_vote_id}
                            showOppose
                          />
                        </PositionRowListOneWrapper>
                        <PositionRowListOneWrapper>
                          <PositionRowList
                            ballotItemWeVoteId={oneCandidate.we_vote_id}
                            showInfoOnly
                          />
                        </PositionRowListOneWrapper>
                        <PositionRowListEmptyWrapper>
                          <PositionRowEmpty
                            ballotItemWeVoteId={oneCandidate.we_vote_id}
                          />
                        </PositionRowListEmptyWrapper>
                        <PositionRowListScoreColumn>
                          <PositionRowListScoreHeader>
                            Score
                          </PositionRowListScoreHeader>
                          <PositionRowListScoreSpacer>
                            <Suspense fallback={<></>}>
                              <BallotItemSupportOpposeScoreDisplay
                                ballotItemWeVoteId={oneCandidate.we_vote_id}
                                onClickFunction={this.onClickShowOrganizationModalWithPositions}
                                hideEndorsementsOverview
                                hideNumbersOfAllPositions
                              />
                            </Suspense>
                          </PositionRowListScoreSpacer>
                        </PositionRowListScoreColumn>
                      </PositionRowListInnerWrapper>
                    </OverflowContainer>
                  </PositionRowListOuterWrapper>
                </CandidateContainer>
                {((candidateCount < candidatesToRenderLength) && (candidateCount < limitNumberOfCandidatesShownToThisNumber)) && (
                  <div>
                    <HrSeparator />
                  </div>
                )}
              </div>
            );
          })}
      </CandidatesContainer>
    );
  }

  showAllCandidates () {
    this.setState({
      limitNumberOfCandidatesShownToThisNumber: 99,
      showAllCandidates: true,
    });
  }

  showLessCandidates () {
    this.setState({
      limitNumberOfCandidatesShownToThisNumber: NUMBER_OF_CANDIDATES_TO_DISPLAY,
      showAllCandidates: false,
    }, () => {
      this.targetRef.scrollIntoView({
        behavior: 'smooth',
      });
    });
  }

  goToCandidateLink (candidateWeVoteId) {
    const candidateLink = this.getCandidateLink(candidateWeVoteId);
    historyPush(candidateLink);
  }

  goToOfficeLink () {
    const officeLink = this.getOfficeLink();
    historyPush(officeLink);
  }

  localPositionListHasBeenRetrievedOnce (officeWeVoteId) {
    if (officeWeVoteId) {
      const { positionListHasBeenRetrievedOnce } = this.state;
      return positionListHasBeenRetrievedOnce[officeWeVoteId];
    }
    return false;
  }

  localPositionListFromFriendsHasBeenRetrievedOnce (officeWeVoteId) {
    if (officeWeVoteId) {
      const { positionListFromFriendsHasBeenRetrievedOnce } = this.state;
      return positionListFromFriendsHasBeenRetrievedOnce[officeWeVoteId];
    }
    return false;
  }

  render () {
    renderLog('OfficeItemCompressed');  // Set LOG_RENDER_EVENTS to log all renders
    // console.log('OfficeItemCompressed render');
    let { ballotItemDisplayName } = this.props;
    const { isFirstBallotItem, officeWeVoteId } = this.props; // classes
    const { limitNumberOfCandidatesShownToThisNumber, showAllCandidates } = this.state;
    ballotItemDisplayName = toTitleCase(ballotItemDisplayName);
    // If voter has chosen 1+ candidates, hide the "Show more" link
    const { candidateListLength } = this.state; // candidateList
    // const supportedCandidatesList = candidateList.filter((candidate) => (SupportStore.getVoterSupportsByBallotItemWeVoteId(candidate.we_vote_id) && !candidate.withdrawn_from_election));
    // const thereIsAtLeastOneSupportedCandidate = supportedCandidatesList.length > 0;
    // console.log('limitNumberOfCandidatesShownToThisNumber:', limitNumberOfCandidatesShownToThisNumber, ', candidateListLength:', candidateListLength);
    const moreCandidatesToDisplay = limitNumberOfCandidatesShownToThisNumber < candidateListLength;
    return (
      <OfficeItemCompressedWrapper>
        <a // eslint-disable-line
          className="anchor-under-header"
          name={officeWeVoteId}
        />
        <div
          id={`anchor-${officeWeVoteId}`}
          ref={(ref) => { this.targetRef = ref; }}
          style={isFirstBallotItem ? { position: 'absolute', top: '-325px', left: 0 } : { position: 'absolute', top: '-260px', left: 0 }}
        />
        <OfficeNameH2>
          {ballotItemDisplayName}
        </OfficeNameH2>
        {/* *************************
          Display either a) the candidates the voter supports, or b) the first several candidates running for this office
          ************************* */}
        {this.generateCandidates()}

        {(moreCandidatesToDisplay) ? (
          <Suspense fallback={<></>}>
            <ShowMoreButtons
              showMoreId={`officeItemCompressedShowMoreFooter-${officeWeVoteId}`}
              showMoreButtonsLink={() => this.showAllCandidates()}
              showMoreCustomText={`show all ${candidateListLength} candidates`}
            />
          </Suspense>
        ) : (
          <>
            {(showAllCandidates && candidateListLength > NUMBER_OF_CANDIDATES_TO_DISPLAY) && (
              <Suspense fallback={<></>}>
                <ShowMoreButtons
                  showMoreId={`officeItemCompressedShowLessFooter-${officeWeVoteId}`}
                  showMoreButtonsLink={() => this.showLessCandidates()}
                  showMoreButtonWasClicked
                  showLessCustomText="show fewer candidates"
                />
              </Suspense>
            )}
          </>
        )}
      </OfficeItemCompressedWrapper>
    );
  }
}
OfficeItemCompressed.propTypes = {
  officeWeVoteId: PropTypes.string.isRequired,
  ballotItemDisplayName: PropTypes.string.isRequired,
  candidateList: PropTypes.array,
  candidatesToShowForSearchResults: PropTypes.array,
  // classes: PropTypes.object,
  externalUniqueId: PropTypes.string,
  isFirstBallotItem: PropTypes.bool,
  organization: PropTypes.object,
  organizationWeVoteId: PropTypes.string,
  totalNumberOfBallotItems: PropTypes.number,
};

const styles = (theme) => ({
  buttonRoot: {
    fontSize: 12,
    padding: 4,
    minWidth: 60,
    height: 30,
    [theme.breakpoints.down('md')]: {
      minWidth: 60,
      height: 30,
    },
    [theme.breakpoints.down('sm')]: {
      width: 'fit-content',
      minWidth: 50,
      height: 30,
      padding: '0 8px',
      fontSize: 10,
    },
  },
});

const BallotItemSupportOpposeCountDisplayWrapper = styled('div')`
  cursor: pointer;
  float: right;
`;

const Candidate = styled('div')`
  display: flex;
  flex-grow: 8;
`;

const CandidateBottomRow = styled('div')`
  margin-top: 4px;
`;

const CandidateContainer = styled('div')`
  display: flex;
  justify-content: flex-start;
  padding: 10px 5px;
`;

const CandidateInfo = styled('div')(({ theme }) => (`
  border: 1px solid #fff;
  display: block;
  height: 100%;
  margin: 0 !important;
  padding: 8px !important;
  transition: all 200ms ease-in;
  ${theme.breakpoints.down('md')} {
    padding: 8px 8px 4px 8px !important;
  }
`));

const CandidateName = styled('h4')`
  color: #4371cc;
  font-weight: 400;
  font-size: 20px;
  margin-bottom: 0 !important;
  min-width: 124px;
  &:hover {
    text-decoration: underline;
  }
`;

const CandidateParty = styled('div')`
  color: #555;
`;

const CandidatesContainer = styled('div')`
  height: 100%;
  margin: 0px -10px;
  min-width: 0;
  width: 100%;
`;

const CandidateTopRow = styled('div')`
  cursor: pointer;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
`;

const CandidateWrapper = styled('div')(({ theme }) => (`
  width: 320px;
  ${theme.breakpoints.down('sm')} {
    width: 100%;
  }
  ${theme.breakpoints.up('sm')} {
    // margin-left: 48px;
    min-width: 320px;
  }
`));

const HrSeparator = styled('hr')`
  width: 95%;
`;

const ItemActionBarOutsideWrapper = styled('div')`
  display: flex;
  cursor: pointer;
  flex-direction: row;
  justify-content: flex-start;
  margin-top: 12px;
  width: 100%;
`;

const OfficeNameH2 = styled('div')(({ theme }) => (`
  // For some reason if styled('h2') it breaks down
  font-size: 32px;
  margin-bottom: 6px;
  width: fit-content;
  ${theme.breakpoints.down('sm')} {
    font-size: 28px;
  }
`));

const OfficeItemCompressedWrapper = styled('div')`
  display: flex;
  border: 1px solid #fff;
  flex-direction: column;
  margin-bottom: 60px;
  position: relative;
`;

export default withTheme(withStyles(styles)(OfficeItemCompressed));
