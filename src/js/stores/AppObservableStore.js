import { Subject } from 'rxjs';
import VoterActions from '../actions/VoterActions';   // eslint-disable-line import/no-cycle
import stringContains from '../common/utils/stringContains';
import webAppConfig from '../config';
import { dumpObjProps } from '../utils/appleSiliconUtils';
import $ajax from '../utils/service';

const subject = new Subject();

function isCordovaLocal () {
  const { cordova } = window;
  return cordova !== undefined;
}

export const messageService = {
  sendMessage: (message) => subject.next({ text: message }),
  clearMessages: () => subject.next(),
  getMessage: () => subject.asObservable(),
};

const nonFluxState = {
  activityTidbitWeVoteIdForDrawer: '',
  chosenGoogleAnalyticsTrackingID: false,
  chosenPreventSharingOpinions: false,
  chosenReadyIntroductionText: '',
  chosenReadyIntroductionTitle: '',
  chosenSiteLogoUrl: '',
  currentPathname: '',
  getStartedMode: '',
  getVoterGuideSettingsDashboardEditMode: '',
  googleAnalyticsEnabled: false,
  googleAnalyticsPending: false,
  hideOrganizationModalBallotItemInfo: false,
  hideOrganizationModalPositions: false,
  hideWeVoteLogo: false,
  hostname: '',
  observableUpdateCounter: 0,
  organizationModalBallotItemWeVoteId: '',
  pendingSnackMessage: '',
  pendingSnackSeverity: '',
  scrolledDown: false,
  setUpAccountBackLinkPath: '',
  setUpAccountEntryPath: '',
  shareModalStep: '',
  sharedItemCode: '',
  showActivityTidbitDrawer: false,
  showAdviserIntroModal: false,
  showAskFriendsModal: false,
  showChooseOrOpposeIntroModal: false,
  showEditAddressButton: false,
  showElectionsWithOrganizationVoterGuidesModal: false,
  showHeader: 0,
  showHowItWorksModal: false,
  showNewVoterGuideModal: false,
  showOrganizationModal: false,
  showPaidAccountUpgradeModal: false,
  showPersonalizedScoreIntroModal: false,
  showPositionDrawer: false,
  showSelectBallotModal: false,
  showSelectBallotModalEditAddress: false,
  showShareModal: false,
  showSharedItemModal: false,
  showSignInModal: false,
  showTwitterLandingPage: false,
  showVoterPlanModal: false,
  signInStateChanged: false,
  siteConfigurationHasBeenRetrieved: false,
  siteOwnerOrganizationWeVoteId: '',
  storeSignInStartFullUrl: false,
  viewingOrganizationVoterGuide: false,
  voterBallotItemsRetrieveHasBeenCalled: false,
  voterExternalIdHasBeenSavedOnce: {}, // Dict with externalVoterId and membershipOrganizationWeVoteId as keys, and true/false as value
  voterFirstRetrieveInitiated: false,
};


export default {
  incrementObservableUpdateCounter () {
    nonFluxState.observableUpdateCounter += 1;
    messageService.sendMessage('state incremented ObservableUpdateCounter');
  },

  setActivityTidbitWeVoteIdForDrawer (activityTidbitWeVoteId) {
    nonFluxState.activityTidbitWeVoteIdForDrawer = activityTidbitWeVoteId;
    messageService.sendMessage('state updated activityTidbitWeVoteIdForDrawer');
  },

  setActivityTidbitWeVoteIdForDrawerAndOpen (setActivityTidbitWeVoteIdForDrawerAndOpen) {
    nonFluxState.activityTidbitWeVoteIdForDrawerAndOpen = setActivityTidbitWeVoteIdForDrawerAndOpen;
    messageService.sendMessage('state updated activityTidbitWeVoteIdForDrawerAndOpen');
  },

  setCurrentPathname (currentPathname) {
    nonFluxState.currentPathname = currentPathname;
  },

  setEvaluateHeaderDisplay () {
    // Force the Header to evaluate whether it should display
    nonFluxState.showHeader = Date.now();
    messageService.sendMessage('state updated showHeader');
  },

  setGoogleAnalyticsEnabled (enabled) {
    nonFluxState.googleAnalyticsEnabled = enabled;
    messageService.sendMessage('state updated googleAnalyticsEnabled');
  },

  setGoogleAnalyticsPending (enabled) {
    nonFluxState.googleAnalyticsPending = enabled;
    messageService.sendMessage('state updated googleAnalyticsPending');
  },

  setGetStartedMode (getStartedMode) {
    nonFluxState.getStartedMode = getStartedMode;
    messageService.sendMessage('state updated getStartedMode');
  },

  setHideOrganizationModalBallotItemInfo (hide) {
    nonFluxState.hideOrganizationModalBallotItemInfo = hide;
    messageService.sendMessage('state updated hideOrganizationModalBallotItemInfo');
  },

  setHideOrganizationModalPositions (hide) {
    nonFluxState.hideOrganizationModalPositions = hide;
    messageService.sendMessage('state updated hideOrganizationModalPositions');
  },

  setOrganizationModalBallotItemWeVoteId (ballotItemWeVoteId) {
    nonFluxState.organizationModalBallotItemWeVoteId = ballotItemWeVoteId;
    messageService.sendMessage('state updated organizationModalBallotItemWeVoteId');
  },

  setPendingSnackMessage (message, severity) {
    nonFluxState.pendingSnackMessage = message;
    nonFluxState.pendingSnackSeverity = severity;
  },

  setPositionDrawerBallotItemWeVoteId (ballotItemWeVoteId) {
    nonFluxState.positionDrawerBallotItemWeVoteId = ballotItemWeVoteId;
    messageService.sendMessage('state updated positionDrawerBallotItemWeVoteId');
  },

  setPositionDrawerOrganizationWeVoteId (organizationWeVoteId) {
    nonFluxState.positionDrawerOrganizationWeVoteId = organizationWeVoteId;
    messageService.sendMessage('state updated positionDrawerOrganizationWeVoteId');
  },

  setScrolled (scrolledDown) {
    nonFluxState.scrolledDown = scrolledDown;
    messageService.sendMessage('state updated scrolledDown');
  },

  setSetUpAccountBackLinkPath (backLinkPath) {
    // console.log('setShareModalStep, step:', step);
    nonFluxState.setUpAccountBackLinkPath = backLinkPath;
    messageService.sendMessage('state updated setUpAccountBackLinkPath');
  },

  setSetUpAccountEntryPath (entryPath) {
    // console.log('setShareModalStep, step:', step);
    nonFluxState.setUpAccountEntryPath = entryPath;
    messageService.sendMessage('state updated setSetUpAccountEntryPath');
  },

  setShareModalStep (step) {
    // console.log('setShareModalStep, step:', step);
    nonFluxState.shareModalStep = step;
    messageService.sendMessage('state updated shareModalStep');
  },

  setShowActivityTidbitDrawer (show) {
    nonFluxState.showActivityTidbitDrawer = show;
    messageService.sendMessage('state updated showActivityTidbitDrawer');
  },

  setShowAdviserIntroModal (show) {
    nonFluxState.showAdviserIntroModal = show;
    messageService.sendMessage('state updated showAdviserIntroModal');
  },

  setShowAskFriendsModal (show) {
    nonFluxState.showAskFriendsModal = show;
    messageService.sendMessage('state updated showAskFriendsModal');
  },

  setShowChooseOrOpposeIntroModal (show, ballotItemType = 'CANDIDATE') {
    nonFluxState.showChooseOrOpposeIntroModal = show;
    nonFluxState.showChooseOrOpposeIntroModalBallotItemType = ballotItemType;
    messageService.sendMessage('state updated showChooseOrOpposeIntroModal');
  },

  setShowEditAddressButton (show) {
    nonFluxState.showEditAddressButton = show;
    messageService.sendMessage('state updated showEditAddressButton');
  },

  setShowElectionsWithOrganizationVoterGuidesModal (show) {
    nonFluxState.showElectionsWithOrganizationVoterGuidesModal = show;
    messageService.sendMessage('state updated showElectionsWithOrganizationVoterGuidesModal');
  },

  setShowFirstPositionIntroModal (show) {
    nonFluxState.showFirstPositionIntroModal = show;
    messageService.sendMessage('state updated showFirstPositionIntroModal');
  },

  setShowHowItWorksModal (show) {
    // The chosenPaidAccount values are: free, professional, enterprise
    nonFluxState.showHowItWorksModal = show;
    messageService.sendMessage('state updated showHowItWorksModal');
  },

  setShowImageUploadModal (show) {
    // console.log('Setting image upload modal to open!');
    nonFluxState.showImageUploadModal = show;
    messageService.sendMessage('state updated showImageUploadModal');
  },

  setShowNewVoterGuideModal (show) {
    nonFluxState.showNewVoterGuideModal = show;
    messageService.sendMessage('state updated showNewVoterGuideModal');
  },

  setShowOrganizationModal (show) {
    // console.log("Setting organizationModal to ", show);
    nonFluxState.showOrganizationModal = show;
    messageService.sendMessage('state updated showOrganizationModal');
  },

  setShowPaidAccountUpgradeModal (chosenPaidAccount) {
    // The chosenPaidAccount values are: free, professional, enterprise
    nonFluxState.showPaidAccountUpgradeModal = chosenPaidAccount;
    messageService.sendMessage('state updated showPaidAccountUpgradeModal');
  },

  setShowPersonalizedScoreIntroModal (show) {
    nonFluxState.showPersonalizedScoreIntroModal = show;
    messageService.sendMessage('state updated showPersonalizedScoreIntroModal');
  },

  setShowPositionDrawer (show) {
    nonFluxState.showPositionDrawer = show;
    messageService.sendMessage('state updated showPositionDrawer');
  },

  setShowSelectBallotModal (showSelectBallotModal, showSelectBallotModalEditAddress = false) {
    nonFluxState.showSelectBallotModalEditAddress = showSelectBallotModalEditAddress;
    nonFluxState.showSelectBallotModal = showSelectBallotModal;
    // console.log('setShowSelectBallotModal showSelectBallotModalEditAddress:', showSelectBallotModalEditAddress);
    messageService.sendMessage('state updated showSelectBallotModal, showSelectBallotModalEditAddress');
  },

  setShowSelectBallotModalOnly (showSelectBallotModal) {
    nonFluxState.showSelectBallotModal = showSelectBallotModal;
    messageService.sendMessage('state updated showSelectBallotModalOnly');
  },

  setShowShareModal (show) {
    // The chosenPaidAccount values are: free, professional, enterprise
    nonFluxState.showShareModal = show;
    messageService.sendMessage('state updated showShareModal');
  },

  setShowSharedItemModal (sharedItemCode) {
    nonFluxState.sharedItemCode = sharedItemCode;
    nonFluxState.showSharedItemModal = Boolean(sharedItemCode);
    messageService.sendMessage('state updated showSharedItemModal');
  },

  setShowSignInModal (show) {
    nonFluxState.showSignInModal = show;
    messageService.sendMessage('state updated showSignInModal');
  },

  setShowTwitterLandingPage (show) {
    nonFluxState.showTwitterLandingPage = show;
    messageService.sendMessage('state updated showTwitterLandingPage');
  },

  setShowValuesIntroModal (show) {
    nonFluxState.showValuesIntroModal = show;
    messageService.sendMessage('state updated showValuesIntroModal');
  },

  setShowVoterPlanModal (show) {
    // The chosenPaidAccount values are: free, professional, enterprise
    nonFluxState.showVoterPlanModal = show;
    messageService.sendMessage('state updated showVoterPlanModal');
  },

  setSignInStateChanged (signin) {
    nonFluxState.signInStateChanged = signin;
    messageService.sendMessage('state updated signInStateChanged');
  },

  setSignInStartFullUrl () {
    nonFluxState.storeSignInStartFullUrl = true;
    messageService.sendMessage('state updated storeSignInStartFullUrl');
  },

  setViewingOrganizationVoterGuide (isViewing) {
    nonFluxState.viewingOrganizationVoterGuide = isViewing;
    messageService.sendMessage('state updated viewingOrganizationVoterGuide');
  },

  setVoterGuideSettingsDashboardEditMode (getVoterGuideSettingsDashboardEditMode) {
    nonFluxState.getVoterGuideSettingsDashboardEditMode = getVoterGuideSettingsDashboardEditMode;
    messageService.sendMessage('state updated getVoterGuideSettingsDashboardEditMode');
  },

  setVoterBallotItemsRetrieveHasBeenCalled (voterBallotItemsRetrieveHasBeenCalled) {
    nonFluxState.voterBallotItemsRetrieveHasBeenCalled = voterBallotItemsRetrieveHasBeenCalled;
    messageService.sendMessage('state updated voterBallotItemsRetrieveHasBeenCalled');
  },

  setVoterFirstRetrieveInitiated (voterFirstRetrieveInitiated) {
    nonFluxState.voterFirstRetrieveInitiated = voterFirstRetrieveInitiated;
    messageService.sendMessage('state updated voterFirstRetrieveInitiated');
  },

  unsetStoreSignInStartFullUrl () {
    nonFluxState.unsetStoreSignInStartFullUrl = false;
    messageService.sendMessage('state updated unsetStoreSignInStartFullUrl');
  },

  getActivityTidbitWeVoteIdForDrawer () {
    return nonFluxState.activityTidbitWeVoteIdForDrawer;
  },

  getChosenAboutOrganizationExternalUrl () {
    return nonFluxState.chosenAboutOrganizationExternalUrl;
  },

  getChosenGoogleAnalyticsTrackingID () {
    return nonFluxState.chosenGoogleAnalyticsTrackingID;
  },

  getChosenPreventSharingOpinions () {
    return nonFluxState.chosenPreventSharingOpinions;
  },

  getChosenReadyIntroductionText () {
    return nonFluxState.chosenReadyIntroductionText;
  },

  getChosenReadyIntroductionTitle () {
    return nonFluxState.chosenReadyIntroductionTitle;
  },

  getChosenSiteLogoUrl () {
    return nonFluxState.chosenSiteLogoUrl;
  },

  getCurrentPathname () {
    return nonFluxState.currentPathname;
  },

  getPositionDrawerBallotItemWeVoteId () {
    return nonFluxState.positionDrawerBallotItemWeVoteId;
  },

  getPositionDrawerOrganizationWeVoteId () {
    return nonFluxState.positionDrawerOrganizationWeVoteId;
  },

  getGoogleAnalyticsEnabled () {
    return nonFluxState.googleAnalyticsEnabled;
  },

  getGoogleAnalyticsPending () {
    return nonFluxState.googleAnalyticsPending;
  },

  getHideWeVoteLogo () {
    return nonFluxState.hideWeVoteLogo;
  },

  getHostname () {
    return nonFluxState.hostname || '';
  },

  getOrganizationModalBallotItemWeVoteId () {
    return nonFluxState.organizationModalBallotItemWeVoteId;
  },

  getPendingSnackMessage () {
    return nonFluxState.pendingSnackMessage;
  },

  getPendingSnackSeverity () {
    return nonFluxState.pendingSnackSeverity;
  },

  getScrolledDown () {
    return nonFluxState.scrolledDown;
  },

  getSetUpAccountBackLinkPath () {
    return nonFluxState.setUpAccountBackLinkPath;
  },

  getSetUpAccountEntryPath () {
    return nonFluxState.setUpAccountEntryPath;
  },

  getSharedItemCode () {
    return nonFluxState.sharedItemCode;
  },

  getShareModalStep () {
    // console.log('AppObservableStore shareModalStep:', nonFluxState.shareModalStep);
    return nonFluxState.shareModalStep;
  },

  getShowTwitterLandingPage () {
    // console.log('AppObservableStore getShowTwitterLandingPage:', nonFluxState.showTwitterLandingPage);
    return nonFluxState.showTwitterLandingPage;
  },

  getSignInStateChanged () {
    return nonFluxState.signInStateChanged;
  },

  getSiteOwnerOrganizationWeVoteId () {
    return nonFluxState.siteOwnerOrganizationWeVoteId;
  },

  getStartedMode () {
    return nonFluxState.getStartedMode;
  },

  getViewingOrganizationVoterGuide () {
    return nonFluxState.viewingOrganizationVoterGuide;
  },

  getVoterGuideSettingsDashboardEditMode () {
    return nonFluxState.getVoterGuideSettingsDashboardEditMode;
  },

  hideOrganizationModalBallotItemInfo () {
    return nonFluxState.hideOrganizationModalBallotItemInfo;
  },

  hideOrganizationModalPositions () {
    return nonFluxState.hideOrganizationModalPositions;
  },

  isSnackMessagePending () {
    return nonFluxState.pendingSnackMessage && nonFluxState.pendingSnackMessage.length > 0;
  },

  isOnWeVoteRootUrl () {
    const weVoteURL = nonFluxState.onWeVoteRootUrl || false;
    return weVoteURL || isCordovaLocal() || stringContains('localhost:', window.location.href) || stringContains('ngrok.io', window.location.href);
  },

  isOnWeVoteSubdomainUrl () {
    return nonFluxState.onWeVoteSubdomainUrl;
  },

  isOnPartnerUrl () {
    return nonFluxState.onWeVoteSubdomainUrl || nonFluxState.onChosenFullDomainUrl;
  },

  isVoterAdminForThisUrl (linkedOrganizationWeVoteId) {
    // const linkedOrganizationWeVoteId = VoterStore.getLinkedOrganizationWeVoteId();
    return nonFluxState.siteOwnerOrganizationWeVoteId === linkedOrganizationWeVoteId;
  },

  isOnFacebookSupportedDomainUrl () {
    return nonFluxState.onFacebookSupportedDomainUrl;
  },

  isOnChosenFullDomainUrl () {
    return nonFluxState.onChosenFullDomainUrl;
  },

  showingOneCompleteYourProfileModal () {
    return nonFluxState.showAdviserIntroModal ||
      nonFluxState.showFirstPositionIntroModal ||
      nonFluxState.showHowItWorksModal ||
      nonFluxState.showPersonalizedScoreIntroModal ||
      nonFluxState.showSelectBallotModal ||
      nonFluxState.showSharedItemModal ||
      nonFluxState.showValuesIntroModal;
  },

  showActivityTidbitDrawer () {
    return nonFluxState.showActivityTidbitDrawer;
  },

  showAdviserIntroModal () {
    return nonFluxState.showAdviserIntroModal;
  },

  showAskFriendsModal () {
    return nonFluxState.showAskFriendsModal;
  },

  showChooseOrOpposeIntroModal () {
    return nonFluxState.showChooseOrOpposeIntroModal;
  },

  showEditAddressButton () {
    return nonFluxState.showEditAddressButton;
  },

  showElectionsWithOrganizationVoterGuidesModal () {
    return nonFluxState.showElectionsWithOrganizationVoterGuidesModal;
  },

  showFirstPositionIntroModal () {
    return nonFluxState.showFirstPositionIntroModal;
  },

  showHowItWorksModal () {
    return nonFluxState.showHowItWorksModal;
  },

  showVoterPlanModal () {
    return nonFluxState.showVoterPlanModal;
  },

  showNewVoterGuideModal () {
    return nonFluxState.showNewVoterGuideModal;
  },

  showPaidAccountUpgradeModal () {
    // The chosenPaidAccount values are: free, professional, enterprise
    return nonFluxState.showPaidAccountUpgradeModal;
  },

  showPersonalizedScoreIntroModal () {
    return nonFluxState.showPersonalizedScoreIntroModal;
  },

  showPositionDrawer () {
    return nonFluxState.showPositionDrawer;
  },

  showShareModal () {
    return nonFluxState.showShareModal;
  },

  showSharedItemModal () {
    return nonFluxState.showSharedItemModal;
  },

  showSelectBallotModal () {
    return nonFluxState.showSelectBallotModal;
  },

  showSelectBallotModalEditAddress () {
    return nonFluxState.showSelectBallotModalEditAddress;
  },

  showSignInModal () {
    return nonFluxState.showSignInModal;
  },

  showOrganizationModal () {
    return nonFluxState.showOrganizationModal;
  },

  showValuesIntroModal () {
    return nonFluxState.showValuesIntroModal;
  },

  showImageUploadModal () {
    return nonFluxState.showImageUploadModal;
  },

  siteConfigurationHasBeenRetrieved () {
    return nonFluxState.siteConfigurationHasBeenRetrieved;
  },

  siteConfigurationRetrieve (hostname, externalVoterId = '', refresh_string = '') {
    $ajax({
      endpoint: 'siteConfigurationRetrieve',
      data: { hostname, refresh_string },
      success: (res) => {
        // console.log('AppObservableStore siteConfigurationRetrieve success, res:', res);
        const {
          status: apiStatus,
          success: apiSuccess,
          hostname: hostFromApi,
          organization_we_vote_id: siteOwnerOrganizationWeVoteId,
          chosen_about_organization_external_url: chosenAboutOrganizationExternalUrl,
          chosen_google_analytics_tracking_id: chosenGoogleAnalyticsTrackingID,
          chosen_hide_we_vote_logo: hideWeVoteLogo,
          chosen_logo_url_https: chosenSiteLogoUrl,
          chosen_prevent_sharing_opinions: chosenPreventSharingOpinions,
          chosen_ready_introduction_text: chosenReadyIntroductionText,
          chosen_ready_introduction_title: chosenReadyIntroductionTitle,
        } = res;
        let newHostname = hostFromApi;
        if (apiSuccess) {
          let onWeVoteRootUrl = false;
          let onWeVoteSubdomainUrl = false;
          let onFacebookSupportedDomainUrl = false;
          let onChosenFullDomainUrl = false;

          if (isCordovaLocal()) {
            newHostname = webAppConfig.WE_VOTE_HOSTNAME;
          }

          // console.log('siteConfigurationRetrieve hostname:', hostname);
          if (newHostname === 'wevote.us' || newHostname === 'quality.wevote.us' || newHostname === 'localhost') {
            onWeVoteRootUrl = true;
          } else if (stringContains('wevote.us', newHostname)) {
            onWeVoteSubdomainUrl = true;
          } else {
            onChosenFullDomainUrl = true;
          }
          // May 2021: This code doesn't need an API call to generate an answer, abandoning querying the store to get the answer
          if (newHostname === 'wevote.us' || newHostname === 'quality.wevote.us' || newHostname === 'localhost' || isCordovaLocal()) {
            // We should move this to the server if we can't change the Facebook sign in root url
            onFacebookSupportedDomainUrl = true;
          }
          // console.log('AppObservableStore externalVoterId:', externalVoterId, ', siteOwnerOrganizationWeVoteId:', siteOwnerOrganizationWeVoteId);
          const { voterExternalIdHasBeenSavedOnce } = nonFluxState;
          if (externalVoterId && siteOwnerOrganizationWeVoteId) {
            if (!this.voterExternalIdHasBeenSavedOnce(externalVoterId, siteOwnerOrganizationWeVoteId)) {
              // console.log('voterExternalIdHasBeenSavedOnce has NOT been saved before.');
              VoterActions.voterExternalIdSave(externalVoterId, siteOwnerOrganizationWeVoteId);
              if (!voterExternalIdHasBeenSavedOnce[externalVoterId]) {
                voterExternalIdHasBeenSavedOnce[externalVoterId] = {};
              }
              voterExternalIdHasBeenSavedOnce[externalVoterId][siteOwnerOrganizationWeVoteId] = true;
              // AnalyticsActions.saveActionBallotVisit(VoterStore.electionId());
            } else {
              // console.log('voterExternalIdHasBeenSavedOnce has been saved before.');
            }
          }
          nonFluxState.apiStatus = apiStatus;
          nonFluxState.apiSuccess = apiSuccess;
          nonFluxState.chosenAboutOrganizationExternalUrl = chosenAboutOrganizationExternalUrl;
          nonFluxState.chosen_google_analytics_tracking_id = chosenGoogleAnalyticsTrackingID;
          nonFluxState.chosenPreventSharingOpinions = chosenPreventSharingOpinions;
          nonFluxState.chosenReadyIntroductionText = chosenReadyIntroductionText;
          nonFluxState.chosenReadyIntroductionTitle = chosenReadyIntroductionTitle;
          nonFluxState.chosenSiteLogoUrl = chosenSiteLogoUrl;
          nonFluxState.hideWeVoteLogo = hideWeVoteLogo;
          nonFluxState.hostname = newHostname;
          nonFluxState.onChosenFullDomainUrl = onChosenFullDomainUrl;
          nonFluxState.onFacebookSupportedDomainUrl = onFacebookSupportedDomainUrl;
          nonFluxState.onWeVoteSubdomainUrl = onWeVoteSubdomainUrl;
          nonFluxState.onWeVoteRootUrl = onWeVoteRootUrl;
          nonFluxState.siteConfigurationHasBeenRetrieved = true;
          nonFluxState.siteOwnerOrganizationWeVoteId = siteOwnerOrganizationWeVoteId;
          nonFluxState.voterExternalIdHasBeenSavedOnce = voterExternalIdHasBeenSavedOnce;
        }
      },

      error: (res) => {
        console.error('AppObservableStore error: ', res);
        dumpObjProps('AppObservableStore error', res);
      },
    });
  },

  voterBallotItemsRetrieveHasBeenCalled () {
    return nonFluxState.voterBallotItemsRetrieveHasBeenCalled;
  },

  voterFirstRetrieveInitiated () {
    return nonFluxState.voterFirstRetrieveInitiated;
  },
};
