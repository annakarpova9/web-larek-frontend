import './scss/styles.scss';
import { EventEmitter } from './components/base/events';

interface IBasketModel {
	items: Map<string, number>;
	add(id: string): void;
	remove(id: string): void;
}

interface IEventEmitter {
	emit: (event: string, data: unknown) => void;
}

class BasketModel implements IBasketModel {
	items: Map<string, number> = new Map();

	constructor(protected events: IEventEmitter) {}

	add(id: string): void {
		if (!this.items.has(id)) this.items.set(id, 0); // создаем новый
		this.items.set(id, this.items.get(id)! + 1); //прибавляем количество
		this._changed();
	}

	remove(id: string): void {
		if (!this.items.has(id)) return; //если карточки с айди нет, то и делать с ним нечего
		if (this.items.get(id)! > 0) {
			// если есть и больше 0, то ..
			this.items.set(id, this.items.get(id)! - 1); // уменьшаем
			if (this.items.get(id) === 0) this.items.delete(id); // если стал 0, то удаляем
		}
		this._changed();
	}

	protected _changed() {
		// метод генерирующий уведомление об изменении
		this.events.emit('basket:change', { items: Array.from(this.items.keys()) });
	}
}

const events = new EventEmitter();
const basket = new BasketModel(events);

events.on('basket:change', (data: { items: string[] }) => {});


