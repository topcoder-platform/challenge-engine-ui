/**
 * Reducer to process actions related to challenge list
 */
import _ from 'lodash'
import { toastr } from 'react-redux-toastr'
import {
  LOAD_CHALLENGE_DETAILS_FAILURE,
  LOAD_CHALLENGE_DETAILS_PENDING,
  LOAD_CHALLENGE_DETAILS_SUCCESS,
  LOAD_CHALLENGE_RESOURCES_FAILURE,
  LOAD_CHALLENGE_RESOURCES_PENDING,
  LOAD_CHALLENGE_RESOURCES_SUCCESS,
  LOAD_CHALLENGE_MEMBERS_SUCCESS,
  LOAD_CHALLENGE_METADATA_SUCCESS,
  LOAD_CHALLENGES_FAILURE,
  LOAD_CHALLENGES_PENDING,
  LOAD_CHALLENGES_SUCCESS,
  UPLOAD_ATTACHMENT_FAILURE,
  UPLOAD_ATTACHMENT_SUCCESS,
  UPLOAD_ATTACHMENT_PENDING,
  REMOVE_ATTACHMENT,
  SET_FILTER_CHALLENGE_VALUE,
  UPDATE_CHALLENGE_DETAILS_FAILURE,
  UPDATE_CHALLENGE_DETAILS_SUCCESS
} from '../config/constants'

const initialState = {
  isLoading: false,
  challenges: [],
  metadata: {},
  challengeDetails: {},
  challengeResources: [],
  isSuccess: false,
  isUploading: false,
  uploadingId: null,
  attachments: [],
  challenge: null,
  filterChallengeName: '',
  status: '',
  perPage: 0,
  page: 1,
  totalChallenges: 0,
  projectId: -1
}

function toastrSuccess (title, message) {
  setImmediate(() => {
    toastr.success(title, message)
  })
}

function toastrFailure (title, message) {
  setImmediate(() => {
    toastr.error(title, message)
  })
}

export default function (state = initialState, action) {
  let attachments
  switch (action.type) {
    case LOAD_CHALLENGES_SUCCESS:
      return {
        ...state,
        challenges: action.challenges,
        isLoading: false,
        totalChallenges: action.totalChallenges
      }
    case LOAD_CHALLENGES_PENDING:
      return {
        ...state,
        isLoading: true,
        challenges: action.challenges,
        projectId: action.projectId,
        status: action.status,
        filterChallengeName: action.filterChallengeName,
        perPage: action.perPage,
        page: action.page
      }
    case LOAD_CHALLENGE_DETAILS_PENDING:
      return { ...state, isLoading: true, attachments: [], challenge: null, challengeDetails: {}, failedToLoad: false }
    case LOAD_CHALLENGES_FAILURE:
      return { ...state, isLoading: false }
    case LOAD_CHALLENGE_DETAILS_FAILURE:
    case UPDATE_CHALLENGE_DETAILS_FAILURE:
      return { ...state, isLoading: false, attachments: [], challenge: null, failedToLoad: true }
    case LOAD_CHALLENGE_DETAILS_SUCCESS:
    case UPDATE_CHALLENGE_DETAILS_SUCCESS:
      return {
        ...state,
        challengeDetails: action.challengeDetails,
        isLoading: false,
        attachments: _.has(action.challengeDetails, 'attachments') ? action.challengeDetails.attachments : [],
        failedToLoad: false
      }
    case LOAD_CHALLENGE_RESOURCES_PENDING:
      return { ...state, isLoading: true, failedToLoad: false }
    case LOAD_CHALLENGE_RESOURCES_FAILURE:
      return { ...state, isLoading: false, failedToLoad: true }
    case LOAD_CHALLENGE_RESOURCES_SUCCESS:
      return {
        ...state,
        challengeResources: action.challengeResources,
        isLoading: false,
        failedToLoad: false
      }
    case LOAD_CHALLENGE_METADATA_SUCCESS: {
      if (action.metadataKey === 'metadata') {
        return {
          ...state,
          metadata: {
            ...state.metadata,
            ...action.metadataValue
          }
        }
      }
      return {
        ...state,
        metadata: {
          ...state.metadata,
          [action.metadataKey]: action.metadataValue
        }
      }
    }
    case LOAD_CHALLENGE_MEMBERS_SUCCESS:
      return { ...state, metadata: { ...state.metadata, members: action.members } }
    case UPLOAD_ATTACHMENT_PENDING:
      return { ...state, isUploading: true, isSuccess: false, uploadingId: action.challengeId }
    case UPLOAD_ATTACHMENT_SUCCESS:
      toastrSuccess('Success', `${action.filename} uploaded successfully. Save the challenge to reflect the changes!`)
      attachments = _.cloneDeep(state.attachments)
      attachments.push(action.attachment)
      return { ...state, isUploading: false, isSuccess: true, uploadingId: null, attachments }
    case UPLOAD_ATTACHMENT_FAILURE:
      toastrFailure('Upload failure', `Failed to upload ${action.filename}`)
      return { ...state, isUploading: false, isSuccess: false, uploadingId: null }
    case REMOVE_ATTACHMENT:
      attachments = _.filter(state.attachments, item => {
        if (item.id !== action.attachmentId) {
          return item
        }
      })
      return { ...state, attachments }
    case SET_FILTER_CHALLENGE_VALUE:
      return { ...state, filterChallengeName: action.value.name, status: action.value.status }
    default:
      return state
  }
}
