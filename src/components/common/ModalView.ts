import { Component } from '../base/Component';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';
import { Events } from '../../types';

interface IModalView {
	content: HTMLElement;
}

export class ModalView extends Component<IModalView> {
	protected _content: HTMLElement;
	protected _closeButton: HTMLButtonElement;

	constructor(protected container: HTMLElement, protected events: IEvents) {
		super(container);

		this._content = ensureElement<HTMLElement>(
			'.modal__content',
			this.container
		);
		this._closeButton = ensureElement<HTMLButtonElement>(
			'.modal__close',
			this.container
		);

		this._closeButton.addEventListener('click', this.close.bind(this));
		this.container.addEventListener('click', this.close.bind(this));
		document
			.querySelector('.modal__container')
			.addEventListener('click', (evt) => evt.stopPropagation());
	}

	set content(content: HTMLElement) {
		this._content.replaceChildren(content);
	}

	open() {
		this.container.classList.add('modal_active');
		this.events.emit(Events.MODAL_OPEN);
	}

	close() {
		this.container.classList.remove('modal_active');
		this.events.emit(Events.MODAL_CLOSE);
	}

	render(data: IModalView) {
		super.render(data);
		this.open();
		return this.container;
	}
}
