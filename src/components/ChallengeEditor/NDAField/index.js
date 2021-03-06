import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import styles from './NDAField.module.scss'
import { DEFAULT_NDA_UUID } from '../../../config/constants'

const NDAField = ({ challenge, toggleNdaRequire, readOnly }) => {
  const isRequiredNda = challenge.terms && _.some(challenge.terms, { id: DEFAULT_NDA_UUID })

  if (readOnly) {
    return (
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1, styles.fieldTitle)}>NDA Required :</div>
        <div className={cn(styles.field, styles.col2)}>
          { isRequiredNda ? 'Yes' : 'No' }
        </div>
      </div>
    )
  }

  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1, styles.fieldTitle)}>NDA Required :</div>
      <div className={cn(styles.field, styles.col2)}>
        <div className={styles.tcRadioButton}>
          <input
            name='nda'
            type='radio'
            id='nda-yes'
            checked={isRequiredNda}
            onChange={toggleNdaRequire}
          />
          <label className={styles['tc-RadioButton-label']} htmlFor='nda-yes'>
            <div>Yes</div>
          </label>
        </div>
        <div className={styles.tcRadioButton}>
          <input
            name='nda'
            type='radio'
            id='nda-no'
            checked={!isRequiredNda}
            onChange={toggleNdaRequire}
          />
          <label className={styles['tc-RadioButton-label']} htmlFor='nda-no'>
            <div>No</div>
          </label>
        </div>
      </div>
    </div>
  )
}

NDAField.defaultProps = {
  toggleNdaRequire: () => {},
  readOnly: false
}

NDAField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  toggleNdaRequire: PropTypes.func,
  readOnly: PropTypes.bool
}

export default NDAField
