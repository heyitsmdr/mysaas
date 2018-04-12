import Game from "./Game";
import ShopManager from "./managers/ShopManager";
import { ISavedShopItem } from "./interfaces/ISavedGame";

export enum SHOP_CATEGORY {
  GENERAL,
  MARKETING
}

export default class ShopItem {
  private manager: ShopManager;
  private category: SHOP_CATEGORY;
  private name: String;
  private cost: number;
  private description: String;
  private icon: String;
  private requirements: Array<ShopItem> = [];

  // Saved
  private purchased: Boolean = false;

  constructor(manager: ShopManager, category: SHOP_CATEGORY, name: String, cost: number, description: String, icon: String, requirements: Array<String> = []) {
    this.manager = manager;
    this.name = name;
    this.cost = cost;
    this.category = category;
    this.description = description;
    this.icon = icon;
    if (requirements.length > 0) {
      this.parseRequirements(requirements);
    }
  }

  public save(): ISavedShopItem {
    return {
      name: this.name,
      purchased: this.purchased
    }
  }

  private parseRequirements(requirements: Array<String>): void {
    requirements.forEach(req => {
      const item: ShopItem = this.manager.getItem(req);
      if (item instanceof ShopItem) {
        this.requirements.push(item);
      }
    });
  }

  public getName(): String {
    return this.name;
  }

  public getDescription(parseDescription: Boolean = false): String {
    if (parseDescription) {
      return this.description.replace(/\[/g, '<span>').replace(/\]/g, '</span>');
    }

    return this.description;
  }

  public getIcon(): String {
    return this.icon;
  }

  public getCost(): number {
    return this.cost;
  }

  public isInCategory(category: SHOP_CATEGORY): Boolean {
    return this.category === category;
  }

  public getRequirements(): Array<ShopItem> {
    return this.requirements;
  }

  public hasRequirements(): Boolean {
    for (let i = 0; i < this.requirements.length; i++) {
      if (this.requirements[i].isPurchased() === false) {
        return false;
      }
    }
    
    return true;
  }

  public canAfford(): Boolean {
    return this.cost <= this.manager.game.getMoney();
  }

  public isPurchased(): Boolean {
    return this.purchased;
  }

  public setAsPurchased(): void {
    this.purchased = true;
  }
}