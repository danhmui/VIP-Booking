import { useMemo } from 'react'
import { translateText, type Language } from '../context/LanguageRuntimeTranslator'
import { useLanguage } from '../context/LanguageContext'
import type { Room } from '../types'

const directVietnameseReplacements = [
  [
    'Spacious enough to accommodate a family of 3 OR a group of friends, the Superior Room is well-appointed with lamps and architectural lighting enhancing the cozy feel.',
    'Rộng rãi, phù hợp cho gia đình 3 người hoặc một nhóm bạn, phòng Cao cấp được bố trí chỉn chu với đèn và ánh sáng kiến trúc, tạo cảm giác ấm cúng.',
  ],
  [
    'Spacious enough to accommodate a family of 3 OR a group of friends, the Standard Room is well-appointed with lamps and architectural lighting enhancing the cozy feel.',
    'Rộng rãi, phù hợp cho gia đình 3 người hoặc một nhóm bạn, phòng Tiêu chuẩn được bố trí chỉn chu với đèn và ánh sáng kiến trúc, tạo cảm giác ấm cúng.',
  ],
  [
    'Elegant and refined, the Deluxe Connecting Room completes your stay with luxurious amenities.',
    'Thanh lịch và tinh tế, phòng thông nhau hạng Sang trọng hoàn thiện kỳ nghỉ với tiện nghi cao cấp.',
  ],
  [
    'Elegant suite room with spacious balcony, where we arrange outdoor table and chairs for your relaxation time.',
    'Phòng suite thanh lịch với ban công rộng, có sẵn bàn ghế ngoài trời để bạn thư giãn.',
  ],
  [
    'Featuring a spacious terrace to Ly Tu Trong street, our charming Grand Suite offers tranquil views of street.',
    'Sở hữu sân hiên rộng hướng ra đường Lý Tự Trọng, Suite Grand mang đến tầm nhìn yên bình.',
  ],
] as const

const cleanupVietnameseReplacements = [
  ['Standard Room', 'phòng Tiêu chuẩn'],
  ['Superior Room', 'phòng Cao cấp'],
  ['Standard Phòng', 'phòng Tiêu chuẩn'],
  ['Superior Phòng', 'phòng Cao cấp'],
  ['the room is well-appointed with lamps and architectural lighting enhancing the cozy feel.', 'phòng được bố trí chỉn chu với đèn và ánh sáng kiến trúc, tạo cảm giác ấm cúng.'],
  ['Connecting Room', 'phòng thông nhau'],
  ['Grand Suite', 'Suite Grand'],
  ['Standard', 'Tiêu chuẩn'],
  ['Superior', 'Cao cấp'],
  ['Deluxe', 'Sang trọng'],
  ['Family beds', 'Giường gia đình'],
  ['King bed', 'Giường king'],
  ['Queen bed', 'Giường queen'],
  ['Spacious enough to accommodate a family of 3 OR a group of friends,', 'Rộng rãi, phù hợp cho gia đình 3 người hoặc một nhóm bạn,'],
  ['The window can see the whole city', 'Cửa sổ nhìn bao quát toàn cảnh thành phố'],
  ['No window', 'Không có cửa sổ'],
  ['Neighboring or street view', 'Hướng nhìn khu lân cận hoặc đường phố'],
  ['City streets or rooftops', 'Đường phố hoặc mái nhà'],
  ['Hollywood twins', 'Hai giường Hollywood'],
  ['(allows 1 double or 2 twin beds)', '(cho phép 1 giường đôi hoặc 2 giường đơn)'],
  ['(allows 2 double or 4 twin beds)', '(cho phép 2 giường đôi hoặc 4 giường đơn)'],
  ['Separate toilet', 'Toilet riêng'],
  ['Toilet, washbasin', 'Toilet, bồn rửa mặt'],
  ['Room size:', 'Diện tích phòng:'],
  ['View:', 'Tầm nhìn:'],
  ['Beds:', 'Giường:'],
  ['Smoking:', 'Hút thuốc:'],
  ['Bathroom:', 'Phòng tắm:'],
  ['Hút thuốc: No', 'Hút thuốc: Không'],
  ['Hút thuốc: Yes', 'Hút thuốc: Có'],
  ['sqm', 'm2'],
] as const

function replaceTextFragments(input: string, replacements: readonly (readonly [string, string])[]) {
  return replacements.reduce((result, [source, target]) => result.split(source).join(target), input)
}

function sanitizeMixedVietnameseText(input: string) {
  return input
    .replace(
      /(phòng\s+(?:Cao cấp|Tiêu chuẩn))\s+is well(?:-| )appointed with lamps and architectural lighting enhancing the cozy feel\./gi,
      '$1 được bố trí chỉn chu với đèn và ánh sáng kiến trúc, tạo cảm giác ấm cúng.',
    )
    .replace(
      /\bthe\s+(phòng\s+(?:Cao cấp|Tiêu chuẩn))\s+is well(?:-| )appointed with lamps and architectural lighting enhancing the cozy feel\./gi,
      '$1 được bố trí chỉn chu với đèn và ánh sáng kiến trúc, tạo cảm giác ấm cúng.',
    )
    .replace(
      /\bis well(?:-| )appointed with lamps and architectural lighting enhancing the cozy feel\./gi,
      'được bố trí chỉn chu với đèn và ánh sáng kiến trúc, tạo cảm giác ấm cúng.',
    )
    .replace(
      /Hai giường Hollywood\s*\(allows 1 double or 2 twin beds\)/gi,
      'Hai giường Hollywood (cho phép 1 giường đôi hoặc 2 giường đơn)',
    )
    .replace(
      /Hai giường Hollywood\s*\(allows 2 double or 4 twin beds\)/gi,
      'Hai giường Hollywood (cho phép 2 giường đôi hoặc 4 giường đơn)',
    )
    .replace(/\(allows 1 double or 2 twin beds\)/gi, '(cho phép 1 giường đôi hoặc 2 giường đơn)')
    .replace(/\(allows 2 double or 4 twin beds\)/gi, '(cho phép 2 giường đôi hoặc 4 giường đơn)')
    .replace(/\ballows 1 double or 2 twin beds\b/gi, '(cho phép 1 giường đôi hoặc 2 giường đơn)')
    .replace(/\ballows 2 double or 4 twin beds\b/gi, '(cho phép 2 giường đôi hoặc 4 giường đơn)')
    .replace(/\bSeparate toi[a-z]*\b/gi, 'Toilet riêng')
    .replace(/\bSeparate toilet\b/gi, 'Toilet riêng')
    .replace(/\bNo window\b/gi, 'Không có cửa sổ')
    .replace(/\bNeighboring or street view\b/gi, 'Hướng nhìn khu lân cận hoặc đường phố')
    .replace(/\bThe window can see the whole city\b/gi, 'Cửa sổ nhìn bao quát toàn cảnh thành phố')
}

export function localizeRoomText(input: string, language: Language) {
  if (language !== 'vi') {
    return translateText(input, language)
  }

  const directlyLocalized = replaceTextFragments(input, directVietnameseReplacements)
  const translatedText = translateText(directlyLocalized, language)
  const cleanedText = replaceTextFragments(translatedText, cleanupVietnameseReplacements)
  const sanitizedText = sanitizeMixedVietnameseText(cleanedText)

  return sanitizedText
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.])/g, '$1')
    .trim()
}

function translateRoomName(name: string, language: Language) {
  if (language === 'vi') {
    const matchedRoomNumber = name.match(/^Room\s+(.+)$/i)
    if (matchedRoomNumber) {
      return `Phòng ${matchedRoomNumber[1]}`
    }
  } else {
    const matchedRoomNumber = name.match(/^Phòng\s+(.+)$/i)
    if (matchedRoomNumber) {
      return `Room ${matchedRoomNumber[1]}`
    }
  }

  return localizeRoomText(name, language)
}

function translateRoomLocation(location: string, language: Language) {
  if (language === 'vi') {
    const matchedEnglish = location.match(/^Floor\s+(\d+),\s*Room\s+(.+)$/i)
    if (matchedEnglish) {
      return `Tầng ${matchedEnglish[1]}, Phòng ${matchedEnglish[2]}`
    }
  } else {
    const matchedVietnamese = location.match(/^Tầng\s+(\d+),\s*Phòng\s+(.+)$/i)
    if (matchedVietnamese) {
      return `Floor ${matchedVietnamese[1]}, Room ${matchedVietnamese[2]}`
    }
  }

  return localizeRoomText(location, language)
}

export function getGuestCount(value: string | number | null | undefined) {
  const matchedValue = String(value ?? '').match(/\d+/)
  return matchedValue?.[0] ?? '1'
}

export function formatGuestLabel(value: string | number | null | undefined, language: Language) {
  const guestCount = getGuestCount(value)
  const guestUnit = language === 'vi' ? 'khách' : Number(guestCount) === 1 ? 'guest' : 'guests'
  return `${guestCount} ${guestUnit}`
}

export function localizeRoom(room: Room, language: Language): Room {
  return {
    ...room,
    name: translateRoomName(room.name, language),
    category: localizeRoomText(room.category, language),
    location: translateRoomLocation(room.location, language),
    guests: formatGuestLabel(room.guests, language),
    bed: localizeRoomText(room.bed, language),
    description: localizeRoomText(room.description, language),
    amenities: room.amenities.map((amenity) => localizeRoomText(amenity, language)),
    highlights: room.highlights.map((highlight) => localizeRoomText(highlight, language)),
  }
}

export function useLocalizedRoom(room: Room) {
  const { language } = useLanguage()

  return useMemo(() => localizeRoom(room, language), [room, language])
}
