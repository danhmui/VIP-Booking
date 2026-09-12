import type { Navigate } from '../../types'
import { useLanguage } from '../../context/LanguageContext'
import { localizeSupportAddress, readSupportInfo } from '../../utils/appStorage'
import { getRouteHref } from '../../utils/router'

export function SiteFooter({ navigate }: { navigate: Navigate }) {
  const currentYear = new Date().getFullYear()
  const supportInfo = readSupportInfo()
  const { t, language } = useLanguage()
  const localizedAddress = localizeSupportAddress(supportInfo.address, language)

  return (
    <footer className="site-footer">
      <div className="footer-wide">
        <section className="footer-company">
          <a
            className="brand footer-brand"
            href={getRouteHref('home')}
            onClick={(event) => {
              event.preventDefault()
              navigate('home')
            }}
          >
            <span className="brand-mark">VIP</span>
            <span>VIP Booking</span>
          </a>
          <strong>{t('footer.companyName')}</strong>
          <p>{localizedAddress}</p>
          <p>{supportInfo.email}</p>
          <button className="footer-hotline" type="button" onClick={() => navigate('contact')}>
            {supportInfo.hotline}
          </button>
          <small>{t('footer.supportNote')}</small>
        </section>

        <section className="footer-column">
          <h4>{t('footer.information')}</h4>
          <div className="footer-links">
            <button type="button" onClick={() => navigate('about')}>
              {t('footer.aboutUs')}
            </button>
            <button type="button" onClick={() => navigate('rooms')}>
              {t('footer.rooms')}
            </button>
            <button type="button" onClick={() => navigate('booking')}>
              {t('footer.bookingGuide')}
            </button>
            <button type="button" onClick={() => navigate('profile')}>
              {t('footer.guestProfile')}
            </button>
            <button type="button" onClick={() => navigate('contact')}>
              {t('footer.helpCenter')}
            </button>
          </div>
        </section>

        <section className="footer-column">
          <h4>{t('footer.terms')}</h4>
          <div className="footer-links">
            <button type="button" onClick={() => navigate('contact')}>
              {t('footer.privacy')}
            </button>
            <button type="button" onClick={() => navigate('contact')}>
              {t('footer.termsOfUse')}
            </button>
            <button type="button" onClick={() => navigate('contact')}>
              {t('footer.dataProtection')}
            </button>
            <button type="button" onClick={() => navigate('admin')}>
              {t('footer.adminPortal')}
            </button>
          </div>
        </section>
      </div>

      <div className="footer-legal">
        <p>{t('footer.legalLine', { year: currentYear })}</p>
        <p>{t('footer.legalSub')}</p>
      </div>
    </footer>
  )
}


