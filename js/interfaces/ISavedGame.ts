import { VM_TYPES } from '../VM';

export interface ISavedShop {
  items: Array<ISavedShopItem>
}

export interface ISavedShopItem {
  name: String,
  purchased: Boolean
}

export interface ISavedInfrastructure {
  datacenters: Array<ISavedDataCenter>
}

export interface ISavedDataCenter {
  racks: Array<ISavedRack>
}

export interface ISavedRack {
  servers: Array<ISavedServer>
}

export interface ISavedServer {
  name: String,
  vms: Array<ISavedVm>
}

export interface ISavedVm {
  name: String,
  cpus: number,
  memory: number,
  storage: number,
  type: VM_TYPES,
  poweredOn: Boolean,
  poweredOnAt: number,
  startingLoad: number,
  startingMemory: number,
  startingStorage: number,
  currentLoad: number,
  currentMemory: number,
  currentStorage: number,
  decreaseResourceInterval: number,
  lastSshLogin: number
}

export default interface ISavedGame {
  lastSaveTime: number,
  infrastructure: ISavedInfrastructure,
  visitCount: number,
  money: number,
  moneyPerHit: number,
  shop: ISavedShop
}