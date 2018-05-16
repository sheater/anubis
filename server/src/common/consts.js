const AspectType = {
  ORIGINAL_URL: 'originalUrl',
  ADAPTER_NAME: 'adapterName',
  PRICE: 'price',
  PRICE_NOTE: 'priceNote',
  ADDRESS: 'address',
  LAST_UPDATE: 'lastUpdate',
  NUM_ROOMS: 'numRooms',
  KITCHEN_TYPE: 'kitchenType',
  OWNERSHIP_TYPE: 'ownershipType',
  SIZE: 'size',
  TRAFFIC: 'traffic',
  ENERGY_EFFICIENCY_RATING: 'energyEfficiencyRating',
  FLOOR_NUM: 'floorNum',
  FLOORS_TOTAL: 'floorsTotal',
  BUILDING_CONDITION: 'buildingCondition',
  FLAT_CONDITION: 'flatCondition',
  CONSTRUCTION_TYPE: 'constructionType',
  BASEMENT: 'basement',
  BALCONY: 'balcony',
  THEIR_ID: 'theirId',
  DESCRIPTION: 'description',
  ELEVATOR: 'elevator',
  HEATING_TYPE: 'heatingType',
  PARKING: 'parking',
  EQUIPMENT: 'equipment',
  BARRIER_FREE_ACCESS: 'barrierFreeAccess',
}

const OwnershipType = {
  PERSONAL: 'PERSONAL',
  SOCIETY: 'SOCIETY',
  OTHER: 'OTHER',
}

const FlatConditionType = {
  NEW: 'NEW',
  AFTER_RECONSTRUCTION: 'AFTER_RECONSTRUCTION',
  VERY_GOOD: 'VERY_GOOD',
  GOOD: 'GOOD',
  BUILDING: 'BUILDING',
  BEFORE_RECONSTRUCTION: 'BEFORE_RECONSTRUCTION',
}

const ConstructionType = {
  PANEL: 'PANEL',
  BRICK: 'BRICK',
  SKELETON: 'SKELETON',
  MIX: 'MIX',
  WOOD: 'WOOD',
}

const KitchenType = {
  KK: 'KK',
  ONE: '1',
}

module.exports = {
  AspectType,
  OwnershipType,
  FlatConditionType,
  ConstructionType,
  KitchenType,
}
