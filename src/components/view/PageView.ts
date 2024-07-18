import { Component } from '../base/Component';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';
import { Events } from '../../types';

interface IPageView {
	catalog: HTMLElement;
	counter: number;
	wrapperLocked: boolean;
	basketButton: HTMLButtonElement;
}

export class PageView extends Component<IPageView> {
	protected _catalog: HTMLElement;
	protected _counter: HTMLSpanElement;
	protected _wrapperLocked: HTMLElement;
	protected _basketButton: HTMLButtonElement;

	constructor(protected container: HTMLElement, protected events: IEvents) {
		super(container);
		this._catalog = ensureElement<HTMLElement>('.gallery', this.container);
		this._counter = ensureElement<HTMLSpanElement>(
			'.header__basket-counter',
			this.container
		);
		this._wrapperLocked = ensureElement<HTMLElement>(
			'.page__wrapper',
			this.container
		);
		this._basketButton = ensureElement<HTMLButtonElement>(
			'.header__basket',
			this.container
		);

		this._basketButton.addEventListener('click', () => {
			this.events.emit(Events.BASKET_OPEN);
		});
	}

	set catalog(items: HTMLElement[]) {
		this._catalog.replaceChildren(...items);
	}

	set counter(value: number) {
		this.setText(this._counter, String(value));
	}

	set wrapperLocked(value: boolean) {
		this.toggleClass(this._wrapperLocked, 'page__wrapper_locked');
	}
}
