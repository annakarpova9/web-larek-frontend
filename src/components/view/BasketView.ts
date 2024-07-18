import { Component } from '../base/Component';
import { createElement, ensureElement } from '../../utils/utils';

interface IBasketActions {
	onClick: () => void;
}

interface IBasketView {
	items: HTMLElement[];
	total: number;
}

export class BasketView extends Component<IBasketView> {
	protected _list: HTMLElement;
	protected _total: HTMLElement;
	protected _actionButton: HTMLButtonElement;

	constructor(protected container: HTMLElement, actions: IBasketActions) {
		super(container);

		this._list = ensureElement<HTMLElement>('.basket__list', this.container);
		this._total = ensureElement<HTMLElement>('.basket__price', this.container);
		this._actionButton = ensureElement<HTMLButtonElement>(
			'.basket__button',
			this.container
		);

		this._actionButton.addEventListener('click', actions.onClick);
	}

	disabledActionButton(valid: boolean) {
		this.setDisabled(this._actionButton, valid);
	}

	set items(items: HTMLElement[]) {
		if (items.length) {
			this._list.replaceChildren(...items);
			this.disabledActionButton(false);
		} else {
			this._list.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Корзина пуста',
				})
			);
			this.disabledActionButton(true);
		}
	}

	set total(total: number) {
		this.setText(this._total, `${String(total)} синапсов`);
	}

	render(data?: IBasketView) {
		if (!data) return this.container;
		return super.render({ items: data.items, total: data.total });
	}
}
