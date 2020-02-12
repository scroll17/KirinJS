/*utils*/
function isEventSupported(eventName){
    let evN = eventName.toLowerCase();
    let isSupported = false;

    if(typeof evN !== 'string') return false;

    if(eventName in window){
        isSupported = true;
    } else if(('on' + evN) in window) {
        isSupported = 'on' + evN;
    } else {
        let el = document.body;
        isSupported = (evN in el);

        if (!isSupported) {
            el.setAttribute(evN,'() => {}');
            isSupported = (typeof(el[eventName]) === 'function');

            el.removeAttribute(evN);
        }
    }

    return isSupported;
}

function createDOMComponent(el) {
    let el = document.createElement(type);
    if(attr !== null){
        Object
            .keys(attr)
            .forEach((at) => {
                let value = attr[at];

                if(at === 'className'){
                    el.setAttribute('class', value)
                } else {
                    el.setAttribute(at, value);
                }
            })
    }

    if(typeof child === 'string'){
        child = document.createTextNode(child);
    }

    if(child !== null){
        el.appendChild(child);
    }

    createDOMComponent.mount = function (el, container) {
        container.appendChild(el)
    }
}

function CompositeComponentWrapper(el, container) {
    const Component = el.type;
    const componentInstance = new Component(el.props);
    const element = componentInstance.render();

    // while (typeof element.type === 'function') {
    //     element = (new element.type(element.props)).render();
    // }

    const domComponentInstance = createDOMComponent(element);
    return createDOMComponent.mount(domComponentInstance, container);
}
/*lib*/
const Kirin = {
    createElement(type, props, ...children){
        const element = {
            type,
            props: props || {}
        };

        if (children[0]) {
            element.props.children = children;
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


// const TopLevelWrapper = function(props) {
//     this.props = props;
// };
//
// TopLevelWrapper.prototype.render = function() {
//     return this.props;
// };
// const wrapperElement = this.createElement(TopLevelWrapper, element);


const MyTitle = Kirin.createClass({
    render() {
        return Kirin.createElement('h1', null, this.props.message);
    }
});

Kirin.render(
    Kirin.createElement(MyTitle, { message: 'hey there Feact' }),
    document.getElementById('root')
);

// React.createClass({
//     getInitialState() {
//         return {
//             checked: false,
//         };
//     },
//
//     toggleChecked() {
//         this.setState((prevState) => (
//             { checked: !prevState.checked }
//         ));
//     },
//
//     render() {
//         const className = this.state.checked ?
//             'toggle checkbox checked' : 'toggle checkbox';
//         return (
//             <div className={className}>
//             <input
//         type='checkbox'
//         name='public'
//         onClick={this.toggleChecked}
//             >
//             <label>Subscribe to weekly newsletter</label>
//         </div>
//     );
//     }
// });