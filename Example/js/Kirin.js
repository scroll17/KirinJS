/*utils*/
function isEventSupported(eventName){
    let evN = eventName.toLowerCase();
    let isSupported = false;

    if(typeof evN !== 'string') return false;

    if(eventName in window){
        isSupported = true;
    } else if(('on' + evN) in window) {
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

function createDOMComponent(elemConfig) {
    let el;
    let { type, props, children } = elemConfig;

    if(typeof type === 'function'){
        el = disassembleСomponent(elemConfig);
    } else {
        el = document.createElement(type);
        if(props){
            Object
                .keys(props)
                .forEach((key) => {
                    let value = props[key];
                    let event;
                    
                    if(event = isEventSupported(key)){
                        if(typeof event.isSupported){
                            el[event.name] = value;
                        } else {
                            el[key] = value;
                            console.log(key, ' = ', value)
                        }
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
                } else if(typeof child.type === 'string'){
                    node = createDOMComponent(child);
                } else if(typeof child.type === 'function'){
                    node = disassembleСomponent(child);
                };
    
                el.appendChild(node)
            })
        }
    }

    return el;
}
createDOMComponent.mount = function (el, container) {
    container.appendChild(el)
}

function disassembleСomponent(el) {
    const Component = el.type;
    const componentInstance = new Component(el.props);

    let element = componentInstance.render();

    if (typeof element.type === 'function') {
        element = disassembleСomponent(element);
    } else if(typeof element.type === 'string'){
        element = createDOMComponent(element);
    }

    return element;
}

/*lib*/
const Kirin = {
    createElement(type, props, ...children){
        const element = {
            type,
            props: props || {}
        };

        if (children[0]) {
            element.children = children;
        }

        return element;
    },
    createRef(el){
        return {
            current: el || null
        };
    },
    createClass(spec){
        function Constructor(props) {
            this.props = props;
        }

        Constructor.prototype.render = spec.render;

        return Constructor;
    },
    render(element, container){
        let el = createDOMComponent(element);
        return createDOMComponent.mount(el, container)
    }
};