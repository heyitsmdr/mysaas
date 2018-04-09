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
System.register("managers/EventManager", ["managers/BaseManager"], function (exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
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
                EventManager.prototype.emit = function (eventName) {
                    console.log("[emit] " + eventName);
                    if (eventName === 'visit_website') {
                        var result = this.game.trafficManager.generateHit();
                        var div = document.createElement('div');
                        div.className = 'pre';
                        div.innerHTML = "<span class=\"status-" + (result.statusCode === 200 ? 'good' : 'bad') + "\">" + result.statusCode + "</span> <span class=\"handled-by\">" + result.handledBy + "</span> " + result.method + " <span class=\"path\">" + result.path + "</span>";
                        document.querySelector('.traffic .access-logs .container').appendChild(div);
                        if (result.statusCode === 200) {
                            this.game.increaseHitCounter();
                            this.game.giveMoneyForHit();
                        }
                        this.game.infraManager.renderInfrastructureView();
                    }
                };
                return EventManager;
            }(BaseManager_1["default"]));
            exports_2("default", EventManager);
        }
    };
});
System.register("BaseObject", [], function (exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
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
            exports_3("default", BaseObject);
        }
    };
});
System.register("VM", ["BaseObject"], function (exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    var BaseObject_1, VM_TYPES, VM;
    return {
        setters: [
            function (BaseObject_1_1) {
                BaseObject_1 = BaseObject_1_1;
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
                    _this.startingLoad = 0.0;
                    _this.startingMemory = 0.0;
                    _this.startingStorage = 0.0;
                    _this.currentLoad = 0.0;
                    _this.currentMemory = 0.0;
                    _this.currentStorage = 0.0;
                    _this.decreaseResourceInterval = 80;
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
                        this.startingStorage = this.currentStorage = 0.1;
                        this.lowerResourcesTimer = setInterval(this.lowerResourceUsage.bind(this), this.decreaseResourceInterval);
                    }
                    else {
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
                VM.prototype.lowerResourceUsage = function () {
                    if (this.currentLoad > this.startingLoad) {
                        this.currentLoad -= 0.01;
                        this.game.infraManager.renderInfrastructureView();
                    }
                    if (this.currentMemory > this.startingMemory) {
                        this.currentMemory -= 0.01;
                        this.game.infraManager.renderInfrastructureView();
                    }
                };
                return VM;
            }(BaseObject_1["default"]));
            exports_4("VM", VM);
        }
    };
});
System.register("Server", ["BaseObject", "VM"], function (exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    var BaseObject_2, VM_1, MAX_CPU, MAX_MEM, MAX_STORAGE, Server;
    return {
        setters: [
            function (BaseObject_2_1) {
                BaseObject_2 = BaseObject_2_1;
            },
            function (VM_1_1) {
                VM_1 = VM_1_1;
            }
        ],
        execute: function () {
            MAX_CPU = 32; // Core count
            MAX_MEM = 64; // GB
            MAX_STORAGE = 400; // GB
            Server = /** @class */ (function (_super) {
                __extends(Server, _super);
                function Server(game) {
                    var _this = _super.call(this, game) || this;
                    _this.vms = [];
                    _this.name = 'server00';
                    _this.name = _this.game.infraManager.getNextServerName();
                    return _this;
                }
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
                    var vm = new VM_1.VM(this.game, this);
                    this.vms.push(vm);
                    vm.setResourceLimits(cpus, memory, storage);
                    vm.setType(type);
                    this.game.infraManager.updateVMCount();
                    this.game.infraManager.updateResourceCount();
                    this.game.infraManager.renderInfrastructureView();
                    return vm;
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
                Server.prototype.getName = function () {
                    return this.name;
                };
                return Server;
            }(BaseObject_2["default"]));
            exports_5("default", Server);
        }
    };
});
System.register("Rack", ["BaseObject", "Server"], function (exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
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
            exports_6("default", Rack);
        }
    };
});
System.register("DataCenter", ["BaseObject", "Rack"], function (exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
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
            exports_7("default", DataCenter);
        }
    };
});
System.register("managers/InfraManager", ["managers/BaseManager", "DataCenter", "VM"], function (exports_8, context_8) {
    "use strict";
    var __moduleName = context_8 && context_8.id;
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
                InfraManager.prototype.updateRps = function (rps) {
                    document.querySelector('#rps-count').innerHTML = rps.toString();
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
                                container += "<div class=\"server-name\">" + server.getName() + "</div>";
                                container += "<div class=\"server\">";
                                server.getVMs().forEach(function (vm) {
                                    container += "<div class=\"vm\">";
                                    container += "<div class=\"name\">[" + vm.getName() + "]</div>";
                                    container += "<div class=\"stat " + (vm.getPoweredOn() ? 'good' : 'crit') + "\"><strong>" + (vm.getPoweredOn() ? 'ONLINE' : 'OFFLINE') + "</strong></div>";
                                    container += _this.renderVmStatLine('Load', vm.getCurrentLoad(), vm.getAllocatedCpus());
                                    container += _this.renderVmStatLine('Mem', vm.getCurrentMemory(), vm.getAllocatedMemory(), 'GB');
                                    container += _this.renderVmStatLine('Storage', vm.getCurrentStorage(), vm.getAllocatedStorage(), 'GB');
                                    container += "</div>";
                                });
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
                        if (vmNames.indexOf(VM_2.VM.getShortType(vmType) + this.zeroPad(i, 2)) === -1) {
                            return VM_2.VM.getShortType(vmType) + this.zeroPad(i, 2).toString();
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
            exports_8("default", InfraManager);
        }
    };
});
System.register("managers/TrafficManager", ["managers/BaseManager"], function (exports_9, context_9) {
    "use strict";
    var __moduleName = context_9 && context_9.id;
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
                    _this.requestsPerSec = 0;
                    _this.requestsPerSecTimer = setInterval(_this.resetAndRenderRPS.bind(_this), 1000);
                    return _this;
                }
                TrafficManager.prototype.resetAndRenderRPS = function () {
                    this.game.infraManager.updateRps(this.requestsPerSec);
                    this.requestsPerSec = 0;
                };
                TrafficManager.prototype.getRequestsPerSec = function () {
                    return this.requestsPerSec;
                };
                TrafficManager.prototype.generateHit = function () {
                    var method = this.getRandomMethodType();
                    var path = this.getRandomPath(method);
                    var success = true;
                    this.requestsPerSec += 1;
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
                    return {
                        method: method,
                        path: path,
                        handledBy: success ? vm.getName() : '-',
                        statusCode: success ? 200 : 500
                    };
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
            exports_9("default", TrafficManager);
        }
    };
});
System.register("game", ["managers/EventManager", "managers/InfraManager", "managers/TrafficManager"], function (exports_10, context_10) {
    "use strict";
    var __moduleName = context_10 && context_10.id;
    var EventManager_1, InfraManager_1, TrafficManager_1, Game;
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
            }
        ],
        execute: function () {
            Game = /** @class */ (function () {
                function Game() {
                    // Stats
                    this.visitCount = 0;
                    this.money = 0;
                    this.moneyPerHit = 1;
                    this.eventManager = new EventManager_1["default"](this);
                    this.infraManager = new InfraManager_1["default"](this);
                    this.trafficManager = new TrafficManager_1["default"](this);
                    this.loadSavedGame();
                }
                Game.prototype.increaseHitCounter = function () {
                    this.visitCount += 1;
                    document.querySelector('#hit-count').innerHTML = this.visitCount.toString();
                };
                Game.prototype.loadSavedGame = function () {
                    if (localStorage.getItem('savedGame') !== null) {
                        // Set up a saved game..
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
                Game.prototype.giveMoney = function (money) {
                    this.money += money;
                    document.querySelector('#money-count').innerHTML = "$" + this.money.toString();
                };
                Game.prototype.giveMoneyForHit = function () {
                    this.giveMoney(this.moneyPerHit);
                };
                return Game;
            }());
            exports_10("default", Game);
            window['Game'] = new Game();
        }
    };
});
