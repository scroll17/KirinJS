export default class Loader {
	constructor(properties){
		this.headers = new Headers({ 'Content-Type': 'text/plain;charset=UTF-8' });
		this.proxy = "https://cors-anywhere.herokuapp.com/";
	}

	async _load(url, options){
		let response;

		if(options.proxy){
			response = await fetch(this.proxy + url, options);
		} else {
			response = await fetch(url, options);
		}

		if(!response.ok) return Promise.reject({ statusCode: response.status, statusText: response.statusText  });

		let responseContent = {};
		let responseData;

		let contentType;	

		if(response.headers.has('Content-Type')){
			let contentType = response.headers.get('Content-Type');
			responseContent.values = contentType.slice(
				contentType.indexOf('/') + 1,
				contentType.indexOf(';')
			);
			responseType.type = contentType.slice(
				0,
				contentType.indexOf('/')
			)
		} else {
			return Promise.reject("respone headers no has 'Content-Type'")
		}

		switch(responseContent.values){
			case 'plain':
				contentType = 'plain';
				responseData = await response.text();
				break;
			case 'json':
				contentType = 'json';
				responseData = await response.json();
				break;
			case 'form-data':
				contentType = 'form-data';
				responseData = await response.formData();
				break;
			case 'octet-stream':
				contentType = 'octet-stream';
				responseData = await response.arrayBuffer();
				break;
			default:
				responseData = undefined
		}

		if(!responseData){
			switch(responseContent.type){
				case 'image':
					contentType = 'image';
					responseData = await response.blob();
					break;
				default:
					return Promise.reject(
						`Content-Type: ${response.headers.get('Content-Type')} not supported`
					)
			}
		}

		return {
			data: responseData,
			statusCode: response.status,
			contentType: contentType,
			headers: response.headers
		}
	}

	_createHeaders(body){
		if(!options) return Promise.reject(new Error('Body cannot be empty'));

		let headers;
		let newBody;

		if(body.__proto__ === Object.prototype){
			headers = new Headers({
				'Content-Type': 'application/json;charset=utf-8'
			});
			newBody = JSON.stringify(body);
		} else if(body instanceof Blob && blob.type){
			headers = new Headers({
				'Content-Type': blob.type
			});
		} else if (typeof body === 'string'){
			headers = this.headers
		} else {
			headers = undefined
		}

		return {
			headers,
			newBody
		};
	}

	_createOptions(options, method){
		let { headers, body, proxy } = options;

		if(!header){
			let { newHeaders, newBody } = _createHeaders(body);

			if(!newHeaders){
				return Promise.reject('Headers cannot be empty');
			}

			if(newBody){
				body = newBody
			}
		}

		return {
			method: method,
			body: body,
			headers: headers,
			proxy: proxy || false
		}
	}

	get(url, options){
		if(!options) return Promise.reject(new Error('options required'));

		const loadOpt = this._createOptions(options, 'GET');

		if(loadOpt.body) return Promise.reject('Body in GET is invalid option');

		return this._load(
			url,
			loadOpt
		)
	}

	post(url, options){
		if(!options) return Promise.reject(new Error('options required'));

		const loadOpt = this._createOptions(options, 'POST')
		return this._load(
			url,
			loadOpt
		)
	}

	put(url, options){
		if(!options) return Promise.reject(new Error('options required'));

		const loadOpt = this._createOptions(options, 'PUT')
		return this._load(
			url,
			loadOpt
		)
	}

	load(options){
		if(!options) return Promise.reject(new Error('options required'));
		if(!options.url) return Promise.reject(new Error('url required'));

		const { url, ...properties } = options;
		return this._load(url, properties);
	}
}