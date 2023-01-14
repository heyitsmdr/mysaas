import BaseObject from './BaseObject';
import Game from './Game';
import Server from './Server';
import { ISavedVm } from './interfaces/ISavedGame';

enum VM_TYPES {
  WEB_MONOLITH,
  CDN
}

class VM extends BaseObject {
  private server: Server;
  private lowerResourcesTimer: any;

  // Saved
  private name: String;
  private cpus: number = 0;
  private memory: number = 0;
  private storage: number = 0;
  private type: VM_TYPES = VM_TYPES.WEB_MONOLITH;
  private poweredOn: Boolean = false;
  private poweredOnAt: number = 0;
  private startingLoad: number = 0.0;
  private startingMemory: number = 0.0;
  private startingStorage: number = 0.0;
  private currentLoad: number = 0.0;
  private currentMemory: number = 0.0;
  private currentStorage: number = 0.0;
  private decreaseResourceInterval: number = 80;
  private lastSshLogin: number = 0;

  public static getShortType(vmType: VM_TYPES) {
    switch (vmType) {
      case VM_TYPES.WEB_MONOLITH:
        return 'web';
      default:
        return 'unknown';
    }
  }

  constructor(game: Game, server: Server) {
    super(game);
    this.server = server;
  }

  public save(): ISavedVm {
    return {
      name: this.name,
      cpus: this.cpus,
      memory: this.memory,
      storage: this.storage,
      type: this.type,
      poweredOn: this.poweredOn,
      poweredOnAt: this.poweredOnAt,
      startingLoad: this.startingLoad,
      startingMemory: this.startingMemory,
      startingStorage: this.startingStorage,
      currentLoad: this.currentLoad,
      currentMemory: this.currentMemory,
      currentStorage: this.currentStorage,
      decreaseResourceInterval: this.decreaseResourceInterval,
      lastSshLogin: this.lastSshLogin
    }
  }

  public load(savedVm: ISavedVm): void {
    this.name = savedVm.name;
    this.decreaseResourceInterval = savedVm.decreaseResourceInterval;
    this.lastSshLogin = savedVm.lastSshLogin;
    // cpus, memory, storage and type are all set already via setResourceLimits
    this.setPoweredOn(savedVm.poweredOn);
    // starting + current load, memory and cpu are all set above via setPoweredOn
    // however, we want to override current stats with what was saved
    this.poweredOnAt = savedVm.poweredOnAt;
    this.currentLoad = savedVm.currentLoad;
    this.currentMemory = savedVm.currentMemory;
    this.currentStorage = savedVm.currentStorage;
  }

  public getServer(): Server {
    return this.server;
  }

  public setResourceLimits(cpus: number, memory: number, storage: number): void {
    this.cpus = cpus;
    this.memory = memory;
    this.storage = storage;
  }

  public getAllocatedCpus(): number {
    return this.cpus;
  }

  public getAllocatedMemory(): number {
    return this.memory;
  }

  public getAllocatedStorage(): number {
    return this.storage;
  }

  public setType(vmType: VM_TYPES): void {
    this.type = vmType;
    this.name = this.game.infraManager.getNextVmName(vmType);
  }

  public getType(): VM_TYPES {
    return this.type;
  }

  public getName(): String {
    return this.name;
  }

  public getShortType(): String {
    return VM.getShortType(this.type);
  }

  public setPoweredOn(powerOn: Boolean): void {
    this.poweredOn = powerOn;
    if (powerOn === true) {
      this.startingLoad = this.currentLoad = 0.1;
      this.startingMemory = this.currentMemory = 0.2;
      if (this.currentStorage === 0) {
        this.startingStorage = this.currentStorage = 0.1;
      }
      this.poweredOnAt = Date.now();
      this.lowerResourcesTimer = setInterval(this.lowerResourceUsage.bind(this), this.decreaseResourceInterval);
    } else {
      this.currentLoad = 0;
      this.currentMemory = 0;
      clearInterval(this.lowerResourcesTimer);
      this.lowerResourcesTimer = null;
    }

    this.game.infraManager.renderInfrastructureView();
  }

  public getPoweredOn(): Boolean {
    return this.poweredOn;
  }

  public getCurrentLoad(): number {
    return this.currentLoad;
  }

  public getCurrentMemory(): number {
    return this.currentMemory;
  }

  public getCurrentStorage(): number {
    return this.currentStorage;
  }

  public canHandle(route: String): Boolean {
    if (this.currentLoad > this.cpus) {
      return false;
    } else if (this.currentMemory > this.memory) {
      return false;
    } else if (this.currentStorage > this.storage) {
      return false;
    }

    switch (this.type) {
      case VM_TYPES.WEB_MONOLITH:
        return route.match(/.*/) !== null;
    }
  }

  public handleRequest(methodName: String, route: String): Boolean {
    if (this.canHandle(route) === false) {
      return false;
    }
    
    this.currentLoad += 0.1;
    this.currentMemory += 0.05;
    this.currentStorage += 0.01;
    
    return true;
  }

  public updateSshLoginTime(): void {
    this.lastSshLogin = Date.now();
  }

  public getLastSshLogin(): String {
    if (this.lastSshLogin > 0) {
      return new Date(this.lastSshLogin).toString();
    }

    return 'Never';
  }

  public getUptime(): String {
    if (this.getPoweredOn() === false) {
      return 'Uptime: 0s';
    }

    const uptimeMs = Date.now() - this.poweredOnAt;
    const uptimeSecs = uptimeMs / 1000;

    return `Uptime: ${uptimeSecs} seconds`;
  }

  public resetStorage(): number {
    this.currentStorage = this.startingStorage;
    this.game.infraManager.renderInfrastructureView();
    return this.currentStorage;
  }

  private lowerResourceUsage(): void {
    if (this.currentLoad > this.startingLoad) {
      this.currentLoad -= (0.01 * this.currentLoad);
      this.game.infraManager.renderInfrastructureView();
    }
    if (this.currentMemory > this.startingMemory) {
      this.currentMemory -= (0.01 * this.currentMemory);
      this.game.infraManager.renderInfrastructureView();
    }
  }
}

export default VM;
export { VM_TYPES  };