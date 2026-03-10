import { useState } from 'react'
import type { ElementType } from 'react'
import classNames from 'classnames'
import { Dots } from '../Icons/dots'
import { Bin } from '../Icons/bin'
import { SvgUpload } from '../../lib/types'
import { useOutsideClick } from '../../hooks/useOutsideClick'

import * as styles from './ImageViewer.module.css'

export type ImageViewerProps = {
  image: SvgUpload
  component?: ElementType
  selected?: boolean
  showTag?: boolean
  disabled?: boolean
  size?: 's' | 'm' | 'l'
  onDelete?: (image: SvgUpload) => void
  onShowUpload?: (image: SvgUpload) => void
  onShowRaw?: (image: SvgUpload) => void
  onClick?: (image: SvgUpload) => void
}

export function ImageViewer({
  image,
  component = 'div',
  selected,
  showTag,
  disabled,
  size = 'l',
  onDelete,
  onShowUpload,
  onShowRaw,
  onClick,
}: ImageViewerProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  let imageElement: JSX.Element | null = null
  const Component = onClick ? 'button' : component
  const dropdownRef = useOutsideClick(() => setShowDropdown(false))

  if (image.type === 'svg') {
    imageElement = (
      <div
        className={styles.raw}
        dangerouslySetInnerHTML={{ __html: image.raw }}
      />
    )
  }

  if (image.type === 'image') {
    imageElement = <img src={image.url} alt={image.filename} />
  }

  return (
    <Component
      className={classNames(styles.root, {
        [styles.border]: onClick || onDelete,
        [styles.clickable]: onClick,
        [styles.selected]: selected,
        [styles.small]: size === 's',
        [styles.medium]: size === 'm',
      })}
      onClick={onClick ? () => onClick(image) : undefined}
      disabled={disabled}
    >
      {(onDelete || onShowUpload || onShowRaw) && (
        <div ref={dropdownRef}>
          <div className={styles.dropdown}>
            {!onShowRaw && !onShowUpload && onDelete ? (
              <button
                type="button"
                className={classNames(
                  styles.dropdownButton,
                  styles.dropdownDeleteButton,
                )}
                onClick={() => onDelete(image)}
              >
                <Bin />
                <span className="sr-only">Delete icon</span>
              </button>
            ) : (
              <button
                type="button"
                className={styles.dropdownButton}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <Dots />
                <span className="sr-only">
                  {showDropdown ? 'Close menu' : 'Open menu'}
                </span>
              </button>
            )}
          </div>

          {showDropdown && (
            <div className={styles.dropdownMenu}>
              {image.type === 'svg' && onShowRaw && (
                <button
                  type="button"
                  className={styles.dropdownMenuButton}
                  onClick={() => onShowRaw(image)}
                >
                  Show raw details
                </button>
              )}
              {image.type === 'image' && onShowUpload && (
                <button
                  type="button"
                  className={styles.dropdownMenuButton}
                  onClick={() => onShowUpload(image)}
                >
                  Show image details
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className={styles.dropdownMenuDeleteButton}
                  onClick={() => onDelete(image)}
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {showTag && (
        <div className={styles.tag}>
          <p className={classNames(styles.tagText, 'body--small')}>
            {image.type === 'svg' && 'Raw'}{' '}
            {image.type === 'image' && 'Raw + Image'}
          </p>
        </div>
      )}

      <div
        className={classNames(styles.image, {
          [styles.imageWithFilename]: image.filename,
        })}
      >
        {imageElement}
      </div>
      {image.filename && (
        <div className={styles.caption}>
          <span className={classNames('body--medium', styles.filename)}>
            {image.filename}
          </span>
        </div>
      )}
    </Component>
  )
}
