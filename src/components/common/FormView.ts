import { Component } from '../base/Component';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';
import { IOrderForm } from '../../types';

interface IFormView extends IOrderForm {
	valid: boolean;
	formErrors: string[];
}

export class FormView<T> extends Component<IFormView> {
	protected _formErrors: HTMLElement;
	protected _submitButton: HTMLButtonElement;

	constructor(protected container: HTMLFormElement, protected events: IEvents) {
		super(container);

		this._formErrors = ensureElement<HTMLElement>(
			'.form__errors',
			this.container
		);
		this._submitButton = ensureElement<HTMLButtonElement>(
			'.button[type=submit]',
			this.container
		);

		this.container.addEventListener('submit', (evt) => {
			evt.preventDefault();
			this.events.emit(`${this.container.name}:submit`);
		});

		this.container.addEventListener('input', (evt) => {
			const target = evt.target as HTMLInputElement;
			const field = target.name as keyof T;
			const value = target.value;
			this.onInputChanged(field, value);
		});
	}

	protected onInputChanged(field: keyof T, value: string) {
		this.events.emit(`${this.container.name}.${String(field)}:change`, {
			field,
			value,
		});
	}

	set valid(value: boolean) {
		this._submitButton.disabled = !value;
	}

	set formErrors(value: string) {
		this.setText(this._formErrors, value);
	}

	render(state: Partial<T> & IFormView) {
		const { valid, formErrors, ...inputs } = state;
		super.render({ valid, formErrors });
		Object.assign(this, inputs);
		return this.container;
	}
}
