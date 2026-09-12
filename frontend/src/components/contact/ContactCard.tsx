import type { IconName } from '../../types'
import { Icon } from '../icons/Icon'

export function ContactCard({
  icon,
  title,
  copy,
}: {
  icon: IconName
  title: string
  copy: string
}) {
  return (
    <article className="contact-card">
      <span className="icon-tile">
        <Icon name={icon} />
      </span>
      <div>
        <h3>{title}</h3>
        <p>{copy}</p>
      </div>
    </article>
  )
}
