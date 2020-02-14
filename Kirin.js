/*typeOf functions*/
function _is(value, type) {
    return typeof value === type
}

/*utils*/
function isEventSupported(eventName){
    let evN = eventName.toLowerCase();
    let isSupported = false;

    if(typeof evN !== 'string') return isSupported;

    if(eventName in window){
        isSupported = true;
    } else if(('on' + evN) in window) {
        isSupported = true;
        evN = 'on' + evN;
    } else {
        let el = document.body;
        isSupported = (evN in el);

        if (!isSupported) {
            el.setAttribute(evN,'() => {}');
            isSupported = (typeof(el[eventName]) === 'function');

            el.removeAttribute(evN);
        }
    }

    return {
        name: evN,
        isSupported
    };
}

function renameKeywords(key){
    switch(key){
        case 'className':
            return 'class';
        default:
            return key;
    }
}

function mergeState(toMergeState, newState) {
    Object
        .keys(newState)
        .forEach(key => {
            let value = newState[key];

            if(_is(value, 'object') && _is(toMergeState[key], 'object')){
                toMergeState[key] = mergeState(toMergeState[key], value)
            } else {
                toMergeState[key] = value;
            }
        });

    return toMergeState;
}

function disassembleComponent(el) {
    const Component = el.type;
    const componentInstance = new Component(el.props);

    let element = componentInstance.render();

    if(element){
        element = createDOMComponent(element);
    }

    return element;
}

function typeOfFunction(f) {
    if(f.isClass){
        return 'class'
    } else {
        let likeAString = f.toString();
        return likeAString.slice(0, likeAString.indexOf(' '));
    }
}

function DOMElement(){
    return Object.keys(DOMElement).filter(key => key !== 'add');
}
DOMElement.add = function (type) {
    function _set(type) {
        Object.defineProperty(DOMElement, type, {
            enumerable: true,
            value: (child, props = null) => {
                if(Array.isArray(child)){
                    return Kirin.createElement(type, props, ...child)
                } else {
                    return Kirin.createElement(type, props, child)
                }
            }
        })
    }

    if(type){
        if(Array.isArray(type)){
            type.forEach(t => _set(t));
        } else {
            _set(type);
        }
    }
};

function createDOMComponent(elemConfig) {
    let el;
    let { type, props, children } = elemConfig;

    if(typeOfFunction(type) === 'class'){
        el = disassembleComponent(elemConfig);
    } else if(typeOfFunction(type) === 'function'){
        el = createDOMComponent(
            type(props)
        );
    } else {
        el = document.createElement(type);

        if(props){
            Object
                .keys(props)
                .forEach((key) => {
                    let value = props[key];
                    let event;

                    if(event = isEventSupported(key)){
                        el[event.name] = value;
                    } else {
                        const reformedKey = renameKeywords(key);
                        el.setAttribute(reformedKey, value);
                    }
                })
        }

        if(children){
            children.forEach(child => {
                let node;

                if(typeof child === 'string'){
                    node = document.createTextNode(children);
                } else {
                    node = createDOMComponent(child);
                }

                el.appendChild(node)
            })
        }
    }

    return el;
}
createDOMComponent.mount = function (el, container) {
    if(container){
        container.appendChild(el)
    } else {
        Kirin._rootContainer.appendChild(el)
    }
};

/*lib*/
const Kirin = {
    createElement(type, props, ...children){
        const element = {
            type,
            props: props || {}
        };

        if (children.length) {
            element.children = children;
        }

        return element;
    },
    createRef(el){
        let refObject = Object.seal({
            current: el || null
        });
        return refObject;
    },
    createClass(spec){
        let Constructor;

        Constructor = function Constructor(props) {
            this.props = props;
            this.state = {
                checked: false
            };
        };

        Object.keys(spec).forEach(method => {
            Constructor.prototype[method] = spec[method]
        });

        Constructor.prototype.setState = function (conf) {
            if(_is(conf, 'function')){
                this.state = mergeState(
                    this.state,
                    conf(this.state)
                )
            } else if (_is(conf, 'object')){
                this.state = mergeState(
                    this.state,
                    conf
                )
            } else {
                this.state = conf;
            }

            console.log('this.render()', this.render());

            Kirin.clearRoot()
            Kirin.render(
                this.render(),
                document.getElementById('root')
            )
        };

        Constructor.isClass = true;
        return Constructor;
    },
    DOMElement,
    render(element, container){
        Kirin._rootContainer = container;

        let el = createDOMComponent(element);
        return createDOMComponent.mount(el, container)
    },
    clearRoot(){
        Kirin._rootContainer.childNodes.forEach(child => child.remove());
    }
};
