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

  if (!R.is(Number, price)) {
    return null
  }

  return price
}

function transformSize (snapshot) {
  const size = Number.parseInt(snapshot[AspectType.SIZE])

  if (Number.isNaN(size)) {
    return null
  }

  return size
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
    case 'Osobní':
      return OwnershipType.PERSONAL

    case 'Družstevní':
      return OwnershipType.SOCIETY

    default:
      throw new Error(`Unknown value: ${ownershipType}`)
  }
}

function transformFlatCondition (snapshot) {
  const flatCondition = snapshot[AspectType.FLAT_CONDITION]

  if (!flatCondition) {
    return null
  }

  switch (flatCondition) {
    case 'Novostavba':
      return FlatConditionType.NEW

    case 'Velmi dobrý':
      return FlatConditionType.VERY_GOOD

    case 'Dobrý':
      return FlatConditionType.GOOD

    case 'Po rekonstrukci':
      return FlatConditionType.AFTER_RECONSTRUCTION

    case 'Před rekonstrukcí':
      return FlatConditionType.BEFORE_RECONSTRUCTION

    case 'Projekt':
    case 'Ve výstavbě':
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
    case 'Cihlová':
      return ConstructionType.BRICK

    case 'Panelová':
      return ConstructionType.PANEL

    case 'Skeletová':
      return ConstructionType.SKELETON

    case 'Dřevěná':
      return ConstructionType.WOOD

    case 'Smíšená':
      return ConstructionType.MIX

    default:
      throw new Error(`Invalid value: ${constructionType}`)
  }
}

function transformFloorNum (snapshot) {
  const floorNum = snapshot[AspectType.FLOOR_NUM]

  if (!floorNum) {
    return null
  }

  const match = floorNum.match(/^(-?[\d]+)/)
  if (!match) {
    return null
  }

  return Number.parseInt(match[1])
}

function transformBasement (snapshot) {
  const basement = snapshot[AspectType.BASEMENT]

  return Boolean(basement)
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
