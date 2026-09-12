import { Icon } from '../icons/Icon'

export function SectionHeading({
  eyebrow,
  title,
  actionLabel,
  onAction,
}: {
  eyebrow: string
  title: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {actionLabel && onAction && (
        <button className="text-button" type="button" onClick={onAction}>
          {actionLabel}
          <Icon name="chevron" size={16} />
        </button>
      )}
    </div>
  )
}
