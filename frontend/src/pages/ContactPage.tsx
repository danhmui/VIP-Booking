import type { FormEvent } from 'react'
import { ContactCard } from '../components/contact/ContactCard'
import { PageIntro } from '../components/ui/PageIntro'
import { SectionHeading } from '../components/ui/SectionHeading'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import { localizeSupportAddress, readSupportInfo, saveContactMessage } from '../utils/appStorage'

export function ContactPage() {
  const { showToast } = useToast()
  const { t, language } = useLanguage()
  const supportInfo = readSupportInfo()
  const localizedAddress = localizeSupportAddress(supportInfo.address, language)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const fullName = String(formData.get('fullName') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const subject = String(formData.get('subject') ?? '').trim()
    const message = String(formData.get('message') ?? '').trim()

    if (!fullName || !email || !subject || !message) {
      const status = t('contact.requiredMessage')
      showToast({ title: t('contact.incompleteTitle'), message: status, variant: 'error' })
      return
    }

    saveContactMessage({
      name: fullName,
      email,
      subject,
      message,
    })
    const status = t('contact.successMessage')
    showToast({ title: t('contact.successTitle'), message: status, variant: 'success' })
    event.currentTarget.reset()
  }

  return (
    <main className="page-shell contact-page">
      <PageIntro
        eyebrow={t('contact.eyebrow')}
        title={t('contact.title')}
        copy={t('contact.copy')}
      />

      <section className="contact-grid">
        <aside className="contact-cards">
          <ContactCard icon="phone" title={t('contact.callConcierge')} copy={supportInfo.hotline} />
          <ContactCard icon="mail" title={t('contact.emailReservations')} copy={supportInfo.email} />
          <ContactCard icon="mapPin" title={t('contact.visitUs')} copy={localizedAddress} />
        </aside>

        <form className="form-panel contact-form" onSubmit={handleSubmit}>
          <h2>{t('contact.sendMessage')}</h2>
          <div className="form-grid">
            <label>
              {t('contact.fullName')}
              <input defaultValue="Anh Nguyen" name="fullName" />
            </label>
            <label>
              {t('contact.email')}
              <input defaultValue="anh.nguyen@example.com" name="email" type="email" />
            </label>
            <label className="span-2">
              {t('contact.subject')}
              <select defaultValue={t('contact.subjectBooking')} name="subject">
                <option>{t('contact.subjectBooking')}</option>
                <option>{t('contact.subjectPrivate')}</option>
                <option>{t('contact.subjectCorporate')}</option>
              </select>
            </label>
            <label className="span-2">
              {t('contact.message')}
              <textarea
                defaultValue={t('contact.defaultMessage')}
                name="message"
                rows={6}
              />
            </label>
          </div>
          <button className="primary-button" type="submit">
            {t('contact.sendButton')}
          </button>
        </form>
      </section>

      <section className="section-shell faq-section">
        <SectionHeading eyebrow={t('contact.faqEyebrow')} title={t('contact.faqTitle')} />
        {[
          t('contact.faq1'),
          t('contact.faq2'),
          t('contact.faq3'),
          t('contact.faq4'),
        ].map((question, index) => (
          <details className="faq-item" key={question} open={index === 2}>
            <summary>{question}</summary>
            <p>{t('contact.faqAnswer')}</p>
          </details>
        ))}
      </section>
    </main>
  )
}
