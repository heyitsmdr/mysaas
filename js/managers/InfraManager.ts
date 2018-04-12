import BaseManager from './BaseManager';
import DataCenter from '../DataCenter';
import Game from '../Game';
import VM, { VM_TYPES } from '../VM';
import ISavedGame, { ISavedInfrastructure } from '../interfaces/ISavedGame';

class InfraManager extends BaseManager {
  private datacenters: Array<DataCenter> = [];

  constructor(game: Game) {
    super(game);
  }

  public save(): ISavedInfrastructure {
    return {
      datacenters: this.datacenters.map(dc => dc.save())
    }
  }

  public load(savedInfra: ISavedInfrastructure): void {
    savedInfra.datacenters.forEach(savedDc => {
      const dc = this.addDataCenter();
      dc.load(savedDc);
    });

    this.renderInfrastructureView();
  }

  public addDataCenter(): DataCenter {
    const dc: DataCenter = new DataCenter(this.game);
    this.datacenters.push(dc);
    this.updateDataCenterCount();
    return dc;
  }

  public getDataCenters(): Array<DataCenter> {
    return this.datacenters;
  }

  public updateDataCenterCount(): void {
    document.querySelector('#dc-count').innerHTML = this.datacenters.length.toString();
  }

  public updateRackCount(): void {
    let racks: number = 0;
    this.datacenters.forEach(dc => racks += dc.getRacks().length);
    document.querySelector('#rack-count').innerHTML = racks.toString();
  }

  public getServerCount(): number {
    let servers: number = 0;

    this.datacenters.forEach(dc => {
      dc.getRacks().forEach(rack => {
        servers += rack.getServers().length;
      });
    });

    return servers;
  }

  public updateServerCount(): void {
    document.querySelector('#server-count').innerHTML = this.getServerCount().toString();
  }

  public updateVMCount(): void {
    let vms: number = 0;

    this.datacenters.forEach(dc => {
      dc.getRacks().forEach(rack => {
        rack.getServers().forEach(server => {
          vms += server.getVMs().length;
        });
      });
    });

    document.querySelector('#vm-count').innerHTML = vms.toString();
  }

  public updateResourceCount(): void {
    let cpus: number = 0;
    let memory: number = 0;
    let storage: number = 0;

    this.datacenters.forEach(dc => {
      dc.getRacks().forEach(rack => {
        rack.getServers().forEach(server => {
          cpus += server.getAllocatedCpus();
          memory += server.getAllocatedMemory();
          storage += server.getAllocatedStorage();
        });
      });
    });

    document.querySelector('#cpu-count').innerHTML = cpus.toString();
    document.querySelector('#memory-count').innerHTML = `${memory.toString()}GB`;
    document.querySelector('#storage-count').innerHTML = `${storage.toString()}GB`;
  }

  public updateRps(successRps: number, failureRps: number): void {
    document.querySelector('#success-rps-count').innerHTML = successRps.toString();
    document.querySelector('#failure-rps-count').innerHTML = failureRps.toString();
  }

  private renderVmStatLine(statName: String, currentVal: number, maxVal: number, statSuffix: String = ''): String {
    const percentage = (currentVal * 100) / maxVal;
    let statColor = 'good-dark';

    if (percentage >= 99) {
      statColor = 'crit';
    } else if (percentage >= 80) {
      statColor = 'warn';
    }

    const current: String = parseFloat(currentVal.toString()).toFixed(2);

    return `<div class="stat ${statColor}"><strong>${statName}</strong>: ${current}${statSuffix} / ${maxVal}${statSuffix}</div>`;
  }

  public renderInfrastructureView(): void {
    let container = '';

    this.datacenters.forEach(dc => {
      dc.getRacks().forEach(rack => {
        rack.getServers().forEach(server => {
          container += `<div class="server-name">${server.getName()}`;
          container += `<span class="specs">[ Cores: ${server.getCpuUsage()}, Mem: ${server.getMemoryUsage()}, Storage: ${server.getStorageUsage()} ]</span></div>`;
          container += `<div class="server">`;
          server.getVMs().forEach(vm => {
            container += `<div class="vm">`;
              container += `<div class="name">[${vm.getName()}]</div>`;
              container += `<div class="stat ${vm.getPoweredOn() ? 'good' : 'crit'}"><strong>${vm.getPoweredOn() ? 'ONLINE' : 'OFFLINE'}</strong></div>`;
              container += this.renderVmStatLine('Load', vm.getCurrentLoad(), vm.getAllocatedCpus());
              container += this.renderVmStatLine('Mem', vm.getCurrentMemory(), vm.getAllocatedMemory(), 'GB');
              container += this.renderVmStatLine('Storage', vm.getCurrentStorage(), vm.getAllocatedStorage(), 'GB');
              container += `<div class="actions">`;
                if (vm.getPoweredOn() === false) {
                  container += `<span class="link" onmousedown="Game.eventManager.emit('edit_vm', '${vm.getName()}')">Edit</span> | `;
                } else {
                  container += `<span class="link" onmousedown="Game.eventManager.emit('ssh_vm', '${vm.getName()}')">SSH</span> | `;
                }
                container += `<span class="link" onmousedown="Game.eventManager.emit('toggle_vm_power', '${vm.getName()}')">Power ${vm.getPoweredOn() ? 'Down' : 'Up'}</span> | `;
                container += `<span class="link" onmousedown="Game.eventManager.emit('delete_vm', '${vm.getName()}')">Delete</span>`;
              container += `</div>`;
            container += `</div>`;
          });
          container += `<div class="vm empty" onmousedown="Game.eventManager.emit('create_vm', '${server.getName()}')">+</div>`;
          container += `</div>`;
        });
      });
    });
    document.querySelector('.game .infrastructure .container').innerHTML = container;
  }

  public getNextServerName(): String {
    let serverNames: Array<String> = [];

    this.datacenters.forEach(dc => {
      dc.getRacks().forEach(rack => {
        rack.getServers().forEach(server => serverNames.push(server.getName()));
      });
    });

    for(let i = 1; i <= 99; i++) {
      if (serverNames.indexOf('server' + this.zeroPad(i, 2)) === -1) {
        return `server${this.zeroPad(i, 2).toString()}`;
      }
    }

    return null;
  }

  public getNextVmName(vmType: VM_TYPES): String {
    let vmNames: Array<String> = [];

    this.datacenters.forEach(dc => {
      dc.getRacks().forEach(rack => {
        rack.getServers().forEach(server => {
          server.getVMs().forEach(vm => vmNames.push(vm.getName()));
        });
      });
    });

    for(let i = 1; i <= 99; i++) {
      if (vmNames.indexOf(VM.getShortType(vmType) + this.zeroPad(i, 2)) === -1) {
        return VM.getShortType(vmType) + this.zeroPad(i, 2).toString();
      }
    }

    return null;
  }

  private zeroPad(num: number, places: number): String {
    const zero: number = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }
}

export default InfraManager