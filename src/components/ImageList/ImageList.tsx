import classNames from 'classnames'
import { Spinner } from 'datocms-react-ui'
import { ImageViewer, ImageViewerProps } from '../ImageViewer/ImageViewer'
import { SvgUpload } from '../../lib/types'

import * as styles from './ImageList.module.css'

type Props = {
  svgs?: SvgUpload[]
  activeSvgs?: SvgUpload[]
  onDelete?: ImageViewerProps['onDelete']
  onShowUpload?: ImageViewerProps['onShowUpload']
  onShowRaw?: ImageViewerProps['onShowRaw']
  onClick?: ImageViewerProps['onClick']
  size?: ImageViewerProps['size']
  showTag?: ImageViewerProps['showTag']
  disabled?: ImageViewerProps['disabled']
  isLoading?: boolean
}

export function ImageList({
  svgs,
  activeSvgs,
  onDelete,
  onShowUpload,
  onShowRaw,
  onClick,
  size,
  showTag,
  disabled,
  isLoading,
}: Props) {
  if (!svgs || svgs.length === 0) {
    return null
  }

  return (
    <ul
      className={classNames(styles.root, {
        [styles.small]: size === 's',
      })}
    >
      {svgs?.map((svg) => (
        <ImageViewer
          key={svg.id}
          component="li"
          image={svg}
          onDelete={onDelete}
          onShowUpload={onShowUpload}
          onShowRaw={onShowRaw}
          onClick={onClick}
          selected={activeSvgs?.map((svg) => svg.id)?.includes(svg.id)}
          size={size}
          showTag={showTag}
          disabled={disabled}
        />
      ))}

      {isLoading && (
        <div className={styles.spinner}>
          <Spinner />
        </div>
      )}
    </ul>
  )
}
