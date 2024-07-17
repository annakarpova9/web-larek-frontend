import { IApi, IProduct, IOrder, IOrderResult } from '../types';

type ApiListResponse<Type> = {
	total: number;
	items: Type[];
};

export interface IAppApi {
	getProductList: () => Promise<IProduct[]>;
	postOrder: (order: IOrder) => Promise<IOrderResult>;
}

export class AppApi implements IAppApi {
	private _baseApi: IApi;
	readonly cdn: string;

	constructor(cdn: string, baseApi: IApi, options?: RequestInit) {
		this.cdn = cdn;
		this._baseApi = baseApi;
	}

	async getProductList(): Promise<IProduct[]> {
		return await this._baseApi
			.get('/product')
			.then((data: ApiListResponse<IProduct>) =>
				data.items.map((item) => ({
					...item,
					image: this.cdn + item.image,
				}))
			);
	}

	async postOrder(order: IOrder): Promise<IOrderResult> {
		return await this._baseApi
			.post('/order', order)
			.then((data: IOrderResult) => data);
	}
}
