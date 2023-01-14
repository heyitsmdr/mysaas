import BaseManager from './BaseManager';
import { VM_TYPES } from '../VM';

class EventManager extends BaseManager {
  public emit(eventName: String, eventParameter: String = '') {
    console.log(`[emit] ${eventName} [${eventParameter}]`);

    switch (eventName) {
      case 'switch_view':
        this.handleSwitchView(eventParameter);
        break;
      case 'visit_website':
        this.handleVisitWebsite();
        break;
      case 'toggle_vm_power':
        this.handleToggleVmPower(eventParameter);
        break;
      case 'delete_vm':
        this.handleDeleteVm(eventParameter);
        break;
      case 'create_vm':
        this.handleCreateVm(eventParameter);
        break;
      case 'edit_vm':
        this.handleEditVm(eventParameter);
        break;
      case 'ssh_vm':
        this.handleSshVm(eventParameter);
        break;
      case 'close_ssh':
        this.handleCloseSsh();
        break;
      case 'vm_delete_logs':
        this.handleDeleteVmLogs(eventParameter);
        break;
      case 'shop_purchase':
        this.handleShopPurchase(eventParameter);
        break;
      default:
        console.log('Invalid event emitted', eventName, eventParameter);
    }
  }

  private handleSwitchView(viewName: String): void {
    // Reset
    const gameViewDivs: NodeListOf<Element> = document.querySelectorAll('.game-view');
    for (let i = 0; i < gameViewDivs.length; i++){ gameViewDivs[i].classList.add('hidden')}
    const viewLinkSpans: NodeListOf<Element> = document.querySelectorAll('.view-links');
    for (let i = 0; i < viewLinkSpans.length; i++){ viewLinkSpans[i].classList.remove('selected')}

    switch (viewName) {
      case 'infra':
        document.querySelector('.game .infrastructure').classList.remove('hidden');
        document.querySelector('#view-link-infra').classList.add('selected');
        document.querySelector('#view-name').innerHTML = '<i class="fas fa-server"></i>Your Infrastructure';
        this.game.infraManager.renderInfrastructureView();
        break;
      case 'dc':
        document.querySelector('.game .dc').classList.remove('hidden');
        document.querySelector('#view-link-dc').classList.add('selected');
        document.querySelector('#view-name').innerHTML = '<i class="fas fa-building"></i>Your DataCenters';
        break;
      case 'bank':
        document.querySelector('.game .bank').classList.remove('hidden');
        document.querySelector('#view-link-bank').classList.add('selected');
        document.querySelector('#view-name').innerHTML = '<i class="fas fa-piggy-bank"></i>The Bank';
        break;
      case 'shop':
        document.querySelector('.game .shop').classList.remove('hidden');
        document.querySelector('#view-link-shop').classList.add('selected');
        document.querySelector('#view-name').innerHTML = '<i class="fas fa-shopping-bag"></i>The Shop';
        this.game.shopManager.renderShopView();
        break;
      case 'ssh':
        document.querySelector('.game .ssh').classList.remove('hidden');
        break;
    }
  }

  private handleVisitWebsite(): void {
    this.game.trafficManager.generateHit();
  }

  private handleToggleVmPower(vmName: String): void {
    const dcs = this.game.infraManager.getDataCenters();
    for (let dci = 0; dci < dcs.length; dci++) {
      const vms = dcs[dci].getAllVMs();
      for (let vmi = 0; vmi < vms.length; vmi++) {
        if (vms[vmi].getName() === vmName) {
          vms[vmi].setPoweredOn(!vms[vmi].getPoweredOn());
          break;
        }
      }
    }

    this.game.infraManager.renderInfrastructureView();
  }

  private handleDeleteVm(vmName: String): void {
    const dcs = this.game.infraManager.getDataCenters();
    for (let dci = 0; dci < dcs.length; dci++) {
      const vms = dcs[dci].getAllVMs();
      for (let vmi = 0; vmi < vms.length; vmi++) {
        if (vms[vmi].getName() === vmName) {
          const server = vms[vmi].getServer();
          server.destroyVm(vmName);
        }
      }
    }
  }

  private handleCreateVm(serverName: String): void {
    const vmType = prompt('What type of VM do you want to provision?\n\nValid choies:\n  - web');

    if (!vmType) {
      return;
    }

    const dcs = this.game.infraManager.getDataCenters();
    for (let dci = 0; dci < dcs.length; dci++) {
      const servers = dcs[dci].getAllServers();
      for (let si = 0; si < servers.length; si++) {
        if (servers[si].getName() === serverName) {
          switch (vmType.toLowerCase()) {
            case 'web':
              servers[si].createVM(1, 1, 10, 0);
              break;
            default:
              alert('You have entered an invalid type. Nothing was created.');
              return;
          }

          break;
        }
      }
    }
  }

  private handleEditVm(vmName: String): void {
    const dcs = this.game.infraManager.getDataCenters();
    for (let dci = 0; dci < dcs.length; dci++) {
      const vms = dcs[dci].getAllVMs();
      for (let vmi = 0; vmi < vms.length; vmi++) {
        if (vms[vmi].getName() === vmName) {
          const vm = vms[vmi];
          
          if (vm.getPoweredOn() === true) {
            alert('You cannot edit a VM that is powered on.');
            return;
          }

          const editResource = prompt('Which resource would?>i you like to edit?\n\nValid choices:\n  - cpu\n  - memory\n  - storage');

          if (!editResource) {
            return;
          }

          switch (editResource.toLowerCase()) {
            case 'cpu':
              const newCpu = prompt(`What would you like to set the CPU cores to?\n\nCurrently Allocated: ${vm.getAllocatedCpus()}`)
              const newCpuNumber = Number(newCpu);
              if (newCpuNumber > 0) {
                const success = vm.getServer().modifyVM(vm, newCpuNumber, vm.getAllocatedMemory(), vm.getAllocatedStorage());
                if (!success) {
                  alert('The re-allocation of cpu was unsuccessful. Nothing was modified.');
                }
              }
              break;
            case 'memory':
              const newMemory = prompt(`What would you like to set the Memory (in GB) to?\n\nCurrently Allocated: ${vm.getAllocatedMemory()}GB`)
              const newMemoryNumber = Number(newMemory.toLowerCase().replace('gb', ''));
              if (newMemoryNumber > 0) {
                const success = vm.getServer().modifyVM(vm, vm.getAllocatedCpus(), newMemoryNumber, vm.getAllocatedStorage());
                if (!success) {
                  alert('The re-allocation of memory was unsuccessful. Nothing was modified.');
                }
              }
              break;
            case 'storage':
              const newStorage = prompt(`What would you like to set the Storage (in GB) to?\n\nCurrently Allocated: ${vm.getAllocatedStorage()}GB`)
              const newStorageNumber = Number(newStorage.toLowerCase().replace('gb', ''));
              if (newStorageNumber > 0) {
                const success = vm.getServer().modifyVM(vm, vm.getAllocatedCpus(), vm.getAllocatedStorage(), newStorageNumber);
                if (!success) {
                  alert('The re-allocation of storage was unsuccessful. Nothing was modified.');
                }
              }
              break;
            default:
              alert('You have entered an invalid resource type. Nothing was modified.');
          }
        }
      }
    }
  }

  private handleSshVm(vmName: String): void {
    const dcs = this.game.infraManager.getDataCenters();
    for (let dci = 0; dci < dcs.length; dci++) {
      const vms = dcs[dci].getAllVMs();
      for (let vmi = 0; vmi < vms.length; vmi++) {
        if (vms[vmi].getName() === vmName) {
          const vm = vms[vmi];

          this.handleSwitchView('ssh');
          document.querySelector('#view-name').innerHTML = `<i class="fas fa-terminal"></i>SSH: ${vmName}`;
          document.querySelector('.game .ssh .last-login').innerHTML = `Last login: ${vm.getLastSshLogin()}`;
          document.querySelector('.game .ssh .uptime').innerHTML = `<br>Uptime is ${vm.getUptime()}`;
          let actionsContainerHtml = '';
          actionsContainerHtml += `<div class="action" onclick="Game.eventManager.emit('vm_delete_logs', '${vm.getName()}')">Delete Logs</div>`;
          actionsContainerHtml += `<div class="action" onclick="Game.eventManager.emit('close_ssh')">Exit</div>`;
          document.querySelector('.game .ssh .actions .container').innerHTML = actionsContainerHtml;
          vm.updateSshLoginTime();
        }
      }
    }
  }

  private handleCloseSsh(): void {
    this.handleSwitchView('infra');
  }

  private handleDeleteVmLogs(vmName: String): void {
    const dcs = this.game.infraManager.getDataCenters();
    for (let dci = 0; dci < dcs.length; dci++) {
      const vms = dcs[dci].getAllVMs();
      for (let vmi = 0; vmi < vms.length; vmi++) {
        if (vms[vmi].getName() === vmName) {
          const vm = vms[vmi];

          const newStorage = vm.resetStorage();
        }
      }
    }
  }

  private handleShopPurchase(itemName: String): void {
    const item = this.game.shopManager.getItem(itemName);

    if (!item) {
      return;
    } else if (item.isPurchased() === true) {
      return;
    } else if (item.canAfford() === false) {
      alert('You cannot afford that shop item.');
      return;
    } else if (item.hasRequirements() === false) {
      alert('You do not meet the minimum requirements to purchase that shop item.');
      return;
    }

    const cost = item.getCost();
    this.game.takeMoney(cost);

    item.activateEffects();
    item.setAsPurchased();

    this.game.shopManager.renderShopView();
  }
}

export default EventManager;