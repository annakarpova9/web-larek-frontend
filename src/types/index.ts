export interface ICard {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

export interface IOrder {
	payment: TPayment;
	address: string;
	email: string;
	phone: string;
	total: number | null;
	items: TCardId[];
}

export type TPayment = 'online' | 'cash'; // тип данных вида оплаты

export type TCardId = Pick<ICard, 'id'>; // тип данных для id карточки

export type TCardPage = Pick<ICard, 'image' | 'title' | 'category' | 'price'>; // тип данных карточки при отображении на главной странице

export type TCardInfo = Pick<ICard, 'description' | 'image' | 'title' | 'category' | 'price'>; // тип данных карточки при присмотре выбранной карточки в модальном окне

export type TCardBasket = Pick<ICard, 'title' | 'price'>; // тип данных карточки, используемый в корзине

export type TOrderTotal = Pick<IOrder, 'total'>; // тип данных полной суммы заказа в модальных окнах

export type TOrderPayAddress = Pick<IOrder, 'payment' | 'address'>; // тип данных способа оплаты и адреса при оформлении заказа

export type TOrderContacts = Pick<IOrder, 'email' | 'phone'>; // тип данных контактной информации при оформлении заказа


export interface ICardsData {
  cards: ICard[]; // массив объектов карточек
  preview: TCardId | null; // id карточки, выбранной для просмотра в модальном окне или добавленной в корзину
  getCardList(): ICard[]; // получает массив карточек с сервера
  getCard(cardId: TCardId): ICard; // получает карточку по id
  hasInBasket(cardId: TCardId, basketCards: TCardId[]): boolean; // проверяет добавлена ли карточка в корзину(также для дальнейшего поведения кнопки "В корзину/Убрать из корзины")
  hasPriceNull(price: number | null): boolean; // проверяет цену на null, для дальнейшего изменения поведения кнопки "В корзину" - active/disable
}

export interface IOrderData {
  orderData: IOrder; // объект заказа
  setOrderInfo(orderData: IOrder): void; // отправляет данные для оформления заказа на сервер
  checkValidation(data: Record<keyof TOrderPayAddress & TOrderContacts, string>): boolean; // проверяет валидацию данных в форме
}

export interface IBasketData {
  basketCards: ICard[]; // список добавленных карточек в корзину
  getBasketCards(): ICard[]; // получает список добавленных карточек
  addCard(card: TCardBasket): void; // добавляет карточку в корзину, после проверки добавленности карточки
  deleteBasketCard(TCardId: string): void; // удаляет карточку из корзины
  getTotal(prices: number[] | null): TOrderTotal; // получает общую суммы заказа
  clearBasketCards(): void; // удаление всех карточек из корзины при успешном оформлении заказа
}
