import BaseManager from './BaseManager';
import DataCenter from '../DataCenter';
import Game from '../Game';

class InfraManager extends BaseManager {
    public datacenters: Array<DataCenter> = [];

    constructor(game: Game) {
        super(game);
        this.addDatacenter();
    }

    addDatacenter() {
        const dc = new DataCenter(this.game);
        this.datacenters.push(dc);
    }
}

export default InfraManager