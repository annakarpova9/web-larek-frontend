# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:

- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:

- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск

Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```

## Сборка

```
npm run build
```

или

```
yarn build
```

## Данные и типы данных, используемые в приложении

Данные карточки

```
interface ICard {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}
```

Данные заказа

```
interface IOrder {
	payment: TPayment;
	address: string;
	email: string;
	phone: string;
	total: number | null;
	items: TCardId[];
}
```

Тип данных вида оплаты

```
type TPayment = 'online' | 'cash';
```

Тип данных для id карточки

```
type TCardId = Pick<ICard, 'id'>;
```

Тип данных карточки при отображении на главной странице

```
type TCardPage = Pick<ICard, 'image' | 'title' | 'category' | 'price'>;
```

Тип данных карточки при присмотре выбранной карточки в модальном окне

```
type TCardInfo = Pick<ICard, 'description' | 'image' | 'title' | 'category' | 'price'>;
```

Тип данных карточки, используемый в корзине

```
type TCardBasket = Pick<ICard, 'title' | 'price'>;
```

Тип данных полной суммы заказа в модальных окнах

```
type TOrderTotal = Pick<IOrder, 'total'>;
```

Тип данных способа оплаты и адреса при оформлении заказа

```
type TOrderPayAddress = Pick<IOrder, 'payment' | 'address'>;
```

Тип данных контактной информации при оформлении заказа

```
type TOrderContacts = Pick<IOrder, 'email' | 'phone'>;
```

Интерфейс для модели данных карточек

```
interface ICardsData {
  cards: ICard[];
  preview: TCardId | null;
  getCardList(): ICard[];
  getCard(cardId: TCardId): ICard;
  hasInBasket(cardId: TCardId, basketCards: TCardId[]): boolean;
  hasPriceNull(price: number | null): boolean;
}
```

Интерфейс для модели данных заказа

```
interface IOrderData {
  orderData: IOrder;
  setOrderInfo(orderData: IOrder): void;
  checkValidation(data: Record<keyof TOrderPayAddress & TOrderContacts, string>): boolean;
}
```

Интерфейс для модели данных корзины

```
interface IBasketData {
  basketCards: ICard[];
  getBasketCards(): ICard[];
  addCard(card: TCardBasket): void;
  deleteBasketCard(TCardId: string): void;
  getTotal(prices: number[] | null): TOrderTotal;
  clearBasketCards(): void;
}
```

## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP:

- слой данных(Model) хранит, предоставляет и изменяет данные для пользовательского интерфейса,
- слой представления(View) реализует отображение данных на странице приложения,
- презентер(Presenter) отвечает за связь представления и данных.

### Базовый код

#### Класс Api

Содержит в себе базовую логику отправки запросов. В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов.
Методы:

- `get` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер
- `post` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.

#### Класс EventEmitter

Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.
Основные методы, реализуемые классом описаны интерфейсом `IEvents`:

- `on` - подписка на событие
- `emit` - инициализация события
- `trigger` - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие

### Слой данных

#### Класс CardsData

Класс отвечает за хранение и логику работы с данными карточек.\
Конструктор класса принимает инстант брокера событий.\
В полях класса хранятся следующие данные:

- `_cards: ICard[]` - массив объектов карточек;
- `_preview: string | null` - id карточки, выбранной для просмотра в модальной окне;
- `events: IEvents` - экземпляр класса `EventEmitter` для инициации событий при изменении данных.

Также класс предоставляет методы для взаимодейсвтия с данными карточки:

- `getCardList(): ICard[];` - получает массив карточек с сервера
- `getCard(cardId: TCardId): ICard;` - получает карточку по id
- `hasInBasket(cardId: TCardId, basketCards: TCardId[]): boolean;` - проверяет добавлена ли карточка в корзину(также для дальнейшего поведения кнопки "В корзину/Убрать из корзины")
- `hasPriceNull(price: number | null): boolean;` - проверяет цену на null, для дальнейшего изменения поведения кнопки "В корзину" - active/disable
- а так-же сеттеры и геттеры для сохранения и получения данных из полей класса.

#### Класс OrderData

Класс отвечает за хранение и логику работы с данными заказа.\
Конструктор класса принимает инстант брокера событий.\
В полях класса хранятся следующие данные:

- `payment: TPayment` - способ оплаты заказа;
- `address: string` - адрес доставки;
- `email: string` - почта пользователя;
- `phone: string` - телефон пользователя;
- `total: number | null` - общая сумма заказа;
- `items: ICard[]` - массив товаров в заказе;
- `orderData: IOrder` - объект заказа;
- `events: IEvents` - экземпляр класса `EventEmitter` для инициации событий при изменении данных.

Также класс предоставляет методы взаимодействия с данными:

- `setOrderInfo(orderData: IOrder): void;` - отправляет данные для оформления заказа на сервер;
- `checkValidation(data: Record<keyof TOrderPayAddress & TOrderContacts, string>): boolean` - проверяет валидацию данных в форме.

#### Класс BasketData

Класс отвечает за хранение и логику работы с данными заказа в корзине.\
Конструктор класса принимает инстант брокера событий.\
В полях класса хранятся следующие данные:

- `basketCards: TCardSelect[]` - массив карточек в корзине;
- `events: IEvents` - экземпляр класса `EventEmitter` для инициации событий при изменении данных.

Также класс предоставляет методы взаимодействия с данными:

- `getBasketCards(): ICard[];` - получает список добавленных карточек;
- `addCard(card: TCardBasket): void;` - добавляет карточку в корзину, после проверки добавленности карточки;
- `deleteBasketCard(TCardId: string): void;` - удаляет карточку из корзины;
- `getTotal(prices: number[] | null): TOrderTotal;` - получает общую суммы заказа;
- `clearBasketCards(): void;` - удаление всех карточек из корзины при успешном оформлении заказа;
- а так-же сеттеры и геттеры для сохранения и получения данных из полей класса.

### Классы представления

Все классы представления отвечают за отображение внутри контейнера (DOM-элемент) передаваемых в них данных.

#### Базовый Класс Component

Класс является дженериком и родителем всех компонентов слоя представления. В дженерик принимает тип объекта, в котором данные будут передаваться в метод `render` для отображения данных в компоненте.\
В конструктор принимает элемент разметки, являющийся основным родительским контейнером компонента. Содержит метод `render`, отвечающий за сохранение полученных в параметре данных в полях компонентов через их сеттеры, возвращает обновленный контейнер компонента.

#### Класс Modal

Реализует модальное окно. Устанавливает слушатели на клавиатуру, для закрытия модального окна по Esc, на клик в оверлей и кнопку-крестик для закрытия попапа.

- `constructor(selector: string, events: IEvents)` - конструктор принимает селектор, по которому в разметке страницы будет идентифицировано модальное окно и экземпляр класса `EventEmitter` для возможности инициации событий.

Поля класса:

- `modal: HTMLElement` - элемент модального окна;
- `events: IEvents` - брокер событий;
- `open` - открытие модального окна;
- `close` - закрытие модального окна.

#### Класс CardModal

Расширяет класс Modal. Предназначен для реализации модального окна с данными карточки.\
При сабмите инициирует событие, передавая карточку в корзину. Предоставляет управления активностью кнопки добавления при нулевой стоимости или уже добавленного товара.\
Поля класса:

- `submitButton: HTMLButtonElement` - кнопка добавления карточки в корзину;

Методы:

- `getCard(cardId: string): ICard` - возвращает карточку по id

#### Класс BasketModal

Расширяет класс Modal. Предназначен для реализации модального окна с отображением корзины. При открытии получает общую сумму заказа.\
При сабмите инициирует событие для оформления заказа. Предоставляет методы для изменения отображения списка.

Поля класса:

- `cardList: HTMLUListElement` - элемент разметки со списком;
- `totalBasketPrice: HTMLElement` - элемент разметки для вывода общей суммы заказа;
- `submitButton: HTMLButtonElement` - кнопка оформления заказа.

Методы:

- `render(cards: HTMLElement): void` - метод для добавления собранного элемента разметки карточки.

#### Класс FormModal

Расширяет класс Modal. Предназначен для реализации модального окна с формой содержащей поля ввода.\
При сабмите инициирует событие, передавая в него объект с данными из полей ввода формы. При изменении данных в полях ввода инициирует событие изменения данных.\
Предоставляет методы для отображения ошибок и управления активностью кнопки сохранения.

Поля класса:

- `submitButton: HTMLButtonElement` - кнопка подтверждения;
- `_form: HTMLFormElement` - элемент формы;
- `formName: string` - значение атрибута name формы;
- `inputs: NodeListOf<HTMLInputElement>` - коллекция всех полей ввода формы;
- `errors: Record<string, HTMLElement>` - объект хранящий все элементы для вывода ошибок под полями формы с привязкой к атрибуту name инпутов.

Методы:

- `set Valid(isValid: boolean): void` - изменяет активность кнопки подтверждения;
- `getInputValues(): Record<string, string>` - возвращает объект с данными из полей формы, где ключ - name инпута, значение - данные введенные пользователем;
- `setInputValues(data: Record<string, string>): void` - принимает объект с данными для заполнения полей формы;
- `setError(data: { field: string, value: string, validInformation: string }): void` - принимает объект с данными для отображения или сокрытия текстов ошибок под полями ввода;
- `showInputError (field: string, errorMessage: string): void` - отображает полученный текст ошибки под указанным полем ввода;
- `hideInputError (field: string): void` - очищает текст ошибки под указанным полем ввода;
- `close (): void` - расширяет родительский метод дополнительно при закрытии очищая поля формы и деактивируя кнопку сохранения;
- `get form: HTMLElement` - геттер для получения элемента формы.

#### Класс SuccessModal

Расширяет класс Modal. Предназначен для реализации модального окна с успешным оформлением заказа.
При открытии получает данные списанной суммы.

Поля класса:

- `_total: HTMLElement` - элемент разметки для вывода списанной суммы;
- `submitButton: HTMLButtonElement` - кнопка перехода на главную страницу.

Методы:

- `close(): void` - расширяет родительский метод. Дополнительно при закрытии очищает корзину.

#### Класс Card
Отвечает за отображение карточки, задавая в карточке данные категории, названия, изображения, описания и стоимости товара в карточке.\
Класс используется для отображения карточек на странице сайта. В конструктор класса передается DOM элемент темплейта, что позволяет при необходимости формировать карточки разных вариантов верстки.
В классе устанавливаются слушатели на все интерактивные элементы, в результате взаимодействия с которыми пользователя генерируются соответствующие события.\
Поля класса содержат элементы разметки элементов карточки. Конструктор, кроме темплейта принимает экземпляр `EventEmitter` для инициации событий.\
Методы:
- `render(cardData: Partial<ICard>, userId: TCardId): HTMLElement` - расширяет родительский метод. Заполняет атрибуты элементов карточки данными, а так-же управляет поведением кнопки добавления.
Кнопка будет доступна, если цена в карточке не null и будет менять свой текст при проверке на наличии карточки в корзине. Метод возвращает разметку карточки с установленными слушателями.
Слушатели устанавливаются на все интерактивные элементы карточки и генерируют соответствующие события через экземпляр брокера событий.
- геттер _id возвращает уникальный id карточки

### Слой коммуникации

#### Класс AppApi

Принимает в конструктор экземпляр класса Api и предоставляет методы реализующие взаимодействие с бэкендом сервиса.

## Взаимодействие компонентов

Код, описывающий взаимодействие представления и данных между собой находится в файле `index.ts`, выполняющем роль презентера.\
Взаимодействие осуществляется за счет событий генерируемых с помощью брокера событий и обработчиков этих событий, описанных в `index.ts`\
В `index.ts` сначала создаются экземпляры всех необходимых классов, а затем настраивается обработка событий.

_Список всех событий, которые могут генерироваться в системе:_\
_События изменения данных (генерируются классами моделями данных)_

- `cards:changed` - изменение массива карточек
- `card:selected` - изменение открываемой в модальном окне картинки карточки
- `card:previewClear` - необходима очистка данных выбранной для показа в модальном окне карточки

_События, возникающие при взаимодействии пользователя с интерфейсом (генерируются классами, отвечающими за представление)_

- `card:open` - открытие модального окна с описанием карточки;
- `basket:open` - открытие модального окна с корзиной;
- `paymentAddress:open` - открытие модального окна с формой выбора способа оплаты и ввода адреса доставки;
- `emailPhone:open` - открытие модального окна с формой ввода почты и телефона пользователя;
- `success:open` - открытие модального окна с успешным оформлением;
- `card:select` - выбор карточки для отображения в модальном окне;
- `card:add` - выбор карточки для добавления в корзину;
- `card:delete` - выбор карточки для удаления из корзины;
- `paymentAddress:submit` - сохранение данных выбора способа оплаты и адреса доставки в модальном окне;
- `emailPhone:submit` - сохранение почты и телефона пользователя в модальном окне;
- `paymentAddress:validation` - событие, сообщающее о необходимости валидации формы с выбором способа оплаты и вводом адреса доставки;
- `emailPhone:validation` - событие, сообщающее о необходимости валидации формы почты и теелфона пользователя;
- `modal: close` - закрытие модального окна;
