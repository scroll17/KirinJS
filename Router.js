class Router {
    constructor(){
        this.href = window.location.href;
        this.location = {
            pathname: window.location.pathname,
            search: window.location.search,
            hash: window.location.hash,
            state: '{}'
        }

        this._history = [this.location];
    }

    get now(){
        return this._omit(this, '_history');
    }

    _parseUrl(url){
        const u = new URL(url);
        return {
            href: u.href,
            location: {
                pathname: u.pathname,
                search: u.search,
                hash: u.hash,
            }
        }
    }

    _omit(obj, path){
        let response = {};
        Object
            .keys(obj)
            .forEach(p => {
                if(p !== path){
                    response[p] = obj[p]
                }
            })
        return response;
    }

    _setThis(obj){
        Object
            .keys(obj)
            .forEach(p => {
                let value = obj[p];
                if(value instanceof Object){
                    this._setThis(value);
                }

                this[p] = value;
            })
        return this._omit(this, '_history');
    }

    assign(url){
        return document.location.assign(url)
    }

    reload(forcedReload = false){
        document.location.reload(forcedReload);
    }

    push(path, state = {}){
        let newThis = this._parseUrl(path);
        newThis.location.state = JSON.parse(state);

        this._history.push(newThis);
        return _setThis(newThis);
    }

    replace(){

    }

    go(n){

    }

    goBack(){

    }

    goForward(){

    }

    block(){

    }
}