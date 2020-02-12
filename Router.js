class Router {
    constructor(workWithOriginalLocation = false){
        this.href = window.location.href;
        this.location = {
            pathname: window.location.pathname,
            search: window.location.search,
            hash: window.location.hash,
            state: '{}'
        }

        this._work = workWithOriginalLocation;

        this._history = [{
            href: this.href,
            location: this.location
        }];
        this._length = 1;
        this._current = 0;

        this._privateFields = [
            '_privateFields'
        ].concat(Object.keys(this).filter(key => key.startsWith('_')))
    }

    get current(){
        return {
            position: this._current,
            ...this._omit(this, this._privateFields)
        }
    }

    get length(){
        return this._length
    }

    get state(){
        return JSON.parse(this.location.state);
    }

    get history(){
        return this._history;
    }

    set workWithOriginal(value){
        if(typeof value === 'boolean'){
            return this._work = value;
        }
        return;
    }

    set state(value){
        return this.setState(value);
    }

    _omit(obj, paths){
        let response = {};

        Object
            .keys(obj)
            .forEach(p => {
                if(!paths.includes(p)){
                    response[p] = obj[p]
                }
            })
        return response;
    }

    _parseUrl(url){
        const u = new URL(
            this._validatePath(url)
        );
        return {
            href: u.href,
            location: {
                pathname: u.pathname,
                search: u.search,
                hash: u.hash,
            }
        }
    }

    _setThis(obj){
        Object
            .keys(obj)
            .forEach(p => {
                let value = obj[p];

                this[p] = value;
            })

        return this._omit(this, this._privateFields);
    }

    _setNewHref(href){
        if(this._work){
            return (
                window.location = this._validatePath(href)
            )
        }
        return href
    }

    _saveStateToStorage(state){
        if(typeof state === 'object'){
            state = JSON.stringify(state);
        }
        sessionStorage.setItem('URLState', state)
    }

    _getStateFromStorage(){
        return sessionStorage.getItem('URLState')
    }

    _validatePath(path){
        if(!path.includes('http')){
            path = window.location.protocol + '//' + path;
        }
        return path;
    }

    reload(forcedReload = false, callback){
        this._saveStateToStorage(this.location.state);

        window.addEventListener('load', function(){
            this.location.state = this._getStateFromStorage();
        }.bind(this))

        if(callback){
            window.addEventListener('load', callback.bind(this))
        }

        window.location.reload(forcedReload);
    }

    push(path, state = {}){
        let newThis = this._parseUrl(path);

        newThis.location.state = JSON.stringify(state);

        this._history.splice(++this._current, 0, newThis);
        this._length++;

        this._setNewHref(newThis.href);
        return {
            go: true,
            ...this._setThis(newThis)
        }
    }

    replace(path, state = {}){
        let newThis = this._parseUrl(path);

        newThis.location.state = JSON.stringify(state);

        this._history[this._current] = newThis;

        this._setNewHref(newThis.href);
        return {
            go: true,
            ...this._setThis(newThis)
        }
    }

    go(n){
        if(n < 0 && (this._current + n) >= 0){
            this._current = this._current + n; 
            
            this._setNewHref(
                this._history[this._current].href
            );
            return {
                go: true,
                ...this._setThis(
                    this._history[this._current]
                )
            }
        }
        if(n > 0 && (this._current + n) <= this._length - 1){
            this._current = this._current + n; 

            this._setNewHref(
                this._history[this._current].href
            );
            return {
                go: true,
                ...this._setThis(
                    this._history[this._current]
                )
            }
        }
        return {
            go: false,
            ...this._omit(this, this._privateFields)
        }
    }

    goBack(){
        if(this._current > 1){
            let newThis = this._history[--this._current];

            this._setNewHref(newThis.href);
            return {
                go: true,
                ...this._setThis(newThis)
            };
        }
        return {
            go: false,
            ...this._omit(this, this._privateFields)
        }
    }

    goForward(){
        if(this._length - 1 > this._current){
            let newThis = this._history[++this._current];

            this._setNewHref(newThis.href);
            return {
                go: true,
                ...this._setThis(newThis)
            };
        }
        return {
            go: false,
            ...this._omit(this, this._privateFields)
        }
    }

    setState(value){
        if(typeof value === 'object'){
            this.location.state = JSON.stringify(value)
            this._history[this._current].location.state = JSON.stringify(value);
            return value;
        } else if(typeof value === 'string'){
            this.location.state = value;
            this._history[this._current].location.state = value;
            return JSON.parse(value);
        } else {
            return;
        }
    }
}