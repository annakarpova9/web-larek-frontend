import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import { IOrder } from '../../types';

interface ISuccessActions {
	onClick: () => void;
}

export class SuccessView extends Component<Partial<IOrder>> {
	protected _total: HTMLElement;
	protected _successButton: HTMLButtonElement;

	constructor(protected container: HTMLElement, actions: ISuccessActions) {
		super(container);

		this._total = ensureElement('.order-success__description', this.container);
		this._successButton = ensureElement<HTMLButtonElement>(
			'.order-success__close',
			this.container
		);

		if (actions?.onClick) {
			this._successButton.addEventListener('click', actions.onClick);
		}
	}

	set total(total: number) {
		this.setText(this._total, `Списано ${total} синапсов`);
	}
}
