var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
System.register("managers/BaseManager", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var BaseManager;
    return {
        setters: [],
        execute: function () {
            BaseManager = /** @class */ (function () {
                function BaseManager(game) {
                    this.game = game;
                }
                return BaseManager;
            }());
            exports_1("default", BaseManager);
        }
    };
});
System.register("BaseObject", [], function (exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    var BaseObject;
    return {
        setters: [],
        execute: function () {
            BaseObject = /** @class */ (function () {
                function BaseObject(game) {
                    this.game = game;
                }
                return BaseObject;
            }());
            exports_2("default", BaseObject);
        }
    };
});
System.register("interfaces/ISavedGame", [], function (exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("Server", ["BaseObject", "VM"], function (exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    var BaseObject_1, VM_1, MAX_CPU, MAX_MEM, MAX_STORAGE, Server;
    return {
        setters: [
            function (BaseObject_1_1) {
                BaseObject_1 = BaseObject_1_1;
            },
            function (VM_1_1) {
                VM_1 = VM_1_1;
            }
        ],
        execute: function () {
            MAX_CPU = 8; // Core count
            MAX_MEM = 32; // GB
            MAX_STORAGE = 100; // GB
            Server = /** @class */ (function (_super) {
                __extends(Server, _super);
                function Server(game) {
                    var _this = _super.call(this, game) || this;
                    _this.vms = [];
                    // Saved
                    _this.name = 'server00';
                    _this.name = _this.game.infraManager.getNextServerName();
                    return _this;
                }
                Server.prototype.save = function () {
                    return {
                        name: this.name,
                        vms: this.vms.map(function (vm) { return vm.save(); })
                    };
                };
                Server.prototype.load = function (savedServer) {
                    var _this = this;
                    this.name = savedServer.name;
                    savedServer.vms.forEach(function (savedVm) {
                        var vm = _this.createVM(savedVm.cpus, savedVm.memory, savedVm.storage, savedVm.type);
                        vm.load(savedVm);
                    });
                };
                Server.prototype.createVM = function (cpus, memory, storage, type) {
                    if ((this.getAllocatedCpus() + cpus) > MAX_CPU) {
                        return null;
                    }
                    else if ((this.getAllocatedMemory() + memory) > MAX_MEM) {
                        return null;
                    }
                    else if ((this.getAllocatedStorage() + storage) > MAX_STORAGE) {
                        return null;
                    }
                    var vm = new VM_1["default"](this.game, this);
                    this.vms.push(vm);
                    vm.setResourceLimits(cpus, memory, storage);
                    vm.setType(type);
                    this.game.infraManager.updateVMCount();
                    this.game.infraManager.updateResourceCount();
                    this.game.infraManager.renderInfrastructureView();
                    return vm;
                };
                Server.prototype.modifyVM = function (vm, cpus, memory, storage) {
                    var newAllocatedCpus = (this.getAllocatedCpus() - vm.getAllocatedCpus()) + cpus;
                    var newAllocatedMemory = (this.getAllocatedMemory() - vm.getAllocatedMemory()) + memory;
                    var newAllocatedStorage = (this.getAllocatedStorage() - vm.getAllocatedStorage()) + storage;
                    if (newAllocatedCpus > MAX_CPU || newAllocatedMemory > MAX_MEM || newAllocatedStorage > MAX_STORAGE) {
                        return false;
                    }
                    vm.setResourceLimits(cpus, memory, storage);
                    this.game.infraManager.updateResourceCount();
                    this.game.infraManager.renderInfrastructureView();
                    return true;
                };
                Server.prototype.getVMs = function () {
                    return this.vms;
                };
                Server.prototype.getAllocatedCpus = function () {
                    var cpus = 0;
                    this.vms.forEach(function (vm) { return cpus += vm.getAllocatedCpus(); });
                    return cpus;
                };
                Server.prototype.getAllocatedMemory = function () {
                    var memory = 0;
                    this.vms.forEach(function (vm) { return memory += vm.getAllocatedMemory(); });
                    return memory;
                };
                Server.prototype.getAllocatedStorage = function () {
                    var storage = 0;
                    this.vms.forEach(function (vm) { return storage += vm.getAllocatedStorage(); });
                    return storage;
                };
                Server.prototype.getCpuUsage = function () {
                    return this.getAllocatedCpus() + "/" + MAX_CPU;
                };
                Server.prototype.getMemoryUsage = function () {
                    return this.getAllocatedMemory() + "GB/" + MAX_MEM + "GB";
                };
                Server.prototype.getStorageUsage = function () {
                    return this.getAllocatedStorage() + "GB/" + MAX_STORAGE + "GB";
                };
                Server.prototype.getName = function () {
                    return this.name;
                };
                Server.prototype.destroyVm = function (vmName) {
                    var originalVmCount = this.vms.length;
                    this.vms = this.vms.filter(function (vm) {
                        return !(vm.getName() === vmName);
                    });
                    if (this.vms.length !== originalVmCount) {
                        this.game.infraManager.updateVMCount();
                        this.game.infraManager.updateResourceCount();
                        this.game.infraManager.renderInfrastructureView();
                        return true;
                    }
                    return false;
                };
                return Server;
            }(BaseObject_1["default"]));
            exports_4("default", Server);
        }
    };
});
System.register("VM", ["BaseObject"], function (exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    var BaseObject_2, VM_TYPES, VM;
    return {
        setters: [
            function (BaseObject_2_1) {
                BaseObject_2 = BaseObject_2_1;
            }
        ],
        execute: function () {
            (function (VM_TYPES) {
                VM_TYPES[VM_TYPES["WEB_MONOLITH"] = 0] = "WEB_MONOLITH";
                VM_TYPES[VM_TYPES["CDN"] = 1] = "CDN";
            })(VM_TYPES || (VM_TYPES = {}));
            VM = /** @class */ (function (_super) {
                __extends(VM, _super);
                function VM(game, server) {
                    var _this = _super.call(this, game) || this;
                    _this.cpus = 0;
                    _this.memory = 0;
                    _this.storage = 0;
                    _this.type = VM_TYPES.WEB_MONOLITH;
                    _this.poweredOn = false;
                    _this.poweredOnAt = 0;
                    _this.startingLoad = 0.0;
                    _this.startingMemory = 0.0;
                    _this.startingStorage = 0.0;
                    _this.currentLoad = 0.0;
                    _this.currentMemory = 0.0;
                    _this.currentStorage = 0.0;
                    _this.decreaseResourceInterval = 80;
                    _this.lastSshLogin = 0;
                    _this.server = server;
                    return _this;
                }
                VM.getShortType = function (vmType) {
                    switch (vmType) {
                        case VM_TYPES.WEB_MONOLITH:
                            return 'web';
                        default:
                            return 'unknown';
                    }
                };
                VM.prototype.save = function () {
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
                    };
                };
                VM.prototype.load = function (savedVm) {
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
                };
                VM.prototype.getServer = function () {
                    return this.server;
                };
                VM.prototype.setResourceLimits = function (cpus, memory, storage) {
                    this.cpus = cpus;
                    this.memory = memory;
                    this.storage = storage;
                };
                VM.prototype.getAllocatedCpus = function () {
                    return this.cpus;
                };
                VM.prototype.getAllocatedMemory = function () {
                    return this.memory;
                };
                VM.prototype.getAllocatedStorage = function () {
                    return this.storage;
                };
                VM.prototype.setType = function (vmType) {
                    this.type = vmType;
                    this.name = this.game.infraManager.getNextVmName(vmType);
                };
                VM.prototype.getType = function () {
                    return this.type;
                };
                VM.prototype.getName = function () {
                    return this.name;
                };
                VM.prototype.getShortType = function () {
                    return VM.getShortType(this.type);
                };
                VM.prototype.setPoweredOn = function (powerOn) {
                    this.poweredOn = powerOn;
                    if (powerOn === true) {
                        this.startingLoad = this.currentLoad = 0.1;
                        this.startingMemory = this.currentMemory = 0.2;
                        if (this.currentStorage === 0) {
                            this.startingStorage = this.currentStorage = 0.1;
                        }
                        this.poweredOnAt = Date.now();
                        this.lowerResourcesTimer = setInterval(this.lowerResourceUsage.bind(this), this.decreaseResourceInterval);
                    }
                    else {
                        this.currentLoad = 0;
                        this.currentMemory = 0;
                        clearInterval(this.lowerResourcesTimer);
                        this.lowerResourcesTimer = null;
                    }
                    this.game.infraManager.renderInfrastructureView();
                };
                VM.prototype.getPoweredOn = function () {
                    return this.poweredOn;
                };
                VM.prototype.getCurrentLoad = function () {
                    return this.currentLoad;
                };
                VM.prototype.getCurrentMemory = function () {
                    return this.currentMemory;
                };
                VM.prototype.getCurrentStorage = function () {
                    return this.currentStorage;
                };
                VM.prototype.canHandle = function (route) {
                    if (this.currentLoad > this.cpus) {
                        return false;
                    }
                    else if (this.currentMemory > this.memory) {
                        return false;
                    }
                    else if (this.currentStorage > this.storage) {
                        return false;
                    }
                    switch (this.type) {
                        case VM_TYPES.WEB_MONOLITH:
                            return route.match(/.*/) !== null;
                    }
                };
                VM.prototype.handleRequest = function (methodName, route) {
                    if (this.canHandle(route) === false) {
                        return false;
                    }
                    this.currentLoad += 0.1;
                    this.currentMemory += 0.05;
                    this.currentStorage += 0.01;
                    return true;
                };
                VM.prototype.updateSshLoginTime = function () {
                    this.lastSshLogin = Date.now();
                };
                VM.prototype.getLastSshLogin = function () {
                    if (this.lastSshLogin > 0) {
                        return new Date(this.lastSshLogin).toString();
                    }
                    return 'Never';
                };
                VM.prototype.getUptime = function () {
                    if (this.getPoweredOn() === false) {
                        return 'Uptime: 0s';
                    }
                    var uptimeMs = Date.now() - this.poweredOnAt;
                    var uptimeSecs = uptimeMs / 1000;
                    return "Uptime: " + uptimeSecs + " seconds";
                };
                VM.prototype.resetStorage = function () {
                    this.currentStorage = this.startingStorage;
                    this.game.infraManager.renderInfrastructureView();
                    return this.currentStorage;
                };
                VM.prototype.lowerResourceUsage = function () {
                    if (this.currentLoad > this.startingLoad) {
                        this.currentLoad -= (0.01 * this.currentLoad);
                        this.game.infraManager.renderInfrastructureView();
                    }
                    if (this.currentMemory > this.startingMemory) {
                        this.currentMemory -= (0.01 * this.currentMemory);
                        this.game.infraManager.renderInfrastructureView();
                    }
                };
                return VM;
            }(BaseObject_2["default"]));
            exports_5("default", VM);
        }
    };
});
System.register("managers/EventManager", ["managers/BaseManager"], function (exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    var BaseManager_1, EventManager;
    return {
        setters: [
            function (BaseManager_1_1) {
                BaseManager_1 = BaseManager_1_1;
            }
        ],
        execute: function () {
            EventManager = /** @class */ (function (_super) {
                __extends(EventManager, _super);
                function EventManager() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                EventManager.prototype.emit = function (eventName, eventParameter) {
                    if (eventParameter === void 0) { eventParameter = ''; }
                    console.log("[emit] " + eventName + " [" + eventParameter + "]");
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
                };
                EventManager.prototype.handleSwitchView = function (viewName) {
                    // Reset
                    var gameViewDivs = document.querySelectorAll('.game-view');
                    for (var i = 0; i < gameViewDivs.length; i++) {
                        gameViewDivs[i].classList.add('hidden');
                    }
                    var viewLinkSpans = document.querySelectorAll('.view-links');
                    for (var i = 0; i < viewLinkSpans.length; i++) {
                        viewLinkSpans[i].classList.remove('selected');
                    }
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
                };
                EventManager.prototype.handleVisitWebsite = function () {
                    this.game.trafficManager.generateHit();
                };
                EventManager.prototype.handleToggleVmPower = function (vmName) {
                    var dcs = this.game.infraManager.getDataCenters();
                    for (var dci = 0; dci < dcs.length; dci++) {
                        var vms = dcs[dci].getAllVMs();
                        for (var vmi = 0; vmi < vms.length; vmi++) {
                            if (vms[vmi].getName() === vmName) {
                                vms[vmi].setPoweredOn(!vms[vmi].getPoweredOn());
                                break;
                            }
                        }
                    }
                    this.game.infraManager.renderInfrastructureView();
                };
                EventManager.prototype.handleDeleteVm = function (vmName) {
                    var dcs = this.game.infraManager.getDataCenters();
                    for (var dci = 0; dci < dcs.length; dci++) {
                        var vms = dcs[dci].getAllVMs();
                        for (var vmi = 0; vmi < vms.length; vmi++) {
                            if (vms[vmi].getName() === vmName) {
                                var server = vms[vmi].getServer();
                                server.destroyVm(vmName);
                            }
                        }
                    }
                };
                EventManager.prototype.handleCreateVm = function (serverName) {
                    var vmType = prompt('What type of VM do you want to provision?\n\nValid choies:\n  - web');
                    if (!vmType) {
                        return;
                    }
                    var dcs = this.game.infraManager.getDataCenters();
                    for (var dci = 0; dci < dcs.length; dci++) {
                        var servers = dcs[dci].getAllServers();
                        for (var si = 0; si < servers.length; si++) {
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
                };
                EventManager.prototype.handleEditVm = function (vmName) {
                    var dcs = this.game.infraManager.getDataCenters();
                    for (var dci = 0; dci < dcs.length; dci++) {
                        var vms = dcs[dci].getAllVMs();
                        for (var vmi = 0; vmi < vms.length; vmi++) {
                            if (vms[vmi].getName() === vmName) {
                                var vm = vms[vmi];
                                if (vm.getPoweredOn() === true) {
                                    alert('You cannot edit a VM that is powered on.');
                                    return;
                                }
                                var editResource = prompt('Which resource would?>i you like to edit?\n\nValid choices:\n  - cpu\n  - memory\n  - storage');
                                if (!editResource) {
                                    return;
                                }
                                switch (editResource.toLowerCase()) {
                                    case 'cpu':
                                        var newCpu = prompt("What would you like to set the CPU cores to?\n\nCurrently Allocated: " + vm.getAllocatedCpus());
                                        var newCpuNumber = Number(newCpu);
                                        if (newCpuNumber > 0) {
                                            var success = vm.getServer().modifyVM(vm, newCpuNumber, vm.getAllocatedMemory(), vm.getAllocatedStorage());
                                            if (!success) {
                                                alert('The re-allocation of cpu was unsuccessful. Nothing was modified.');
                                            }
                                        }
                                        break;
                                    case 'memory':
                                        var newMemory = prompt("What would you like to set the Memory (in GB) to?\n\nCurrently Allocated: " + vm.getAllocatedMemory() + "GB");
                                        var newMemoryNumber = Number(newMemory.toLowerCase().replace('gb', ''));
                                        if (newMemoryNumber > 0) {
                                            var success = vm.getServer().modifyVM(vm, vm.getAllocatedCpus(), newMemoryNumber, vm.getAllocatedStorage());
                                            if (!success) {
                                                alert('The re-allocation of memory was unsuccessful. Nothing was modified.');
                                            }
                                        }
                                        break;
                                    case 'storage':
                                        var newStorage = prompt("What would you like to set the Storage (in GB) to?\n\nCurrently Allocated: " + vm.getAllocatedStorage() + "GB");
                                        var newStorageNumber = Number(newStorage.toLowerCase().replace('gb', ''));
                                        if (newStorageNumber > 0) {
                                            var success = vm.getServer().modifyVM(vm, vm.getAllocatedCpus(), vm.getAllocatedStorage(), newStorageNumber);
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
                };
                EventManager.prototype.handleSshVm = function (vmName) {
                    var dcs = this.game.infraManager.getDataCenters();
                    for (var dci = 0; dci < dcs.length; dci++) {
                        var vms = dcs[dci].getAllVMs();
                        for (var vmi = 0; vmi < vms.length; vmi++) {
                            if (vms[vmi].getName() === vmName) {
                                var vm = vms[vmi];
                                this.handleSwitchView('ssh');
                                document.querySelector('#view-name').innerHTML = "<i class=\"fas fa-terminal\"></i>SSH: " + vmName;
                                document.querySelector('.game .ssh .last-login').innerHTML = "Last login: " + vm.getLastSshLogin();
                                document.querySelector('.game .ssh .uptime').innerHTML = "<br>Uptime is " + vm.getUptime();
                                var actionsContainerHtml = '';
                                actionsContainerHtml += "<div class=\"action\" onclick=\"Game.eventManager.emit('vm_delete_logs', '" + vm.getName() + "')\">Delete Logs</div>";
                                actionsContainerHtml += "<div class=\"action\" onclick=\"Game.eventManager.emit('close_ssh')\">Exit</div>";
                                document.querySelector('.game .ssh .actions .container').innerHTML = actionsContainerHtml;
                                vm.updateSshLoginTime();
                            }
                        }
                    }
                };
                EventManager.prototype.handleCloseSsh = function () {
                    this.handleSwitchView('infra');
                };
                EventManager.prototype.handleDeleteVmLogs = function (vmName) {
                    var dcs = this.game.infraManager.getDataCenters();
                    for (var dci = 0; dci < dcs.length; dci++) {
                        var vms = dcs[dci].getAllVMs();
                        for (var vmi = 0; vmi < vms.length; vmi++) {
                            if (vms[vmi].getName() === vmName) {
                                var vm = vms[vmi];
                                var newStorage = vm.resetStorage();
                            }
                        }
                    }
                };
                EventManager.prototype.handleShopPurchase = function (itemName) {
                    var item = this.game.shopManager.getItem(itemName);
                    if (!item) {
                        return;
                    }
                    else if (item.isPurchased() === true) {
                        return;
                    }
                    else if (item.canAfford() === false) {
                        alert('You cannot afford that shop item.');
                        return;
                    }
                    else if (item.hasRequirements() === false) {
                        alert('You do not meet the minimum requirements to purchase that shop item.');
                        return;
                    }
                    var cost = item.getCost();
                    this.game.takeMoney(cost);
                    item.activateEffects();
                    item.setAsPurchased();
                    this.game.shopManager.renderShopView();
                };
                return EventManager;
            }(BaseManager_1["default"]));
            exports_6("default", EventManager);
        }
    };
});
System.register("Rack", ["BaseObject", "Server"], function (exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
    var BaseObject_3, Server_1, Rack;
    return {
        setters: [
            function (BaseObject_3_1) {
                BaseObject_3 = BaseObject_3_1;
            },
            function (Server_1_1) {
                Server_1 = Server_1_1;
            }
        ],
        execute: function () {
            Rack = /** @class */ (function (_super) {
                __extends(Rack, _super);
                function Rack() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.servers = [];
                    return _this;
                }
                Rack.prototype.save = function () {
                    return {
                        servers: this.servers.map(function (server) { return server.save(); })
                    };
                };
                Rack.prototype.load = function (savedRack) {
                    var _this = this;
                    savedRack.servers.forEach(function (savedServer) {
                        var server = _this.addServer();
                        server.load(savedServer);
                    });
                };
                Rack.prototype.addServer = function () {
                    var server = new Server_1["default"](this.game);
                    this.servers.push(server);
                    this.game.infraManager.updateServerCount();
                    this.game.infraManager.renderInfrastructureView();
                    return server;
                };
                Rack.prototype.getServers = function () {
                    return this.servers;
                };
                return Rack;
            }(BaseObject_3["default"]));
            exports_7("default", Rack);
        }
    };
});
System.register("DataCenter", ["BaseObject", "Rack"], function (exports_8, context_8) {
    "use strict";
    var __moduleName = context_8 && context_8.id;
    var BaseObject_4, Rack_1, DataCenter;
    return {
        setters: [
            function (BaseObject_4_1) {
                BaseObject_4 = BaseObject_4_1;
            },
            function (Rack_1_1) {
                Rack_1 = Rack_1_1;
            }
        ],
        execute: function () {
            DataCenter = /** @class */ (function (_super) {
                __extends(DataCenter, _super);
                function DataCenter() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.racks = [];
                    return _this;
                }
                DataCenter.prototype.save = function () {
                    return {
                        racks: this.racks.map(function (rack) { return rack.save(); })
                    };
                };
                DataCenter.prototype.load = function (savedDc) {
                    var _this = this;
                    savedDc.racks.forEach(function (savedRack) {
                        var rack = _this.addRack();
                        rack.load(savedRack);
                    });
                };
                DataCenter.prototype.addRack = function () {
                    var rack = new Rack_1["default"](this.game);
                    this.racks.push(rack);
                    this.game.infraManager.updateRackCount();
                    return rack;
                };
                DataCenter.prototype.getRacks = function () {
                    return this.racks;
                };
                DataCenter.prototype.getAllServers = function () {
                    var servers = [];
                    this.racks.forEach(function (rack) {
                        rack.getServers().forEach(function (server) { return servers.push(server); });
                    });
                    return servers;
                };
                DataCenter.prototype.getAllVMs = function () {
                    var vms = [];
                    this.racks.forEach(function (rack) {
                        rack.getServers().forEach(function (server) {
                            server.getVMs().forEach(function (vm) { return vms.push(vm); });
                        });
                    });
                    return vms;
                };
                return DataCenter;
            }(BaseObject_4["default"]));
            exports_8("default", DataCenter);
        }
    };
});
System.register("managers/InfraManager", ["managers/BaseManager", "DataCenter", "VM"], function (exports_9, context_9) {
    "use strict";
    var __moduleName = context_9 && context_9.id;
    var BaseManager_2, DataCenter_1, VM_2, InfraManager;
    return {
        setters: [
            function (BaseManager_2_1) {
                BaseManager_2 = BaseManager_2_1;
            },
            function (DataCenter_1_1) {
                DataCenter_1 = DataCenter_1_1;
            },
            function (VM_2_1) {
                VM_2 = VM_2_1;
            }
        ],
        execute: function () {
            InfraManager = /** @class */ (function (_super) {
                __extends(InfraManager, _super);
                function InfraManager(game) {
                    var _this = _super.call(this, game) || this;
                    _this.datacenters = [];
                    return _this;
                }
                InfraManager.prototype.save = function () {
                    return {
                        datacenters: this.datacenters.map(function (dc) { return dc.save(); })
                    };
                };
                InfraManager.prototype.load = function (savedInfra) {
                    var _this = this;
                    savedInfra.datacenters.forEach(function (savedDc) {
                        var dc = _this.addDataCenter();
                        dc.load(savedDc);
                    });
                    this.renderInfrastructureView();
                };
                InfraManager.prototype.addDataCenter = function () {
                    var dc = new DataCenter_1["default"](this.game);
                    this.datacenters.push(dc);
                    this.updateDataCenterCount();
                    return dc;
                };
                InfraManager.prototype.getDataCenters = function () {
                    return this.datacenters;
                };
                InfraManager.prototype.updateDataCenterCount = function () {
                    document.querySelector('#dc-count').innerHTML = this.datacenters.length.toString();
                };
                InfraManager.prototype.updateRackCount = function () {
                    var racks = 0;
                    this.datacenters.forEach(function (dc) { return racks += dc.getRacks().length; });
                    document.querySelector('#rack-count').innerHTML = racks.toString();
                };
                InfraManager.prototype.getServerCount = function () {
                    var servers = 0;
                    this.datacenters.forEach(function (dc) {
                        dc.getRacks().forEach(function (rack) {
                            servers += rack.getServers().length;
                        });
                    });
                    return servers;
                };
                InfraManager.prototype.updateServerCount = function () {
                    document.querySelector('#server-count').innerHTML = this.getServerCount().toString();
                };
                InfraManager.prototype.updateVMCount = function () {
                    var vms = 0;
                    this.datacenters.forEach(function (dc) {
                        dc.getRacks().forEach(function (rack) {
                            rack.getServers().forEach(function (server) {
                                vms += server.getVMs().length;
                            });
                        });
                    });
                    document.querySelector('#vm-count').innerHTML = vms.toString();
                };
                InfraManager.prototype.updateResourceCount = function () {
                    var cpus = 0;
                    var memory = 0;
                    var storage = 0;
                    this.datacenters.forEach(function (dc) {
                        dc.getRacks().forEach(function (rack) {
                            rack.getServers().forEach(function (server) {
                                cpus += server.getAllocatedCpus();
                                memory += server.getAllocatedMemory();
                                storage += server.getAllocatedStorage();
                            });
                        });
                    });
                    document.querySelector('#cpu-count').innerHTML = cpus.toString();
                    document.querySelector('#memory-count').innerHTML = memory.toString() + "GB";
                    document.querySelector('#storage-count').innerHTML = storage.toString() + "GB";
                };
                InfraManager.prototype.updateRps = function (successRps, failureRps) {
                    document.querySelector('#success-rps-count').innerHTML = successRps.toString();
                    document.querySelector('#failure-rps-count').innerHTML = failureRps.toString();
                };
                InfraManager.prototype.renderVmStatLine = function (statName, currentVal, maxVal, statSuffix) {
                    if (statSuffix === void 0) { statSuffix = ''; }
                    var percentage = (currentVal * 100) / maxVal;
                    var statColor = 'good-dark';
                    if (percentage >= 99) {
                        statColor = 'crit';
                    }
                    else if (percentage >= 80) {
                        statColor = 'warn';
                    }
                    var current = parseFloat(currentVal.toString()).toFixed(2);
                    return "<div class=\"stat " + statColor + "\"><strong>" + statName + "</strong>: " + current + statSuffix + " / " + maxVal + statSuffix + "</div>";
                };
                InfraManager.prototype.renderInfrastructureView = function () {
                    var _this = this;
                    var container = '';
                    this.datacenters.forEach(function (dc) {
                        dc.getRacks().forEach(function (rack) {
                            rack.getServers().forEach(function (server) {
                                container += "<div class=\"server-name\">" + server.getName();
                                container += "<span class=\"specs\">[ Cores: " + server.getCpuUsage() + ", Mem: " + server.getMemoryUsage() + ", Storage: " + server.getStorageUsage() + " ]</span></div>";
                                container += "<div class=\"server\">";
                                server.getVMs().forEach(function (vm) {
                                    container += "<div class=\"vm\">";
                                    container += "<div class=\"name\">[" + vm.getName() + "]</div>";
                                    container += "<div class=\"stat " + (vm.getPoweredOn() ? 'good' : 'crit') + "\"><strong>" + (vm.getPoweredOn() ? 'ONLINE' : 'OFFLINE') + "</strong></div>";
                                    container += _this.renderVmStatLine('Load', vm.getCurrentLoad(), vm.getAllocatedCpus());
                                    container += _this.renderVmStatLine('Mem', vm.getCurrentMemory(), vm.getAllocatedMemory(), 'GB');
                                    container += _this.renderVmStatLine('Storage', vm.getCurrentStorage(), vm.getAllocatedStorage(), 'GB');
                                    container += "<div class=\"actions\">";
                                    if (vm.getPoweredOn() === false) {
                                        container += "<span class=\"link\" onmousedown=\"Game.eventManager.emit('edit_vm', '" + vm.getName() + "')\">Edit</span> | ";
                                    }
                                    else {
                                        container += "<span class=\"link\" onmousedown=\"Game.eventManager.emit('ssh_vm', '" + vm.getName() + "')\">SSH</span> | ";
                                    }
                                    container += "<span class=\"link\" onmousedown=\"Game.eventManager.emit('toggle_vm_power', '" + vm.getName() + "')\">Power " + (vm.getPoweredOn() ? 'Down' : 'Up') + "</span> | ";
                                    container += "<span class=\"link\" onmousedown=\"Game.eventManager.emit('delete_vm', '" + vm.getName() + "')\">Delete</span>";
                                    container += "</div>";
                                    container += "</div>";
                                });
                                container += "<div class=\"vm empty\" onmousedown=\"Game.eventManager.emit('create_vm', '" + server.getName() + "')\">+</div>";
                                container += "</div>";
                            });
                        });
                    });
                    document.querySelector('.game .infrastructure .container').innerHTML = container;
                };
                InfraManager.prototype.getNextServerName = function () {
                    var serverNames = [];
                    this.datacenters.forEach(function (dc) {
                        dc.getRacks().forEach(function (rack) {
                            rack.getServers().forEach(function (server) { return serverNames.push(server.getName()); });
                        });
                    });
                    for (var i = 1; i <= 99; i++) {
                        if (serverNames.indexOf('server' + this.zeroPad(i, 2)) === -1) {
                            return "server" + this.zeroPad(i, 2).toString();
                        }
                    }
                    return null;
                };
                InfraManager.prototype.getNextVmName = function (vmType) {
                    var vmNames = [];
                    this.datacenters.forEach(function (dc) {
                        dc.getRacks().forEach(function (rack) {
                            rack.getServers().forEach(function (server) {
                                server.getVMs().forEach(function (vm) { return vmNames.push(vm.getName()); });
                            });
                        });
                    });
                    for (var i = 1; i <= 99; i++) {
                        if (vmNames.indexOf(VM_2["default"].getShortType(vmType) + this.zeroPad(i, 2)) === -1) {
                            return VM_2["default"].getShortType(vmType) + this.zeroPad(i, 2).toString();
                        }
                    }
                    return null;
                };
                InfraManager.prototype.zeroPad = function (num, places) {
                    var zero = places - num.toString().length + 1;
                    return Array(+(zero > 0 && zero)).join("0") + num;
                };
                return InfraManager;
            }(BaseManager_2["default"]));
            exports_9("default", InfraManager);
        }
    };
});
System.register("managers/TrafficManager", ["managers/BaseManager"], function (exports_10, context_10) {
    "use strict";
    var __moduleName = context_10 && context_10.id;
    var BaseManager_3, TrafficManager;
    return {
        setters: [
            function (BaseManager_3_1) {
                BaseManager_3 = BaseManager_3_1;
            }
        ],
        execute: function () {
            TrafficManager = /** @class */ (function (_super) {
                __extends(TrafficManager, _super);
                function TrafficManager(game) {
                    var _this = _super.call(this, game) || this;
                    _this.requestsPerSecTimer = null;
                    _this.requestsPerSecSuccess = 0;
                    _this.requestsPerSecFailure = 0;
                    _this.requestsPerSecTimer = setInterval(_this.resetAndRenderRPS.bind(_this), 1000);
                    return _this;
                }
                TrafficManager.prototype.resetAndRenderRPS = function () {
                    this.game.infraManager.updateRps(this.requestsPerSecSuccess, this.requestsPerSecFailure);
                    this.requestsPerSecSuccess = 0;
                    this.requestsPerSecFailure = 0;
                };
                TrafficManager.prototype.generateHit = function () {
                    var method = this.getRandomMethodType();
                    var path = this.getRandomPath(method);
                    var success = true;
                    // Compile a list of VMs capable of handling this route
                    // We will favor microservices over web monolith where
                    // appropriate.
                    var capableVMs = [];
                    this.game.infraManager.getDataCenters().forEach(function (dc) {
                        dc.getAllVMs().forEach(function (vm) {
                            if (vm.getPoweredOn() === true) {
                                if (vm.canHandle(path) === true) {
                                    capableVMs.push(vm);
                                }
                            }
                        });
                    });
                    // Get a random VM and pass the request on to the VM for handling
                    var vm = null;
                    if (capableVMs.length === 0) {
                        success = false;
                    }
                    else {
                        vm = capableVMs[Math.floor(Math.random() * capableVMs.length)];
                        success = vm.handleRequest(method, path);
                    }
                    if (success) {
                        this.requestsPerSecSuccess += 1;
                    }
                    else {
                        this.requestsPerSecFailure += 1;
                    }
                    var div = document.createElement('div');
                    div.className = 'pre';
                    div.innerHTML = "<span class=\"status-" + (success ? 'good' : 'bad') + "\">" + (success ? '200' : '503') + "</span> <span class=\"handled-by\">" + (success ? vm.getName() : '-') + "</span> " + method + " <span class=\"path\">" + path + "</span>";
                    document.querySelector('.traffic .access-logs .container').appendChild(div);
                    // Cleanup if needed
                    var logsRendered = document.querySelectorAll('.traffic .access-logs .container > div');
                    if (logsRendered.length >= 250) {
                        for (var i = 0; i < 50; i++) {
                            document.querySelector('.traffic .access-logs .container').removeChild(logsRendered[i]);
                        }
                    }
                    if (success) {
                        this.game.increaseHitCounter();
                        this.game.giveMoneyForHit();
                    }
                    this.game.infraManager.renderInfrastructureView();
                };
                TrafficManager.prototype.getRandomMethodType = function () {
                    var methods = ['GET', 'POST'];
                    return methods[Math.floor(Math.random() * methods.length)];
                };
                TrafficManager.prototype.getRandomPath = function (methodName) {
                    var paths = [];
                    switch (methodName) {
                        case 'GET':
                            paths = [
                                '/',
                                '/about',
                                '/jobs',
                                '/contact-us',
                                '/static/background.png',
                                '/static/favicon.ico',
                                '/static/sitemap.xml'
                            ];
                            for (var i = 1; i <= 100; i++) {
                                paths.push("/static/img/image" + i.toString() + ".png");
                            }
                            break;
                        case 'POST':
                            paths = [
                                '/api/login',
                                '/api/signup',
                                '/api/help/request',
                            ];
                            for (var i = 1; i <= 100; i++) {
                                paths.push("/api/help/" + i.toString() + "/save");
                                paths.push("/api/help/" + i.toString() + "/edit");
                            }
                            break;
                    }
                    return paths[Math.floor(Math.random() * paths.length)];
                };
                return TrafficManager;
            }(BaseManager_3["default"]));
            exports_10("default", TrafficManager);
        }
    };
});
System.register("ShopItem", [], function (exports_11, context_11) {
    "use strict";
    var __moduleName = context_11 && context_11.id;
    var SHOP_CATEGORY, ITEM_EFFECT, ShopItem;
    return {
        setters: [],
        execute: function () {
            (function (SHOP_CATEGORY) {
                SHOP_CATEGORY[SHOP_CATEGORY["GENERAL"] = 0] = "GENERAL";
                SHOP_CATEGORY[SHOP_CATEGORY["MARKETING"] = 1] = "MARKETING";
            })(SHOP_CATEGORY || (SHOP_CATEGORY = {}));
            exports_11("SHOP_CATEGORY", SHOP_CATEGORY);
            (function (ITEM_EFFECT) {
                ITEM_EFFECT[ITEM_EFFECT["INCREASE_TRAFFIC"] = 0] = "INCREASE_TRAFFIC";
            })(ITEM_EFFECT || (ITEM_EFFECT = {}));
            exports_11("ITEM_EFFECT", ITEM_EFFECT);
            ShopItem = /** @class */ (function () {
                function ShopItem(manager, category, name, cost, description, icon, effectString, requirements) {
                    if (requirements === void 0) { requirements = []; }
                    this.requirements = [];
                    // Saved
                    this.purchased = false;
                    this.manager = manager;
                    this.name = name;
                    this.cost = cost;
                    this.category = category;
                    this.description = description;
                    this.icon = icon;
                    this.effects = effectString;
                    if (requirements.length > 0) {
                        this.parseRequirements(requirements);
                    }
                }
                ShopItem.prototype.save = function () {
                    return {
                        name: this.name,
                        purchased: this.purchased
                    };
                };
                ShopItem.prototype.parseRequirements = function (requirements) {
                    var _this = this;
                    requirements.forEach(function (req) {
                        var item = _this.manager.getItem(req);
                        if (item instanceof ShopItem) {
                            _this.requirements.push(item);
                        }
                    });
                };
                ShopItem.prototype.getName = function () {
                    return this.name;
                };
                ShopItem.prototype.getDescription = function (parseDescription) {
                    if (parseDescription === void 0) { parseDescription = false; }
                    if (parseDescription) {
                        return this.description.replace(/\[/g, '<span>').replace(/\]/g, '</span>');
                    }
                    return this.description;
                };
                ShopItem.prototype.getIcon = function () {
                    return this.icon;
                };
                ShopItem.prototype.getCost = function () {
                    return this.cost;
                };
                ShopItem.prototype.isInCategory = function (category) {
                    return this.category === category;
                };
                ShopItem.prototype.getRequirements = function () {
                    return this.requirements;
                };
                ShopItem.prototype.hasRequirements = function () {
                    for (var i = 0; i < this.requirements.length; i++) {
                        if (this.requirements[i].isPurchased() === false) {
                            return false;
                        }
                    }
                    return true;
                };
                ShopItem.prototype.canAfford = function () {
                    return this.cost <= this.manager.game.getMoney();
                };
                ShopItem.prototype.isPurchased = function () {
                    return this.purchased;
                };
                ShopItem.prototype.setAsPurchased = function () {
                    this.purchased = true;
                };
                ShopItem.prototype.activateEffects = function () {
                    var _this = this;
                    this.effects.split(';').forEach(function (effect) {
                        var effectName = effect.split(':')[0];
                        var effectValue = effect.split(':')[1];
                        switch (effectName) {
                            case 'traffic':
                                _this.manager.game.increaseTrafficPerSec(Number(effectValue.replace('+', '')));
                                break;
                        }
                    });
                };
                return ShopItem;
            }());
            exports_11("default", ShopItem);
        }
    };
});
System.register("managers/ShopManager", ["managers/BaseManager", "ShopItem"], function (exports_12, context_12) {
    "use strict";
    var __moduleName = context_12 && context_12.id;
    var BaseManager_4, ShopItem_1, ShopManager;
    return {
        setters: [
            function (BaseManager_4_1) {
                BaseManager_4 = BaseManager_4_1;
            },
            function (ShopItem_1_1) {
                ShopItem_1 = ShopItem_1_1;
            }
        ],
        execute: function () {
            ShopManager = /** @class */ (function (_super) {
                __extends(ShopManager, _super);
                function ShopManager(game) {
                    var _this = _super.call(this, game) || this;
                    _this.items = [];
                    _this.populateItems();
                    return _this;
                }
                ShopManager.prototype.save = function () {
                    return {
                        items: this.items.map(function (item) { return item.save(); })
                    };
                };
                ShopManager.prototype.load = function (savedShop) {
                    var _this = this;
                    savedShop.items.forEach(function (item) {
                        var itemObj = _this.getItem(item.name);
                        if (itemObj && item.purchased === true) {
                            itemObj.setAsPurchased();
                        }
                    });
                };
                ShopManager.prototype.populateItems = function () {
                    // General
                    this.items.push(new ShopItem_1["default"](this, ShopItem_1.SHOP_CATEGORY.GENERAL, 'CDN', 500, 'Research how to create a [CDN] vm type. This will handle all [/static] routes.', 'fab fa-maxcdn', '', []));
                    // Marketing
                    this.items.push(new ShopItem_1["default"](this, ShopItem_1.SHOP_CATEGORY.MARKETING, 'Tell My Friends I', 100, 'You tell your friends about your new website and gain [+1/s] in traffic.', 'fas fa-users', 'traffic:+1', []));
                    this.items.push(new ShopItem_1["default"](this, ShopItem_1.SHOP_CATEGORY.MARKETING, 'Tell My Friends II', 1000, 'You post about your website on social media and gain [+5/s] in traffic.', 'fas fa-users', 'traffic:+5', ['Tell My Friends I']));
                    this.items.push(new ShopItem_1["default"](this, ShopItem_1.SHOP_CATEGORY.MARKETING, 'Podcast I', 2000, 'You advertise on a podcast and gain [+15/s] in traffic.', 'fas fa-podcast', 'traffic:+15', []));
                };
                ShopManager.prototype.getItem = function (itemName) {
                    for (var i = 0; i < this.items.length; i++) {
                        if (this.items[i].getName() === itemName) {
                            return this.items[i];
                        }
                    }
                    return null;
                };
                ShopManager.prototype.renderShopView = function () {
                    var _this = this;
                    var cats = [
                        { name: 'general', category: ShopItem_1.SHOP_CATEGORY.GENERAL },
                        { name: 'marketing', category: ShopItem_1.SHOP_CATEGORY.MARKETING }
                    ];
                    cats.forEach(function (cat) {
                        var divContainer = document.querySelector(".game .shop .shop-container." + cat.name);
                        var filteredItems = _this.items.filter(function (item) { return item.isInCategory(cat.category) && item.hasRequirements(); });
                        var divHtml = '';
                        filteredItems.forEach(function (item) {
                            divHtml += "<div class=\"item " + (item.isPurchased() ? 'purchased' : '') + "\" onclick=\"Game.eventManager.emit('shop_purchase', '" + item.getName() + "')\">";
                            divHtml += "<div class=\"icon\"><i class=\"" + item.getIcon() + "\"></i></div>";
                            divHtml += "<div class=\"about\">";
                            divHtml += "<div class=\"name\">" + item.getName() + "</div>";
                            divHtml += "<div class=\"desc\">" + item.getDescription(true) + "</div>";
                            if (item.getRequirements().length > 0) {
                                divHtml += "<div class=\"req\">Requires [";
                                item.getRequirements().forEach(function (req) {
                                    divHtml += "<span>" + req.getName() + "</span>";
                                });
                                divHtml += "]</div>";
                            }
                            divHtml += "</div>";
                            divHtml += "<div class=\"actions " + (item.isPurchased() ? 'purchased' : '') + "\">";
                            if (!item.isPurchased()) {
                                divHtml += '<div class="purchase">';
                                divHtml += '<div>BUY</div>';
                                divHtml += "<div class=\"purchase-amount " + (item.canAfford() ? '' : 'red') + "\">[ $" + item.getCost() + " ]</div>";
                                divHtml += '</div>';
                            }
                            else {
                                divHtml += '<div class="purchased"><i class="fas fa-check"></i></div>';
                            }
                            divHtml += "</div>";
                            divHtml += '</div>';
                        });
                        divContainer.innerHTML = divHtml;
                    });
                };
                return ShopManager;
            }(BaseManager_4["default"]));
            exports_12("default", ShopManager);
        }
    };
});
System.register("game", ["managers/EventManager", "managers/InfraManager", "managers/TrafficManager", "managers/ShopManager"], function (exports_13, context_13) {
    "use strict";
    var __moduleName = context_13 && context_13.id;
    var EventManager_1, InfraManager_1, TrafficManager_1, ShopManager_1, Game;
    return {
        setters: [
            function (EventManager_1_1) {
                EventManager_1 = EventManager_1_1;
            },
            function (InfraManager_1_1) {
                InfraManager_1 = InfraManager_1_1;
            },
            function (TrafficManager_1_1) {
                TrafficManager_1 = TrafficManager_1_1;
            },
            function (ShopManager_1_1) {
                ShopManager_1 = ShopManager_1_1;
            }
        ],
        execute: function () {
            Game = /** @class */ (function () {
                function Game() {
                    // Saved
                    this.visitCount = 0;
                    this.money = 0;
                    this.moneyPerHit = 1;
                    this.trafficPerSec = 0;
                    // Private
                    this.saveTimer = null;
                    this.trafficTimer = null;
                    this.partialTrafficCounter = 0;
                    this.eventManager = new EventManager_1["default"](this);
                    this.infraManager = new InfraManager_1["default"](this);
                    this.trafficManager = new TrafficManager_1["default"](this);
                    this.shopManager = new ShopManager_1["default"](this);
                    this.loadSavedGame();
                    this.saveTimer = setInterval(this.saveGame.bind(this), 1000);
                    this.trafficTimer = setInterval(this.generateTraffic.bind(this), 100);
                }
                Game.prototype.saveGame = function () {
                    var savedGame = {
                        lastSaveTime: Date.now(),
                        infrastructure: this.infraManager.save(),
                        visitCount: this.visitCount,
                        money: this.money,
                        moneyPerHit: this.moneyPerHit,
                        shop: this.shopManager.save(),
                        trafficPerSec: this.trafficPerSec
                    };
                    localStorage.setItem('savedGame', JSON.stringify(savedGame));
                };
                Game.prototype.loadSavedGame = function () {
                    if (localStorage.getItem('savedGame') !== null) {
                        var savedGame = JSON.parse(localStorage.getItem('savedGame'));
                        this.increaseHitCounter(savedGame.visitCount);
                        this.giveMoney(savedGame.money);
                        this.moneyPerHit = savedGame.moneyPerHit;
                        this.trafficPerSec = savedGame.trafficPerSec;
                        this.infraManager.load(savedGame.infrastructure);
                        this.shopManager.load(savedGame.shop);
                        return;
                    }
                    // Create a new game
                    this.giveMoney(1000);
                    var dc = this.infraManager.addDataCenter();
                    var rack = dc.addRack();
                    var server = rack.addServer();
                    var vm = server.createVM(1, 1, 10, 0);
                    vm.setPoweredOn(true);
                };
                Game.prototype.increaseHitCounter = function (amount) {
                    if (amount === void 0) { amount = 1; }
                    this.visitCount += amount;
                    document.querySelector('#hit-count').innerHTML = this.visitCount.toString();
                };
                Game.prototype.giveMoney = function (money) {
                    this.money += money;
                    this.updateMoney();
                };
                Game.prototype.takeMoney = function (money) {
                    this.money -= money;
                    this.updateMoney();
                };
                Game.prototype.updateMoney = function () {
                    document.querySelector('#money-count').innerHTML = "$" + this.money.toString();
                };
                Game.prototype.giveMoneyForHit = function () {
                    this.giveMoney(this.moneyPerHit);
                };
                Game.prototype.getMoney = function () {
                    return this.money;
                };
                Game.prototype.increaseTrafficPerSec = function (amount) {
                    this.trafficPerSec += amount;
                };
                Game.prototype.generateTraffic = function () {
                    if (this.trafficPerSec === 0) {
                        return;
                    }
                    var trafficPerTick = this.trafficPerSec / 10;
                    this.partialTrafficCounter += trafficPerTick;
                    if (this.partialTrafficCounter >= 1) {
                        var hits = Math.floor(this.partialTrafficCounter);
                        console.log(hits);
                        for (var i = 0; i < hits; i++) {
                            this.trafficManager.generateHit();
                        }
                        this.partialTrafficCounter -= hits;
                    }
                };
                return Game;
            }());
            exports_13("default", Game);
            window['Game'] = new Game();
        }
    };
});
