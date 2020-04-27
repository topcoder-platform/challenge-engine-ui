/**
 * Component to render Challenges page
 */
import React from 'react'
import PropTypes from 'prop-types'
import Sticky from 'react-stickynode'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { CONNECT_APP_URL } from '../../config/constants'

import { PrimaryButton } from '../Buttons'
import ChallengeList from './ChallengeList'
import styles from './ChallengesComponent.module.scss'
import Loader from '../Loader'
import xss from 'xss'

const ChallengesComponent = ({
  challenges,
  isLoading,
  warnMessage,
  filterChallengeName,
  activeProject,
  status,
  loadChallengesByPage,
  activeProjectId,
  page,
  perPage,
  totalChallenges
}) => {
  return (
    <Sticky top={10} bottomBoundary='#SidebarContainer'>
      <div>
        <Helmet title={activeProject ? activeProject.name : ''} />
        <div className={styles.titleContainer}>
          {activeProject ? (
            <a
              className={styles.buttonLaunchNew}
              href={`${CONNECT_APP_URL}/projects/${activeProject.id}`}
              target={'_blank'}
            >
              <PrimaryButton text={'View Project in Connect'} type={'info'} />
            </a>
          ) : (
            <span />
          )}
          <div
            className={styles.title}
            dangerouslySetInnerHTML={{
              __html: xss(activeProject ? activeProject.name : '')
            }}
          />
          {activeProject ? (
            <Link
              className={styles.buttonLaunchNew}
              to={`/projects/${activeProject.id}/challenges/new`}
            >
              <PrimaryButton text={'Launch New'} type={'info'} />
            </Link>
          ) : (
            <span />
          )}
        </div>
        <div className={styles.challenges}>
          {isLoading ? (
            <Loader />
          ) : (
            <ChallengeList
              challenges={challenges}
              warnMessage={warnMessage}
              activeProject={activeProject}
              filterChallengeName={filterChallengeName}
              status={status}
              loadChallengesByPage={loadChallengesByPage}
              activeProjectId={activeProjectId}
              page={page}
              perPage={perPage}
              totalChallenges={totalChallenges}
            />
          )}
        </div>
      </div>
    </Sticky>
  )
}

ChallengesComponent.propTypes = {
  challenges: PropTypes.arrayOf(PropTypes.object),
  activeProject: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string
  }),
  isLoading: PropTypes.bool,
  warnMessage: PropTypes.string,
  filterChallengeName: PropTypes.string,
  status: PropTypes.string,
  activeProjectId: PropTypes.number,
  loadChallengesByPage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  perPage: PropTypes.number.isRequired,
  totalChallenges: PropTypes.number.isRequired
}

ChallengesComponent.defaultProps = {
  challenges: [],
  isLoading: true
}

export default ChallengesComponent
