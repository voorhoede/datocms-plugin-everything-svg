import { useMemo } from 'react'
import { FieldError } from 'datocms-react-ui'
import classNames from 'classnames'
import isSvg from 'is-svg'

import * as styles from './SvgViewer.module.css'

type Props = {
  value: string
  onChangeSvg: (value: string) => void
  onChangeFilename?: (value: string) => void
  filename?: string
}

export function SvgViewer({
  value,
  onChangeSvg,
  filename,
  onChangeFilename,
}: Props) {
  const showError = useMemo(() => value && !isSvg(value), [value])

  return (
    <form className={styles.root}>
      <div className={styles.svgInput}>
        <label className="sr-only" htmlFor="embeded-svg">
          Embeded svg
        </label>
        <textarea
          className={styles.textarea}
          name="embeded-svg"
          id="embeded-svg"
          value={value}
          onChange={(e) => onChangeSvg(e.target.value)}
          placeholder="<svg>Paste your svg here</svg>"
        />
      </div>

      <div className={styles.viewer}>
        <div className={styles.viewerSvg}>
          {isSvg(value) && (
            <>
              <div
                className={styles.viewerSvgElement}
                dangerouslySetInnerHTML={{ __html: value }}
              />
            </>
          )}

          {(showError || !value) && (
            <>
              <div className={styles.viewerText}>
                {value && showError && (
                  <FieldError>Use a valid svg string</FieldError>
                )}
                {!value && (
                  <p className={styles.text}>
                    <span className="h3">Nothing to show</span>
                    <span className="body--medium">Input a valid svg</span>
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <div className={styles.viewerFilename}>
          {isSvg(value) && onChangeFilename && (
            <input
              className={styles.filenameInput}
              value={filename}
              onChange={(e) => onChangeFilename(e.target.value)}
              autoFocus
            />
          )}
        </div>
      </div>
    </form>
  )
}
