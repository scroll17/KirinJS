class Loader {
	constructor(properties){
		this.headers = new Headers({ 'Content-Type': 'text/plain;charset=UTF-8' });
		this.proxy = "https://cors-anywhere.herokuapp.com/";
	}

	async _load(url, options){
		let response;

		if(options.proxy){
			url = url.replace('https://', '');
			response = await fetch(this.proxy + url, options);
		} else {
			response = await fetch(url, options);
		}

		if(!response.ok) return Promise.reject({ statusCode: response.status, statusText: response.statusText  });

		let responseContent = {};
		let responseData;

		let contentType = {};

		if(response.headers.has('Content-Type')){
			let contentType = response.headers.get('Content-Type');
			responseContent.values = contentType.slice(
				contentType.indexOf('/') + 1,
				contentType.indexOf(';')
			);
			responseContent.type = contentType.slice(
				0,
				contentType.indexOf('/')
			)
		} else {
			return Promise.reject("response headers no has 'Content-Type'")
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
		if(!body) return Promise.reject(new Error('Body cannot be empty'));

		let newHeaders;
		let newBody;

		if(body.__proto__ === Object.prototype){
			newHeaders = new Headers({
				'Content-Type': 'application/json;charset=utf-8'
			});
			newBody = JSON.stringify(body);
		} else if(body instanceof Blob && blob.type){
			newHeaders = new Headers({
				'Content-Type': blob.type
			});
		} else if (typeof body === 'string'){
			newHeaders = this.headers
		} else {
			newHeaders = undefined
		}

		return {
			newHeaders,
			newBody
		};
	}

	_createOptions(options, method){
		let { headers, body, proxy, credentials, mode } = options;

		let createdOptions = {};
		if(!headers && method !== 'GET'){
			let { newHeaders, newBody } = this._createHeaders(body);

			if(newHeaders){
				headers = newHeaders;
			} else {
				headers = undefined;
			}

			if(newBody){
				body = newBody
			}

			createdOptions.body = body;
		}

		return {
			method: method,
			headers: headers || new Headers(),
			proxy: proxy || false,
			credentials: credentials || 'include',
			mode: mode || 'no-cors',
			...createdOptions
		}
	}

	async get(url, options = {}){
		if(!options) return Promise.reject(new Error('options required'));

		const loadOpt = this._createOptions(options, 'GET');

		if(loadOpt.body) return Promise.reject('Body in GET is invalid option');

		return this._load(
			url,
			loadOpt
		)
	}

	async post(url, options){
		if(!options) return Promise.reject(new Error('options required'));

		const loadOpt = this._createOptions(options, 'POST');
		return this._load(
			url,
			loadOpt
		)
	}

	async put(url, options){
		if(!options) return Promise.reject(new Error('options required'));

		const loadOpt = this._createOptions(options, 'PUT');
		return this._load(
			url,
			loadOpt
		)
	}

	async load(options){
		if(!options) return Promise.reject(new Error('options required'));
		if(!options.url) return Promise.reject(new Error('url required'));

		const { url, ...properties } = options;
		return this._load(url, properties);
	}
}