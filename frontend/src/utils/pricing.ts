import type { PricingRule, Room } from '../types'

const defaultRoomTaxRate = 0.08

function parseIsoDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

function isRuleActiveOnDate(rule: PricingRule, targetDate: Date) {
  const startDate = parseIsoDate(rule.startDate)
  const endDate = parseIsoDate(rule.endDate)

  if (!startDate || !endDate) {
    return false
  }

  const current = new Date(targetDate)
  current.setHours(0, 0, 0, 0)
  return current >= startDate && current <= endDate
}

function roomTypeMatchesRule(room: Room, ruleRoomType: string) {
  if (ruleRoomType === 'All Room Types') {
    return true
  }

  const roomText = `${room.name} ${room.category}`.toLowerCase()
  const normalizedRuleType = ruleRoomType.toLowerCase()
  return roomText.includes(normalizedRuleType)
}

function applyAdjustment(basePrice: number, adjustment: string) {
  const trimmed = adjustment.trim()

  const percentMatch = trimmed.match(/^([+-])\s*(\d+(?:\.\d+)?)%$/)
  if (percentMatch) {
    const sign = percentMatch[1] === '+' ? 1 : -1
    const percentValue = Number(percentMatch[2])
    const amount = (basePrice * percentValue) / 100
    return Math.max(0, Math.round(basePrice + sign * amount))
  }

  const flatMatch = trimmed.match(/^([+-])\s*\$?(\d+(?:\.\d+)?)/)
  if (flatMatch) {
    const sign = flatMatch[1] === '+' ? 1 : -1
    const flatValue = Number(flatMatch[2])
    return Math.max(0, Math.round(basePrice + sign * flatValue))
  }

  return basePrice
}

export function getEffectiveRoomPrice(room: Room, rules: PricingRule[], targetDate = new Date()) {
  const appliedRules = rules.filter(
    (rule) => isRuleActiveOnDate(rule, targetDate) && roomTypeMatchesRule(room, rule.roomType),
  )

  return appliedRules.reduce((price, rule) => applyAdjustment(price, rule.adjustment), room.price)
}

export function applyPricingToRooms(rooms: Room[], rules: PricingRule[], targetDate = new Date()) {
  return rooms.map((room) => ({
    ...room,
    price: getEffectiveRoomPrice(room, rules, targetDate),
  }))
}

export function getRoomTaxAmount(room: Room, nights = 1) {
  const subtotal = room.price * Math.max(nights, 1)
  return Math.round(subtotal * defaultRoomTaxRate)
}
