/**
 * Component to render a row for ChallengeList component
 */
import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import { withRouter, Link } from 'react-router-dom'
import moment from 'moment'
import 'moment-duration-format'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile, faUser } from '@fortawesome/free-solid-svg-icons'
import ChallengeStatus from '../ChallengeStatus'
import Modal from '../../Modal'
import ChallengeTag from '../ChallengeTag'
import styles from './ChallengeCard.module.scss'
import { getFormattedDuration } from '../../../util/date'
import { CHALLENGE_STATUS, COMMUNITY_APP_URL, DIRECT_PROJECT_URL, ONLINE_REVIEW_URL } from '../../../config/constants'
import { OutlineButton, PrimaryButton } from '../../Buttons'
const { patchChallenge } = require('../../../services/challenges')

const theme = {
  container: styles.modalContainer
}

const STALLED_MSG = 'Stalled'
const DRAFT_MSG = 'In Draft'
const STALLED_TIME_LEFT_MSG = 'Challenge is currently on hold'
const FF_TIME_LEFT_MSG = 'Winner is working on fixes'

/**
 * Format the remaining time of a challenge phase
 * @param phase Challenge phase
 * @param status Challenge status
 * @returns {*}
 */
const getTimeLeft = (phase, status) => {
  if (!phase) return STALLED_TIME_LEFT_MSG
  if (phase.phaseType === 'Final Fix') {
    return FF_TIME_LEFT_MSG
  }

  let time = moment(phase.scheduledEndTime).diff()
  const late = time < 0
  if (late) time = -time

  if (status !== CHALLENGE_STATUS.COMPLETED) {
    const duration = getFormattedDuration(time)
    return late ? `Late by ${duration}` : `${duration} to go`
  }

  return moment(phase.scheduledEndTime).format('DD/MM/YYYY')
}

/**
 * Find current phase and remaining time of it
 * @param c Challenge
 * @returns {{phaseMessage: string, endTime: {late, text}}}
 */
const getPhaseInfo = (c) => {
  const { allPhases, currentPhases, subTrack, status } = c
  let checkPhases = (currentPhases && currentPhases.length > 0 ? currentPhases : allPhases)
  if (_.isEmpty(checkPhases)) checkPhases = []
  let statusPhase = checkPhases
    .filter(p => p.phaseType !== 'Registration')
    .sort((a, b) => moment(a.scheduledEndTime).diff(b.scheduledEndTime))[0]

  if (!statusPhase && subTrack === 'FIRST_2_FINISH' && checkPhases.length) {
    statusPhase = Object.clone(checkPhases[0])
    statusPhase.phaseType = 'Submission'
  }
  let phaseMessage = STALLED_MSG
  if (statusPhase) phaseMessage = statusPhase.phaseType
  else if (status === 'DRAFT') phaseMessage = DRAFT_MSG

  const endTime = getTimeLeft(statusPhase)
  return { phaseMessage, endTime }
}

/**
 * Render components when mouse hover
 * @param challenge
 * @param onUpdateLaunch
 * @returns {*}
 */
const hoverComponents = (challenge, onUpdateLaunch, showError) => {
  const communityAppUrl = `${COMMUNITY_APP_URL}/challenges/${challenge.id}`
  const directUrl = `${DIRECT_PROJECT_URL}/contest/detail?projectId=${challenge.legacyId}`
  const orUrl = `${ONLINE_REVIEW_URL}/review/actions/ViewProjectDetails?pid=${challenge.legacyId}`
  const showLegacyError = () => {
    if (showError) {
      showError((<span>The legacy processor has not yet given this challenge a legacy ID. Please wait a few minutes or contact <a href='mailto: support@topcoder.com'>support@topcoder.com</a></span>))
    }
  }

  switch (challenge.status.toUpperCase()) {
    case CHALLENGE_STATUS.DRAFT:
    case CHALLENGE_STATUS.ACTIVE:
    default:
      return challenge.legacyId ? (
        <div className={styles.linkGroup}>
          <div className={styles.linkGroupLeft} onClick={() => {
            window.location.href = communityAppUrl
          }}>
            <a className={styles.link} href={communityAppUrl}>View Challenge</a>
            <div className={styles.linkGroupLeftBottom}>
              <a onClick={(e) => e.stopPropagation()} className={styles.link} href={directUrl} target='_blank'>Direct</a>
              <span>|</span>
              <a onClick={(e) => e.stopPropagation()} className={styles.link} href={orUrl} target='_blank'>OR</a>
            </div>
          </div>
          {
            challenge.status === 'Draft' && (
              <button className={styles.activateButton} onClick={() => onUpdateLaunch()}>
                <span>Activate</span>
              </button>
            )
          }
        </div>
      ) : (
        <div className={styles.linkGroup}>
          <div className={styles.linkGroupLeft} onClick={() => {
            window.location.href = communityAppUrl
          }}>
            <a className={styles.link} href={communityAppUrl}>View Challenge</a>
            <div className={styles.linkGroupLeftBottom}>
              <a onClick={(e) => {
                e.stopPropagation()
                showLegacyError()
              }} className={styles.link}>Direct</a>
              <span>|</span>
              <a onClick={(e) => {
                e.stopPropagation()
                showLegacyError()
              }} className={styles.link}>OR</a>
            </div>
          </div>
          {
            challenge.status === 'Draft' && (
              <button className={styles.activateButton} onClick={() => onUpdateLaunch()}>
                <span>Activate</span>
              </button>
            )
          }
        </div>
      )
  }
}

const renderStatus = (status) => {
  switch (status) {
    case CHALLENGE_STATUS.ACTIVE:
    case CHALLENGE_STATUS.NEW:
    case CHALLENGE_STATUS.DRAFT:
    case CHALLENGE_STATUS.COMPLETED:
      return (<ChallengeStatus status={status} />)
    default:
      return (<span className={styles.statusText}>{status}</span>)
  }
}

class ChallengeCard extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isConfirm: false,
      isLaunch: false,
      isSaving: false
    }
    this.onUpdateConfirm = this.onUpdateConfirm.bind(this)
    this.onUpdateLaunch = this.onUpdateLaunch.bind(this)
    this.resetModal = this.resetModal.bind(this)
    this.onLaunchChallenge = this.onLaunchChallenge.bind(this)
  }

  onUpdateConfirm (value) {
    this.setState({ isConfirm: value })
  }

  onUpdateLaunch () {
    if (!this.state.isLaunch) {
      this.setState({ isLaunch: true })
    }
  }

  resetModal () {
    this.setState({ isConfirm: false, isLaunch: false })
  }

  async onLaunchChallenge () {
    if (this.state.isSaving) return
    const { challenge } = this.props
    try {
      this.setState({ isSaving: true })
      const response = await patchChallenge(challenge.id, { status: 'Active' })
      this.setState({ isLaunch: true, isConfirm: response.data.id, isSaving: false })
    } catch (e) {
      this.setState({ isSaving: false })
    }
  }

  render () {
    const { isLaunch, isConfirm, isSaving } = this.state
    const { challenge, shouldShowCurrentPhase, reloadChallengeList } = this.props
    const { phaseMessage, endTime } = getPhaseInfo(challenge)
    return (
      <div className={styles.item}>
        { isLaunch && !isConfirm && (
          <Modal theme={theme} onCancel={() => this.resetModal()}>
            <div className={styles.contentContainer}>
              <div className={styles.title}>Launch Challenge Confirmation</div>
              <span>{`Do you want to launch ${challenge.type} challenge "${challenge.name}"?`}</span>
              <div className={styles.buttonGroup}>
                <div className={styles.button}>
                  <OutlineButton className={cn({ disabled: isSaving })} text={'Cancel'} type={'danger'} onClick={() => this.resetModal()} />
                </div>
                <div className={styles.button}>
                  <PrimaryButton text={isSaving ? 'Launching...' : 'Confirm'} type={'info'} onClick={() => this.onLaunchChallenge()} />
                </div>
              </div>
            </div>
          </Modal>
        )
        }
        { isLaunch && isConfirm && (
          <Modal theme={theme} onCancel={reloadChallengeList}>
            <div className={cn(styles.contentContainer, styles.confirm)}>
              <div className={styles.title}>Success</div>
              <span>Your challenge is saved as active</span>
              <div className={styles.buttonGroup}>
                <div className={styles.buttonSizeA} onClick={reloadChallengeList}>
                  <PrimaryButton text={'Close'} type={'info'} />
                </div>
                <div className={styles.buttonSizeA} onClick={() => this.resetModal()}>
                  <OutlineButton text={'View Challenge'} type={'success'} link={`/projects/${challenge.projectId}/challenges/${isConfirm}/view`} />
                </div>
              </div>
            </div>
          </Modal>
        ) }

        <Link className={styles.col1} to={`/projects/${challenge.projectId}/challenges/${challenge.id}/view`}>
          <div className={styles.name}>
            <span className={styles.block}>{challenge.name}</span>
            <ChallengeTag track={challenge.trackId} challengeType={challenge.type} />
          </div>
        </Link>
        <Link className={styles.col2} to={`/projects/${challenge.projectId}/challenges/${challenge.id}/view`}>
          {renderStatus(challenge.status.toUpperCase())}
        </Link>
        {shouldShowCurrentPhase && (<Link className={styles.col3} to={`/projects/${challenge.projectId}/challenges/${challenge.id}/view`}>
          <span className={styles.block}>{phaseMessage}</span>
          <span className='block light-text'>{endTime}</span>
        </Link>)}
        <div className={cn(styles.col4, styles.editingContainer)}>
          {hoverComponents(challenge, this.onUpdateLaunch, this.props.showError)}
        </div>
        <div className={cn(styles.col4, styles.iconsContainer)}>
          <div className={styles.faIconContainer}>
            <FontAwesomeIcon icon={faUser} className={styles.faIcon} />
            <span>{challenge.numRegistrants || 0}</span>
          </div>
          <div className={styles.faIconContainer}>
            <FontAwesomeIcon icon={faFile} className={styles.faIcon} />
            <span>{challenge.numSubmissions || 0}</span>
          </div>
        </div>
      </div>
    )
  }
}

ChallengeCard.defaultPrps = {
  shouldShowCurrentPhase: true,
  showError: () => {},
  reloadChallengeList: () => {}
}

ChallengeCard.propTypes = {
  challenge: PropTypes.object,
  shouldShowCurrentPhase: PropTypes.bool,
  showError: PropTypes.func,
  reloadChallengeList: PropTypes.func
}

export default withRouter(ChallengeCard)
