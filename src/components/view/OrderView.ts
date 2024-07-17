import { FormView } from '../common/FormView';
import { IOrderForm } from '../../types';
import { IEvents } from '../base/events';
import { ensureAllElements } from '../../utils/utils';

export class OrderView extends FormView<IOrderForm> {
	protected _paymentButtons: HTMLButtonElement[];

	constructor(protected container: HTMLFormElement, protected events: IEvents) {
		super(container, events);

		this._paymentButtons = ensureAllElements('.button_alt', this.container);

		this._paymentButtons.forEach((button) => {
			button.addEventListener('click', (evt) => {
				const target = evt.target as HTMLButtonElement;
				const field = 'payment';
				const value = target.name as keyof IOrderForm;
				this.onPaymentChange(value, field);
				if (!target.classList.contains('button_alt-active')) {
					this.selected = value;
				}
			});
		});
	}

	protected onPaymentChange(value: string, field: keyof IOrderForm) {
		this.events.emit(`${this.container.name}.${field}:change`, {
			field,
			value,
		});
	}

	set selected(name: string) {
		this._paymentButtons.forEach((button) => {
			this.toggleClass(button, 'button_alt-active', button.name === name);
			this.setDisabled(button, button.name === name);
		});
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}
}
