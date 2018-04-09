import BaseObject from './BaseObject';
import { VM_TYPES, VM} from './VM';
import Game from './Game';

const MAX_CPU = 32;      // Core count
const MAX_MEM = 64;      // GB
const MAX_STORAGE = 400; // GB

class Server extends BaseObject {
  private vms: Array<VM> = [];
  private name: String = 'server00';

  constructor(game: Game) {
    super(game);
    this.name = this.game.infraManager.getNextServerName();
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

  public getName(): String {
    return this.name;
  }
}

export default Server;