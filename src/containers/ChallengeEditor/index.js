import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter, Route } from 'react-router-dom'
import ChallengeEditorComponent from '../../components/ChallengeEditor'
import ChallengeViewComponent from '../../components/ChallengeEditor/ChallengeView'
import Loader from '../../components/Loader'

import {
  loadMetadata,
  // loadTimelineTemplates,
  // loadChallengePhases,
  // loadChallengeTypes,
  // loadChallengeTracks,
  // loadChallengeTimelines,
  // loadChallengeTags,
  // loadChallengeTerms,
  loadGroups,
  loadChallengeDetails,
  createAttachment,
  removeAttachment,
  loadResources,
  // loadResourceRoles,
  updateChallengeDetails
} from '../../actions/challenges'
import {
  loadMemberDetails
} from '../../actions/members'

import { connect } from 'react-redux'

class ChallengeEditor extends Component {
  componentDidMount () {
    const {
      match,
      loadMetadata,
      // loadTimelineTemplates,
      // loadChallengePhases,
      // loadChallengeTypes,
      // loadChallengeTracks,
      // loadChallengeTimelines,
      // loadChallengeTags,
      // loadChallengeTerms,
      loadGroups,
      // loadResourceRoles,
      loadChallengeDetails,
      loadResources
    } = this.props
    loadMetadata()
    // loadTimelineTemplates()
    // loadChallengePhases()
    // loadChallengeTypes()
    // loadChallengeTracks()
    // loadChallengeTimelines()
    // loadChallengeTags()
    // loadChallengeTerms()
    loadGroups()
    // loadResourceRoles()
    this.fetchChallengeDetails(match, loadChallengeDetails, loadResources)

    // this.unlisten = this.props.history.listen(() => {
    //   const { isLoading } = this.props
    //   if (!isLoading) {
    //     const { match: newMatch, loadChallengeDetails, loadResources } = this.props
    //     this.fetchChallengeDetails(newMatch, loadChallengeDetails, loadResources)
    //   }
    // })
  }

  componentWillUnmount () {
    // this.unlisten()
  }

  componentWillReceiveProps (nextProps) {
    const { match, challengeDetails } = this.props
    const { match: newMatch, loadChallengeDetails, loadResources, challengeDetails: nextChallengeDetails } = nextProps
    const projectId = _.get(newMatch.params, 'projectId', null)
    const challengeId = _.get(newMatch.params, 'challengeId', null)
    if (_.get(match.params, 'projectId', null) !== projectId || _.get(match.params, 'challengeId', null) !== challengeId) {
      this.fetchChallengeDetails(newMatch, loadChallengeDetails, loadResources)
    }

    // this section is called only one time as soon challenge details are loaded
    if (
      _.get(challengeDetails, 'id') !== _.get(nextChallengeDetails, 'id') &&
      challengeId === _.get(nextChallengeDetails, 'id')
    ) {
      this.loadAssignedMemberDetails(nextProps)
    }
  }

  /**
   * Load assign member details if challenge has a member assigned
   * @param {Object} nextProps the latest props
   */
  loadAssignedMemberDetails (nextProps) {
    // cannot use `loadMemberDetails` form the `nextProps` because linter complains about unused prop
    const { loadMemberDetails } = this.props
    const { challengeDetails } = nextProps
    const assignedMemberId = _.get(challengeDetails, 'task.memberId')

    if (assignedMemberId) {
      loadMemberDetails(assignedMemberId)
    }
  }

  fetchChallengeDetails (newMatch, loadChallengeDetails, loadResources) {
    const projectId = _.get(newMatch.params, 'projectId', null)
    const challengeId = _.get(newMatch.params, 'challengeId', null)
    loadResources(challengeId)
    loadChallengeDetails(projectId, challengeId)
  }

  render () {
    const {
      match,
      isLoading,
      challengeDetails,
      challengeResources,
      metadata,
      createAttachment,
      attachments,
      token,
      removeAttachment,
      failedToLoad,
      projectDetail,
      updateChallengeDetails,
      members
    } = this.props
    const challengeId = _.get(match.params, 'challengeId', null)
    if (challengeId && (!challengeDetails || !challengeDetails.id)) {
      return (<Loader />)
    }
    const assignedMemberId = _.get(challengeDetails, 'task.memberId')
    const assignedMemberDetails = _.find(members, (member) => member.userId.toString() === assignedMemberId)
    return <div>
      <Route
        exact
        path={this.props.match.path}
        render={({ match }) => ((
          <ChallengeEditorComponent
            isLoading={isLoading}
            challengeDetails={challengeDetails}
            challengeResources={challengeResources}
            metadata={metadata}
            projectId={_.get(match.params, 'projectId', null)}
            challengeId={challengeId}
            isNew={!_.has(match.params, 'challengeId')}
            uploadAttachment={createAttachment}
            attachments={attachments}
            token={token}
            removeAttachment={removeAttachment}
            failedToLoad={failedToLoad}
            projectDetail={projectDetail}
            assignedMemberDetails={assignedMemberDetails}
            updateChallengeDetails={updateChallengeDetails}
          />
        ))
        } />
      <Route
        exact
        path={`${this.props.match.path}/edit`}
        render={({ match }) => ((
          <ChallengeEditorComponent
            isLoading={isLoading}
            challengeDetails={challengeDetails}
            challengeResources={challengeResources}
            metadata={metadata}
            projectId={_.get(match.params, 'projectId', null)}
            challengeId={challengeId}
            isNew={!_.has(match.params, 'challengeId')}
            uploadAttachment={createAttachment}
            attachments={attachments}
            token={token}
            removeAttachment={removeAttachment}
            failedToLoad={failedToLoad}
            projectDetail={projectDetail}
            assignedMemberDetails={assignedMemberDetails}
            updateChallengeDetails={updateChallengeDetails}
          />
        ))
        } />
      <Route
        exact
        path={`${this.props.match.path}/view`}
        render={({ match }) => ((
          <ChallengeViewComponent
            isLoading={isLoading}
            metadata={metadata}
            projectDetail={projectDetail}
            challenge={challengeDetails}
            challengeResources={challengeResources}
            token={token}
            challengeId={challengeId}
            assignedMemberDetails={assignedMemberDetails}
          />
        ))
        } />
    </div>
  }
}

ChallengeEditor.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string,
    params: PropTypes.shape({
      challengeId: PropTypes.string,
      projectId: PropTypes.string
    })
  }).isRequired,
  loadMetadata: PropTypes.func,
  // loadTimelineTemplates: PropTypes.func,
  // loadChallengePhases: PropTypes.func,
  // loadChallengeTypes: PropTypes.func,
  // loadChallengeTracks: PropTypes.func,
  // loadChallengeTimelines: PropTypes.func,
  // loadChallengeTags: PropTypes.func,
  // loadChallengeTerms: PropTypes.func,
  loadGroups: PropTypes.func,
  loadChallengeDetails: PropTypes.func,
  loadResources: PropTypes.func,
  // loadResourceRoles: PropTypes.func,
  challengeResources: PropTypes.arrayOf(PropTypes.object),
  challengeDetails: PropTypes.object,
  projectDetail: PropTypes.object,
  // history: PropTypes.object,
  metadata: PropTypes.shape({
    challengeTypes: PropTypes.array
  }),
  isLoading: PropTypes.bool,
  createAttachment: PropTypes.func,
  attachments: PropTypes.arrayOf(PropTypes.shape()),
  token: PropTypes.string,
  removeAttachment: PropTypes.func,
  failedToLoad: PropTypes.bool,
  loadMemberDetails: PropTypes.func,
  updateChallengeDetails: PropTypes.func,
  members: PropTypes.arrayOf(PropTypes.shape())
}

const mapStateToProps = ({ projects: { projectDetail }, challenges: { challengeDetails, challengeResources, metadata, isLoading, attachments, failedToLoad }, auth: { token }, members: { members } }) => ({
  challengeDetails,
  projectDetail,
  challengeResources,
  metadata,
  isLoading,
  attachments,
  token,
  failedToLoad,
  members
})

const mapDispatchToProps = {
  loadMetadata,
  loadChallengeDetails,
  // loadTimelineTemplates,
  // loadChallengePhases,
  // loadChallengeTypes,
  // loadChallengeTracks,
  // loadChallengeTimelines,
  // loadChallengeTags,
  loadGroups,
  createAttachment,
  removeAttachment,
  // loadChallengeTerms,
  loadResources,
  // loadResourceRoles,
  loadMemberDetails,
  updateChallengeDetails
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChallengeEditor))
