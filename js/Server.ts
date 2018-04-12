import BaseObject from './BaseObject';
import VM, { VM_TYPES } from './VM';
import Game from './Game';
import { ISavedServer } from './interfaces/ISavedGame';

const MAX_CPU = 8;      // Core count
const MAX_MEM = 32;      // GB
const MAX_STORAGE = 100; // GB

class Server extends BaseObject {
  private vms: Array<VM> = [];

  // Saved
  private name: String = 'server00';

  constructor(game: Game) {
    super(game);
    this.name = this.game.infraManager.getNextServerName();
  }

  public save(): ISavedServer {
    return {
      name: this.name,
      vms: this.vms.map(vm => vm.save())
    }
  }

  public load(savedServer: ISavedServer): void {
    this.name = savedServer.name;

    savedServer.vms.forEach(savedVm => {
      const vm = this.createVM(savedVm.cpus, savedVm.memory, savedVm.storage, savedVm.type);
      vm.load(savedVm);
    });
  }

  public createVM(cpus: number, memory: number, storage: number, type: VM_TYPES): VM {
    if ((this.getAllocatedCpus() + cpus) > MAX_CPU) {
      return null;
    } else if ((this.getAllocatedMemory() + memory) > MAX_MEM) {
      return null;
    } else if ((this.getAllocatedStorage() + storage) > MAX_STORAGE) {
      return null;
    }

    const vm = new VM(this.game, this);
    this.vms.push(vm);
    vm.setResourceLimits(cpus, memory, storage);
    vm.setType(type);
    this.game.infraManager.updateVMCount();
    this.game.infraManager.updateResourceCount();
    this.game.infraManager.renderInfrastructureView();
    return vm;
  }

  public modifyVM(vm: VM, cpus: number, memory: number, storage: number): Boolean {
    const newAllocatedCpus = (this.getAllocatedCpus() - vm.getAllocatedCpus()) + cpus;
    const newAllocatedMemory = (this.getAllocatedMemory() - vm.getAllocatedMemory()) + memory;
    const newAllocatedStorage = (this.getAllocatedStorage() - vm.getAllocatedStorage()) + storage;

    if (newAllocatedCpus > MAX_CPU || newAllocatedMemory > MAX_MEM || newAllocatedStorage > MAX_STORAGE) {
      return false;
    }

    vm.setResourceLimits(cpus, memory, storage);
    this.game.infraManager.updateResourceCount();
    this.game.infraManager.renderInfrastructureView();

    return true;
  }

  public getVMs(): Array<VM> {
    return this.vms;
  }

  public getAllocatedCpus(): number {
    let cpus: number = 0;
    this.vms.forEach(vm => cpus += vm.getAllocatedCpus())
    return cpus;
  }

  public getAllocatedMemory(): number {
    let memory: number = 0;
    this.vms.forEach(vm => memory += vm.getAllocatedMemory())
    return memory;
  }

  public getAllocatedStorage(): number {
    let storage: number = 0;
    this.vms.forEach(vm => storage += vm.getAllocatedStorage())
    return storage;
  }

  public getCpuUsage(): String {
    return `${this.getAllocatedCpus()}/${MAX_CPU}`;
  }

  public getMemoryUsage(): String {
    return `${this.getAllocatedMemory()}GB/${MAX_MEM}GB`;
  }

  public getStorageUsage(): String {
    return `${this.getAllocatedStorage()}GB/${MAX_STORAGE}GB`;
  }

  public getName(): String {
    return this.name;
  }

  public destroyVm(vmName: String): Boolean {
    const originalVmCount = this.vms.length;

    this.vms = this.vms.filter(vm => {
      return !(vm.getName() === vmName);
    });

    if (this.vms.length !== originalVmCount) {
      this.game.infraManager.updateVMCount();
      this.game.infraManager.updateResourceCount();
      this.game.infraManager.renderInfrastructureView();
      return true;
    }

    return false;
  }
}

export default Server;