const R = require('ramda')

const {
  AspectType,
  OwnershipType,
  FlatConditionType,
  ConstructionType,
  KitchenType,
} = require('../common/consts')

const pushMessage = (errors, key, message) => errors.push({ key, message })

function check (aspirant, competitors) {
  const errors = []
  const warnings = []

  const ownershipType = aspirant[AspectType.OWNERSHIP_TYPE]
  if (ownershipType) {
    if (!Object.values(OwnershipType).includes(ownershipType)) {
      pushMessage(warnings, AspectType.OWNERSHIP_TYPE, `Invalid value: ${ownershipType}`)
    }
  }

  const flatCondition = aspirant[AspectType.FLAT_CONDITION]
  if (flatCondition) {
    if (!Object.values(FlatConditionType).includes(flatCondition)) {
      pushMessage(warnings, AspectType.FLAT_CONDITION, `Invalid value: ${flatCondition}`)
    }
  }

  const address = aspirant[AspectType.ADDRESS]
  if (!R.is(String, address) || !address.length) {
    pushMessage(errors, AspectType.ADDRESS, `Required value`)
  }

  const constructionType = aspirant[AspectType.CONSTRUCTION_TYPE]
  if (constructionType) {
    if (!Object.values(ConstructionType).includes(constructionType)) {
      pushMessage(warnings, AspectType.CONSTRUCTION_TYPE, `Invalid value: ${constructionType}`)
    }
  }

  const floorNum = aspirant[AspectType.FLOOR_NUM]
  if (floorNum) {
    if (!R.is(Number, floorNum)) {
      pushMessage(warnings, AspectType.FLOOR_NUM, `Invalid value: ${floorNum}`)
    }
  }

  const numRooms = aspirant[AspectType.NUM_ROOMS]
  if (!numRooms) {
    pushMessage(errors, AspectType.NUM_ROOMS, `Required value`)
  } else if (!R.is(Number, numRooms)) {
    pushMessage(errors, AspectType.NUM_ROOMS, `Invalid value: ${numRooms}`)
  }

  const kitchenType = aspirant[AspectType.KITCHEN_TYPE]
  if (!kitchenType) {
    pushMessage(errors, AspectType.KITCHEN_TYPE, 'Required value')
  } else if (!Object.values(KitchenType).includes(kitchenType)) {
    pushMessage(errors, AspectType.KITCHEN_TYPE, `Invalid value: ${kitchenType}`)
  }

  const size = aspirant[AspectType.SIZE]
  if (!size) {
    pushMessage(errors, AspectType.SIZE, `Required value`)
  } else if (!R.is(Number, size) || size < 16) {
    pushMessage(errors, AspectType.SIZE, `Invalid value: ${size}`)
  }

  const price = aspirant[AspectType.PRICE]
  if (!price) {
    pushMessage(errors, AspectType.PRICE, `Required value`)
  } else if (!R.is(Number, price) || price < 0) {
    pushMessage(errors, AspectType.PRICE, `Invalid value: ${price}`)
  }

  if (!errors.length) {
    if (
      competitors.some(x =>
        x.address === address &&
        x.size === size &&
        x.price === price &&
        x.numRooms === numRooms
      )
    ) {
      pushMessage(errors, '__duplicity__', 'Duplicate record; will be ignored')
    }
  }

  return { errors, warnings }
}

module.exports = check
