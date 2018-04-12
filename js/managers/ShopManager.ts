import BaseManager from "./BaseManager";
import Game from "../Game";
import ShopItem, { SHOP_CATEGORY } from "../ShopItem";
import { ISavedShop } from "../interfaces/ISavedGame";

class ShopManager extends BaseManager {
  private items: Array<ShopItem> = [];

  constructor(game: Game) {
    super(game);
    this.populateItems();
  }

  public save(): ISavedShop {
    return {
      items: this.items.map(item => item.save())
    }
  }

  public load(savedShop: ISavedShop): void {
    savedShop.items.forEach(item => {
      const itemObj = this.getItem(item.name);
      if (itemObj && item.purchased === true) {
        itemObj.setAsPurchased();
      }
    });
  }

  private populateItems(): void {
    // General
    this.items.push(new ShopItem(this, SHOP_CATEGORY.GENERAL, 'CDN', 500, 'Research how to create a [CDN] vm type. This will handle all [/static] routes.', 'fab fa-maxcdn', []));
    // Marketing
    this.items.push(new ShopItem(this, SHOP_CATEGORY.MARKETING, 'Tell My Friends I', 100, 'You tell your friends about your new website and gain [+1/s] in traffic.', 'fas fa-users', []));
    this.items.push(new ShopItem(this, SHOP_CATEGORY.MARKETING, 'Tell My Friends II', 1000, 'You tell your friends about your new website and gain [+5/s] in traffic.', 'fas fa-users', ['Tell My Friends I']));
    this.items.push(new ShopItem(this, SHOP_CATEGORY.MARKETING, 'Podcast I', 2000, 'asldfksdflj asldkfj sldfkj sdlfkj sflkj sflksj flksjdf slkdfj sdlfkj sflksdfj You advertise on a podcast and gain [+15/s] in traffic.', 'fas fa-podcast', []));
  }

  public getItem(itemName: String): ShopItem {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].getName() === itemName) {
        return this.items[i];
      }
    }

    return null;
  }

  public renderShopView(): void {
    const cats = [
      { name: 'general', category: SHOP_CATEGORY.GENERAL },
      { name: 'marketing', category: SHOP_CATEGORY.MARKETING }
    ];

    cats.forEach(cat => {
      const divContainer = document.querySelector(`.game .shop .shop-container.${cat.name}`);
      const filteredItems = this.items.filter(item => item.isInCategory(cat.category) && item.hasRequirements());

      let divHtml = '';
      filteredItems.forEach(item => {
        divHtml += `<div class="item ${item.isPurchased() ? 'purchased' : ''}" onclick="Game.eventManager.emit('shop_purchase', '${item.getName()}')">`;
        divHtml += `<div class="icon"><i class="${item.getIcon()}"></i></div>`;
        divHtml += `<div class="about">`;
          divHtml += `<div class="name">${item.getName()}</div>`;
          divHtml += `<div class="desc">${item.getDescription(true)}</div>`;
          if (item.getRequirements().length > 0) {
            divHtml += `<div class="req">Requires [`;
            item.getRequirements().forEach(req => {
              divHtml += `<span>${req.getName()}</span>`;
            });
            divHtml += `]</div>`;
          }
        divHtml += `</div>`;
        divHtml += `<div class="actions ${item.isPurchased() ? 'purchased' : ''}">`;
        if (!item.isPurchased()) {
          divHtml += '<div class="purchase">';
            divHtml += '<div>BUY</div>';
            divHtml += `<div class="purchase-amount ${item.canAfford() ? '' : 'red'}">[ $${item.getCost()} ]</div>`;
          divHtml += '</div>';
        } else {
          divHtml += '<div class="purchased"><i class="fas fa-check"></i></div>';
        }
        divHtml += `</div>`;
        divHtml += '</div>';
      });

      divContainer.innerHTML = divHtml;
    });
  }
}

export default ShopManager;