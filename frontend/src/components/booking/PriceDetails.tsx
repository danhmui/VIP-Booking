import type { Room } from '../../types'
import { useLanguage } from '../../context/LanguageContext'
import { formatCurrency } from '../../utils/currency'
import { getRoomTaxAmount } from '../../utils/pricing'

export function PriceDetails({
  addOnTotal = 0,
  nights = 3,
  room,
}: {
  room: Room
  addOnTotal?: number
  nights?: number
}) {
  const { t } = useLanguage()
  const subtotal = room.price * nights
  const tax = getRoomTaxAmount(room, nights)
  const total = subtotal + addOnTotal + tax
  const nightLabel = nights === 1 ? t('bookingSummary.night') : t('bookingSummary.nights')

  return (
    <div className="price-details">
      <div>
        <span>{t('priceDetails.roomSubtotal', { nights, nightLabel })}</span>
        <strong>{formatCurrency(subtotal)}</strong>
      </div>
      {addOnTotal > 0 && (
        <div>
          <span>{t('priceDetails.selectedAddOns')}</span>
          <strong>{formatCurrency(addOnTotal)}</strong>
        </div>
      )}
      <div>
        <span>{t('priceDetails.taxAndFees')}</span>
        <strong>{formatCurrency(tax)}</strong>
      </div>
      <div className="total">
        <span>{t('priceDetails.total')}</span>
        <strong>{formatCurrency(total)}</strong>
      </div>
    </div>
  )
}
