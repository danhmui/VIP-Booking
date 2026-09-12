import { useMemo } from 'react'
import { type Language } from '../context/LanguageRuntimeTranslator'
import { useLanguage } from '../context/LanguageContext'
import type { Service } from '../types'

const serviceTranslations: Record<string, { en: string; vi: string }> = {
  'Rooftop Poolside Cocktail': {
    en: 'Rooftop Poolside Cocktail',
    vi: 'Cocktail hồ bơi tầng thượng',
  },
  'Luxury Airport Transfer': {
    en: 'Luxury Airport Transfer',
    vi: 'Đưa đón sân bay cao cấp',
  },
  'Express Laundry': {
    en: 'Express Laundry',
    vi: 'Giặt ủi nhanh',
  },
  'Aroma Body Massage': {
    en: 'Aroma Body Massage',
    vi: 'Massage toàn thân tinh dầu',
  },
  'Breakfast Signature': {
    en: 'Breakfast Signature',
    vi: 'Bữa sáng đặc trưng',
  },
  'Private Chauffeur': {
    en: 'Private Chauffeur',
    vi: 'Tài xế riêng',
  },
  'Wellness Ritual': {
    en: 'Wellness Ritual',
    vi: 'Nghi thức chăm sóc sức khỏe',
  },
  'Late Checkout': {
    en: 'Late Checkout',
    vi: 'Trả phòng muộn',
  },
  'Signature cocktails served at the sky bar': {
    en: 'Signature cocktails served at the sky bar',
    vi: 'Cocktail đặc trưng được phục vụ tại sky bar',
  },
  'Private airport pick-up/drop-off service': {
    en: 'Private airport pick-up/drop-off service',
    vi: 'Dịch vụ đưa đón sân bay riêng',
  },
  'Same-day wash and fold clothing service': {
    en: 'Same-day wash and fold clothing service',
    vi: 'Dịch vụ giặt gấp quần áo trong ngày',
  },
  '60-minute relaxing full body spa treatment': {
    en: '60-minute relaxing full body spa treatment',
    vi: 'Liệu trình spa thư giãn toàn thân 60 phút',
  },
  'Chef selection, tea service, and fresh juice': {
    en: 'Chef selection, tea service, and fresh juice',
    vi: 'Thực đơn đầu bếp chọn, trà phục vụ và nước ép tươi',
  },
  'Airport arrival or city transfer': {
    en: 'Airport arrival or city transfer',
    vi: 'Đón tại sân bay hoặc đưa đón trong thành phố',
  },
  'Spa treatment with private suite setup': {
    en: 'Spa treatment with private suite setup',
    vi: 'Liệu trình spa với không gian suite riêng',
  },
  'Extend room access until 4:00 PM': {
    en: 'Extend room access until 4:00 PM',
    vi: 'Gia hạn thời gian sử dụng phòng đến 4:00 chiều',
  },
} as const

function translateServiceText(text: string, language: Language) {
  const matchedTranslation = serviceTranslations[text]
  if (matchedTranslation) {
    return matchedTranslation[language]
  }

  return text
}

export function localizeService(service: Service, language: Language): Service {
  return {
    ...service,
    name: translateServiceText(service.name, language),
    note: translateServiceText(service.note, language),
  }
}

export function useLocalizedServices(services: Service[]) {
  const { language } = useLanguage()

  return useMemo(
    () => services.map((service) => localizeService(service, language)),
    [language, services],
  )
}
