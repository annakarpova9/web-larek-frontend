import './scss/styles.scss';
import { EventEmitter } from './components/base/events';
import { API_URL, CDN_URL } from './utils/constants';
import { AppApi } from './components/AppApi';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Events, IApi, IOrderForm, IProduct } from './types';
import { Api } from './components/base/api';
import { AppModel, ProductModel } from './components/model/AppModel';
import { PageView } from './components/view/PageView';
import { ModalView } from './components/common/ModalView';
import { BasketView } from './components/view/BasketView';
import { OrderView } from './components/view/OrderView';
import { ContactsView } from './components/view/ContactsView';
import { SuccessView } from './components/view/SuccessView';
import {
	CardCatalog,
	CardPreview,
	CardBasket,
} from './components/view/CardView';

const baseApi: IApi = new Api(API_URL);
const api = new AppApi(CDN_URL, baseApi);
const events = new EventEmitter();

// Чтобы мониторить все события, для отладки
// events.onAll(({ eventName, data }) => {
// 	console.log(eventName, data);
// });

// Все контейнеры и шаблоны

const pageContainer = ensureElement<HTMLBodyElement>('.page');
const modalContainer = ensureElement<HTMLElement>('#modal-container');

const successOrderTemplate = ensureElement<HTMLTemplateElement>('#success');
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

// Модель данных приложения

const appModel = new AppModel({}, events);

// Экземпляры классов

const modal = new ModalView(modalContainer, events);
const pageView = new PageView(pageContainer, events);
const basketView = new BasketView(cloneTemplate(basketTemplate), {
	onClick: () => {
		appModel.order.total = appModel.getTotal();
		appModel.order.items = appModel.basket.map((item) => item.id);
		events.emit(Events.ORDER_OPEN);
	},
});
const orderView = new OrderView(cloneTemplate(orderTemplate), events);
const contactsView = new ContactsView(cloneTemplate(contactsTemplate), events);
const successView = new SuccessView(cloneTemplate(successOrderTemplate), {
	onClick: () => modal.close(),
});

// Отображение на главной странице

events.on(Events.CARDS_CHANGED, () => {
	pageView.catalog = appModel.catalog.map((item: ProductModel) => {
		const card = new CardCatalog(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit(Events.PREVIEW_SELECT, item),
		});
		return card.render({
			image: item.image,
			title: item.title,
			category: item.category,
			price: item.price,
		});
	});
	pageView.counter = appModel.basket.length;
});

// Отображение выбранной карточки

events.on(Events.PREVIEW_SELECT, (product: ProductModel) => {
	const card = new CardPreview(cloneTemplate(cardPreviewTemplate), events, {
		onClick: () => events.emit(Events.PRODUCT_ADD_TO_BASKET, product),
		onClickPreview: () => {
			events.emit(Events.PRODUCT_DELETE_FROM_BASKET, product);
			modal.close();
			modal.close(); // для снятия лока экрана
		},
	});
	modal.render({
		content: card.render({
			description: product.description,
			image: product.image,
			title: product.title,
			category: product.category,
			price: product.price,
			buttonState: {
				stateIsNull: product.getStateIsNull(),
				stateInBasket: appModel.getInBasket(product),
			},
		}),
	});
});

// Добавление продукта в корзину

events.on(Events.PRODUCT_ADD_TO_BASKET, (product: IProduct) => {
	appModel.addToBasket(product);
	pageView.counter = appModel.basket.length;
	modal.close();
});

// Отображение корзины

events.on(Events.BASKET_CHANGE, () => {
	const items = appModel.basket.map((item, index) => {
		const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				events.emit(Events.PRODUCT_DELETE_FROM_BASKET, item);
			},
		});
		return card.render({
			id: item.id,
			index: index + 1,
			title: item.title,
			price: item.price,
		});
	});
	modal.render({
		content: basketView.render({
			items,
			total: appModel.getTotal(),
		}),
	});
});

// Удаление продукта из корзины

events.on(Events.PRODUCT_DELETE_FROM_BASKET, (product: IProduct) => {
	appModel.removeFromBasket(product);
	pageView.counter = appModel.basket.length;
});

// Начало оформления заказа

events.on(Events.ORDER_OPEN, () => {
	modal.render({
		content: orderView.render({
			valid: false,
			formErrors: [],
		}),
	});
});

// Заполнена первая форма заказа

events.on(Events.ORDER_SUBMIT, () => {
	modal.render({
		content: contactsView.render({
			valid: false,
			formErrors: [],
		}),
	});
});

// Заполнен весь заказ

events.on(Events.CONTACTS_SUBMIT, () => {
	api
		.postOrder({
			...appModel.order,
		})
		.then((res) => {
			modal.render({
				content: successView.render({
					total: res.total,
				}),
			});
		})
		.catch((err) => console.log(err));

	appModel.clearBasket();
	appModel.clearOrder();
});

// Изменилось состояние валидации формы
events.on(Events.FORM_ERRORS_CHANGE, (errors: Partial<IOrderForm>) => {
	const { payment, address, email, phone } = errors;
	orderView.valid = !payment && !address;
	orderView.formErrors = Object.values({ payment, address })
		.filter((i) => !!i)
		.join(';  ');
	contactsView.valid = !email && !phone;
	contactsView.formErrors = Object.values({ phone, email })
		.filter((i) => !!i)
		.join('; ');
});

// Изменилось одно из полей
events.on(
	/(^order|^contacts)\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		appModel.setOrderField(data.field, data.value);
	}
);

// Блокировка страницы при открытом модальном окне
events.on(Events.MODAL_OPEN, () => {
	pageView.wrapperLocked = true;
});

// Разблокировка страницы при закрытии модального окна
events.on(Events.MODAL_CLOSE, () => {
	pageView.wrapperLocked = false;
});

// Карточки с сервера
api
	.getProductList()
	.then((res) => appModel.setCatalog(res))
	.catch((err) => console.log(err));
