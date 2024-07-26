import { useState } from 'react'
import classNames from 'classnames'
import { SidebarPanel } from 'datocms-react-ui'
import { SvgUpload } from '../../lib/types'

import * as styles from './RawSvgViewer.module.css'

type Props = {
  svg: SvgUpload
  onRename?: (svg: SvgUpload) => void
  onDelete?: (svg: SvgUpload) => void
}

export function RawSvgViewer({ svg, onRename, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(svg.filename)

  function handleRename() {
    setIsEditing(true)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && onRename) {
      onRename({ ...svg, filename: name })
    }
  }

  return (
    <>
      <div
        className={classNames(styles.header, {
          [styles.editing]: isEditing,
        })}
      >
        <div
          className={styles.svgLogo}
          dangerouslySetInnerHTML={{ __html: svg.raw }}
        />
        <div>
          {isEditing ? (
            <input
              className={styles.input}
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <h2 className={classNames('h3', styles.title)}>{name}</h2>
          )}
          <div className={styles.buttonList}>
            {isEditing ? (
              <p className={styles.editingText}>Press Enter to confirm</p>
            ) : (
              <>
                {onRename && (
                  <>
                    <button
                      className={styles.button}
                      type="button"
                      onClick={handleRename}
                    >
                      <span>Rename</span>
                    </button>
                    <span>•</span>
                  </>
                )}
                {onDelete && (
                  <button
                    className={classNames(styles.button, styles.deleteButton)}
                    type="button"
                    onClick={() => onDelete(svg)}
                  >
                    <span>Delete</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <SidebarPanel title="Raw data" startOpen>
        <pre className={styles.rawCode}>{svg.raw}</pre>
      </SidebarPanel>
    </>
  )
}
