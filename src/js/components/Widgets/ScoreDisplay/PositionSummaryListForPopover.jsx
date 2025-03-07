import { CheckCircle, ThumbDown, ThumbUp } from '@mui/icons-material';
import styled from 'styled-components';
import withStyles from '@mui/styles/withStyles';
import withTheme from '@mui/styles/withTheme';
import PropTypes from 'prop-types';
import React, { Component, Suspense } from 'react';
import { ReactSVG } from 'react-svg';
import normalizedImagePath from '../../../common/utils/normalizedImagePath';
import { cleanArray } from '../../../utils/textFormat';
import FriendsIcon from '../FriendsIcon';
import PositionItemScorePopoverTextOnly from './PositionItemScorePopoverTextOnly';

const FollowToggle = React.lazy(() => import(/* webpackChunkName: 'FollowToggle' */ '../FollowToggle'));
const MaterialUIPopover = React.lazy(() => import(/* webpackChunkName: 'MaterialUIPopover' */ '../MaterialUIPopover'));
const ShowMoreFooter = React.lazy(() => import(/* webpackChunkName: 'ShowMoreFooter' */ '../../Navigation/ShowMoreFooter'));

class PositionSummaryListForPopover extends Component {
  constructor (props) {
    super(props);
    this.state = {
      // positionSummaryListLength: 0,
    };
  }

  componentDidMount () {
  }

  showAllPositions () {
    const { ballotItemWeVoteId } = this.props;
    if (this.props.showAllPositions) {
      this.props.showAllPositions(ballotItemWeVoteId);
    }
  }

  render () {
    const {
      ballotItemWeVoteId, classes, controlAdviserMaterialUIPopoverFromProp, openAdviserMaterialUIPopover, positionSummaryList,
      voterPersonalNetworkScore, voterPersonalNetworkScoreIsNegative, voterPersonalNetworkScoreIsPositive,
      voterPersonalNetworkScoreWithSign,
    } = this.props;

    let numberDisplayedSoFar = 0;
    let numberNotDisplayed = 0;
    const maximumNumberOfScoreToShow = 25;
    let openAdviserMaterialUIPopoverNow = false;
    let controlAdviserMaterialUIPopoverFromPropNow = false;
    const renderedList = positionSummaryList.map((positionSummary) => {
      numberDisplayedSoFar += 1;
      // Only show the first 25
      if (numberDisplayedSoFar > maximumNumberOfScoreToShow) {
        numberNotDisplayed += 1;
        return null;
      }
      if ((numberDisplayedSoFar === 1)) {
        // console.log('controlAdviserMaterialUIPopoverFromProp:', controlAdviserMaterialUIPopoverFromProp);
        // console.log('openAdviserMaterialUIPopover:', openAdviserMaterialUIPopover);
        // console.log('numberDisplayedSoFar:', numberDisplayedSoFar);
        if (controlAdviserMaterialUIPopoverFromProp) {
          openAdviserMaterialUIPopoverNow = Boolean(openAdviserMaterialUIPopover);
          controlAdviserMaterialUIPopoverFromPropNow = true;
        }
      } else {
        openAdviserMaterialUIPopoverNow = false;
        controlAdviserMaterialUIPopoverFromPropNow = false;
      }
      // console.log('openAdviserMaterialUIPopoverNow:', openAdviserMaterialUIPopoverNow);
      // console.log('controlAdviserMaterialUIPopoverFromPropNow:', controlAdviserMaterialUIPopoverFromPropNow);
      let issuesInCommonForIconDisplayArray;
      if (positionSummary.issuesInCommonBetweenOrganizationAndVoter.length > 4) {
        issuesInCommonForIconDisplayArray = positionSummary.issuesInCommonBetweenOrganizationAndVoter.slice(0, 3);
      } else {
        issuesInCommonForIconDisplayArray = positionSummary.issuesInCommonBetweenOrganizationAndVoter;
      }
      return (
        <PositionSummaryWrapper
          key={`onePositionForPopover-${positionSummary.ballotItemWeVoteId}-${positionSummary.organizationWeVoteId}-${positionSummary.organizationName}`}
        >
          {positionSummary.organizationSupports && !positionSummary.organizationInVotersNetwork && (
            <SupportButNotPartOfScore>
              <ThumbUp classes={{ root: classes.endorsementIcon }} />
            </SupportButNotPartOfScore>
          )}
          {positionSummary.organizationSupports && positionSummary.organizationInVotersNetwork && (
            <SupportAndPartOfScore>
              <Suspense fallback={<></>}>
                <MaterialUIPopover
                  popoverDisplayObject={(
                    <PositionItemScorePopoverTextOnly
                      positionItem={positionSummary.positionObject}
                    />
                  )}
                >
                  <span>
                    +1
                  </span>
                </MaterialUIPopover>
              </Suspense>
            </SupportAndPartOfScore>
          )}
          {positionSummary.organizationOpposes && !positionSummary.organizationInVotersNetwork && (
            <OpposeButNotPartOfScore>
              <ThumbDown classes={{ root: classes.endorsementIcon }} />
            </OpposeButNotPartOfScore>
          )}
          {positionSummary.organizationOpposes && positionSummary.organizationInVotersNetwork && (
            <OpposeAndPartOfScore>
              <Suspense fallback={<></>}>
                <MaterialUIPopover
                  popoverDisplayObject={(
                    <PositionItemScorePopoverTextOnly
                      positionItem={positionSummary.positionObject}
                    />
                  )}
                >
                  <span>
                    -1
                  </span>
                </MaterialUIPopover>
              </Suspense>
            </OpposeAndPartOfScore>
          )}
          {positionSummary.organizationInVotersNetwork ? (
            <OrganizationNameWrapperWithPopover>
              <Suspense fallback={<></>}>
                <MaterialUIPopover
                  controlAdviserMaterialUIPopoverFromProp={controlAdviserMaterialUIPopoverFromPropNow}
                  externalUniqueId={positionSummary.organizationWeVoteId}
                  openAdviserMaterialUIPopover={openAdviserMaterialUIPopoverNow}
                  popoverDisplayObject={(
                    <PositionItemScorePopoverTextOnly
                      positionItem={positionSummary.positionObject}
                    />
                  )}
                >
                  <div>
                    {positionSummary.organizationName}
                  </div>
                </MaterialUIPopover>
              </Suspense>
            </OrganizationNameWrapperWithPopover>
          ) : (
            <OrganizationNameWrapper>
              {positionSummary.organizationName}
            </OrganizationNameWrapper>
          )}
          {(positionSummary.voterCanFollowOrganization && !positionSummary.organizationInVotersNetwork) && (
            <FollowToggleWrapper>
              <Suspense fallback={<></>}>
                <FollowToggle
                  addToScoreLabelOn
                  organizationWeVoteId={positionSummary.organizationWeVoteId}
                  lightModeOn
                  hideDropdownButtonUntilFollowing
                />
              </Suspense>
            </FollowToggleWrapper>
          )}
          {!!(positionSummary.organizationInVotersNetwork) && (
            <IconsOuterWrapper>
              <Suspense fallback={<></>}>
                <MaterialUIPopover
                  popoverDisplayObject={(
                    <PositionItemScorePopoverTextOnly
                      positionItem={positionSummary.positionObject}
                    />
                  )}
                >
                  <OrganizationPopoverWrapper>
                    {!!(positionSummary.issuesInCommonBetweenOrganizationAndVoter && positionSummary.issuesInCommonBetweenOrganizationAndVoter.length) && (
                      // Limits the number of displayed Issue icons
                      // The popover isn't big enough to accommodate more than 4 icons without making them too small!
                      <VoterAndOrganizationShareTheseIssuesWrapper>
                        {issuesInCommonForIconDisplayArray.map((issue) => (
                          <IssueIcon key={`issueInScore-${issue.issue_we_vote_id}`}>
                            <ReactSVG
                              src={normalizedImagePath(`/img/global/svg-icons/issues/${issue.issue_icon_local_path}.svg`)}
                              beforeInjection={(svg) => svg.setAttribute('style', { fill: '#555', padding: '1px 1px 1px 0px', width: '24px' })}
                            />
                          </IssueIcon>
                        ))}
                      </VoterAndOrganizationShareTheseIssuesWrapper>
                    )}
                    {(positionSummary.issuesInCommonBetweenOrganizationAndVoter.length > 4) ? ('...') : null}
                    {positionSummary.voterIsFriendsWithThisOrganization ? (
                      <FollowingWrapper>
                        {/* <CheckCircle className="friends-icon" /> */}
                        <FriendsIcon />
                      </FollowingWrapper>
                    ) : (
                      <>
                        {positionSummary.voterIsFollowingOrganization && (
                          <FollowingWrapper>
                            <CheckCircle className="following-icon" />
                          </FollowingWrapper>
                        )}
                      </>
                    )}
                  </OrganizationPopoverWrapper>
                </MaterialUIPopover>
              </Suspense>
            </IconsOuterWrapper>
          )}
        </PositionSummaryWrapper>
      );
    });
    if (numberNotDisplayed > 0) {
      renderedList.push(
        <ShowXMoreWrapper
          key={`onePositionForPopoverShowXMore-${ballotItemWeVoteId}`}
        >
          +
          {numberNotDisplayed}
          {' '}
          more
        </ShowXMoreWrapper>,
      );
    }
    if (voterPersonalNetworkScore === 0 || voterPersonalNetworkScoreIsNegative || voterPersonalNetworkScoreIsPositive) {
      renderedList.push(
        <VoterPersonalNetworkScoreSumLineWrapper
          key={`onePositionForPopoverPersonalNetworkScoreSumLine-${ballotItemWeVoteId}`}
        >
          <NetworkScoreSumLine />
        </VoterPersonalNetworkScoreSumLineWrapper>,
        <VoterPersonalNetworkScoreWrapper
          key={`onePositionForPopoverPersonalNetworkScore-${ballotItemWeVoteId}`}
        >
          { voterPersonalNetworkScore === 0 ? (
            <NetworkScoreSmall voterPersonalNetworkScoreIsNegative={voterPersonalNetworkScoreIsNegative} voterPersonalNetworkScoreIsPositive={voterPersonalNetworkScoreIsPositive}>
              0
            </NetworkScoreSmall>
          ) : (
            <NetworkScoreSmall voterPersonalNetworkScoreIsNegative={voterPersonalNetworkScoreIsNegative} voterPersonalNetworkScoreIsPositive={voterPersonalNetworkScoreIsPositive}>
              { voterPersonalNetworkScoreWithSign }
            </NetworkScoreSmall>
          )}
          <NetworkScoreDescriptionText>
            Total Personalized Score
          </NetworkScoreDescriptionText>
        </VoterPersonalNetworkScoreWrapper>,
      );
    }
    if (this.props.showAllPositions) {
      renderedList.push(
        <ShowMoreFooterWrapper key={`onePositionForPopoverShowAllPositions-${ballotItemWeVoteId}`}>
          <Suspense fallback={<></>}>
            <ShowMoreFooter
              showMoreId={`onePositionForPopoverShowAllPositions-${ballotItemWeVoteId}`}
              showMoreLink={() => this.showAllPositions()}
              showMoreText="Show all positions"
            />
          </Suspense>
        </ShowMoreFooterWrapper>,
      );
    }
    return cleanArray(renderedList);
  }
}
PositionSummaryListForPopover.propTypes = {
  ballotItemWeVoteId: PropTypes.string,
  classes: PropTypes.object,
  controlAdviserMaterialUIPopoverFromProp: PropTypes.bool,
  openAdviserMaterialUIPopover: PropTypes.bool,
  positionSummaryList: PropTypes.array,
  showAllPositions: PropTypes.func,
  voterPersonalNetworkScore: PropTypes.number,
  voterPersonalNetworkScoreIsNegative: PropTypes.bool,
  voterPersonalNetworkScoreIsPositive: PropTypes.bool,
  voterPersonalNetworkScoreWithSign: PropTypes.string,
};

const styles = () => ({
  endorsementIcon: {
    width: 12,
    height: 12,
  },
  popoverTypography: {
    padding: 5,
  },
});

const FollowToggleWrapper = styled('div')`
`;

const FollowingWrapper = styled('div')`
  color: #0d546f !important;
`;

const IconsOuterWrapper = styled('div')`
`;

const IssueIcon = styled('div')`
  font-weight: bold;
  font-size: 16px;
  width: 24px;
`;

const NetworkScoreDescriptionText = styled('div')`
  align-items: center;
  display: flex;
  font-size: 14px;
  margin-left: 6px;
`;

const NetworkScoreSmall = styled('div', {
  shouldForwardProp: (prop) => !['voterPersonalNetworkScoreIsNegative', 'voterPersonalNetworkScoreIsPositive'].includes(prop),
})(({ voterPersonalNetworkScoreIsNegative, voterPersonalNetworkScoreIsPositive }) => (`
  background: ${(voterPersonalNetworkScoreIsNegative && 'rgb(255, 73, 34)') || (voterPersonalNetworkScoreIsPositive && 'rgb(31, 192, 111)') || '#888'};
  color: white;
  box-shadow: 0 1px 3px 0 rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 2px 1px -1px rgba(0,0,0,.12);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 5px;
  float: left;
  font-size: 14px;
  font-weight: bold;
  @media print{
    border-width: 1 px;
    border-style: solid;
    border-color: ${(voterPersonalNetworkScoreIsNegative && 'rgb(255, 73, 34)') || (voterPersonalNetworkScoreIsPositive && 'rgb(31, 192, 111)') || '#888'};
  }
`));

const NetworkScoreSumLine = styled('div')`
  background: #2E3C5D;
  border-radius: 2px;
  width: 40px;
  height: 3px;
  margin-left: -5px;
`;

const OpposeAndPartOfScore = styled('div')(({ theme }) => (`
  background: ${theme.colors.opposeRedRgb};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  min-width: 20px;
  height: 20px;
  border-radius: 5px;
  float: right;
  font-size: 10px;
  font-weight: bold;
  margin-right: 6px;
  @media print{
    border: 2px solid grey;
  }
`));

const OpposeButNotPartOfScore = styled('div')(({ theme }) => (`
  color: ${theme.colors.opposeRedRgb};
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  min-width: 20px;
  height: 20px;
  border-radius: 5px;
  float: left;
  border: 2px solid ${theme.colors.opposeRedRgb};
  font-size: 10px;
  font-weight: bold;
  margin-right: 6px;
`));

const OrganizationNameWrapper = styled('div')`
  flex-grow: 8;
  padding-right: 8px;
`;

const OrganizationNameWrapperWithPopover = styled('div')`
  cursor: pointer;
  flex-grow: 8;
  padding-right: 8px;
`;

const OrganizationPopoverWrapper = styled('div')`
  cursor: pointer;
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
`;

const PositionSummaryWrapper = styled('div')`
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
`;

const ShowMoreFooterWrapper = styled('div')`
  margin-top: 10px;
`;

const ShowXMoreWrapper = styled('div')(({ theme }) => (`
  color: ${theme.colors.grayMid};
  font-size: 16px;
  font-style: italic;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`));

const SupportAndPartOfScore = styled('div')(({ theme }) => (`
  background: ${theme.colors.supportGreenRgb};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  min-width: 20px;
  height: 20px;
  border-radius: 5px;
  float: right;
  font-size: 10px;
  font-weight: bold;
  margin-right: 6px;
  @media print{
    border: 2px solid grey;
  }
`));

const SupportButNotPartOfScore = styled('div')(({ theme }) => (`
  color: ${theme.colors.supportGreenRgb};
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  min-width: 20px;
  height: 20px;
  border-radius: 5px;
  border: 2px solid ${theme.colors.supportGreenRgb};
  float: left;
  font-size: 10px;
  font-weight: bold;
  margin-right: 6px;
`));

const VoterAndOrganizationShareTheseIssuesWrapper  = styled('div')`
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
`;

const VoterPersonalNetworkScoreWrapper = styled('div')`
  display: flex;
  flex-wrap: nowrap;
  margin-top: 3px;
  justify-content: flex-start;
`;

const VoterPersonalNetworkScoreSumLineWrapper = styled('div')`
  display: flex;
  flex-wrap: nowrap;
  margin-top: 10px;
  justify-content: flex-start;
`;

export default withTheme(withStyles(styles)(PositionSummaryListForPopover));
