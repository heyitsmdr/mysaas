import BaseObject from './BaseObject';
import Game from './Game';
import Server from './Server';

enum VM_TYPES {
  WEB_MONOLITH
}

class VM extends BaseObject {
  private server: Server;

  // Saved
  private name: String;
  private cpus: number = 0;
  private memory: number = 0;
  private storage: number = 0;
  private type: VM_TYPES = VM_TYPES.WEB_MONOLITH;
  private poweredOn: Boolean = false;
  private currentLoad: number = 0.0;
  private currentMemory: number = 0.0;
  private currentStorage: number = 0.0;

  constructor(game: Game, server: Server) {
    super(game);
    this.server = server;
  }

  public static getShortType(vmType: VM_TYPES) {
    switch (vmType) {
      case VM_TYPES.WEB_MONOLITH:
        return 'web';
      default:
        return 'unknown';
    }
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
    this.currentLoad = 0.1;
    this.currentMemory = 0.2;
    this.currentStorage = 0.1;
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
}

export { VM_TYPES, VM };