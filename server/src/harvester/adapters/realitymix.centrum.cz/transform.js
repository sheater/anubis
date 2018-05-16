const R = require('ramda')

const evolveTransformation = require('../../utils/evolveTransformation')
const {
  AspectType,
  OwnershipType,
  FlatConditionType,
  ConstructionType,
  KitchenType,
} = require('../../../common/consts')

function transformPrice (snapshot) {
  const price = snapshot[AspectType.PRICE]
  const match = price.match(/^([\d ]+)/)
  if (!match) {
    return null
  }

  return Number.parseInt(match[1].replace(/\s/g, ''))
}

function transformSize (snapshot) {
  const size = snapshot[AspectType.SIZE]
  const match = size.match(/^(\d+)/)
  if (!match) {
    return null
  }

  return Number.parseInt(match[1])
}

const NUM_ROOMS_REGEXP = /(\d+)\s?\+\s?(kk|\d)/i

function matchNumRooms (snapshot) {
  const numRooms = snapshot[AspectType.NUM_ROOMS]
  const match = numRooms.match(NUM_ROOMS_REGEXP)
  if (!match) {
    return snapshot[AspectType.DESCRIPTION].match(NUM_ROOMS_REGEXP)
  }

  return match
}

function transformNumRooms (snapshot) {
  const match = matchNumRooms(snapshot)
  if (!match) {
    return null
  }

  return Number.parseInt(match[1])
}

function transformKitchenType (snapshot) {
  const match = matchNumRooms(snapshot)

  if (!match) {
    return null
  }

  switch (match[2].toLowerCase()) {
    case '1':
      return KitchenType.ONE

    case 'kk':
      return KitchenType.KK

    default:
      throw new Error(`Unknown value: "${match[2]}"`)
  }
}

function transformOwnershipType (snapshot) {
  const ownershipType = snapshot[AspectType.OWNERSHIP_TYPE]

  if (!ownershipType) {
    return null
  }

  switch (ownershipType) {
    case 'osobní':
      return OwnershipType.PERSONAL

    case 'družstevní':
      return OwnershipType.SOCIETY

    case 'jiné':
      return OwnershipType.OTHER

    default:
      throw new Error(`Invalid value: "${ownershipType}"`)
  }
}

function transformFlatCondition(snapshot) {
  const flatCondition = snapshot[AspectType.FLAT_CONDITION]

  if (!flatCondition) {
    return null
  }

  switch (flatCondition) {
    case 'velmi dobrý':
      return FlatConditionType.VERY_GOOD

    case 'dobrý':
      return FlatConditionType.GOOD

    case 'novostavba':
      return FlatConditionType.NEW

    case 'po rekonstrukci':
      return FlatConditionType.AFTER_RECONSTRUCTION

    case 'před rekonstrukcí':
      return FlatConditionType.BEFORE_RECONSTRUCTION

    case 've výstavbě (hrubá stavba)':
      return FlatConditionType.BUILDING

    case 'projekt':
      return FlatConditionType.BUILDING

    default:
      throw new Error(`Unknown value: ${flatCondition}`)
  }
}

function transformConstructionType (snapshot) {
  const constructionType = snapshot[AspectType.CONSTRUCTION_TYPE]

  if (!constructionType) {
    return null
  }

  switch (constructionType) {
    case 'panelová':
      return ConstructionType.PANEL

    case 'cihlová':
      return ConstructionType.BRICK

    case 'skeletová':
      return ConstructionType.SKELETON

    case 'dřevěná':
      return ConstructionType.WOOD

    case 'smíšená':
      return ConstructionType.MIX

    default:
      throw new Error(`Unknown value: ${constructionType}`)
  }
}

function transformFloorNum (snapshot) {
  const floorNum = snapshot[AspectType.FLOOR_NUM]

  if (!floorNum) {
    return null
  }

  return Number.parseInt(floorNum)
}

function transformBasement (snapshot) {
  const basement = snapshot[AspectType.BASEMENT]

  if (!basement) {
    return null
  }

  return true
}

module.exports = {
  default: evolveTransformation({
    [AspectType.ADDRESS]: R.prop(AspectType.ADDRESS),
    [AspectType.PRICE]: transformPrice,
    [AspectType.SIZE]: transformSize,
    [AspectType.NUM_ROOMS]: transformNumRooms,
    [AspectType.KITCHEN_TYPE]: transformKitchenType,
    [AspectType.OWNERSHIP_TYPE]: transformOwnershipType,
    [AspectType.FLAT_CONDITION]: transformFlatCondition,
    [AspectType.CONSTRUCTION_TYPE]: transformConstructionType,
    [AspectType.FLOOR_NUM]: transformFloorNum,
    [AspectType.BASEMENT]: transformBasement,
  }),
}
