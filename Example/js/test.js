function createElement(type, config, children) {
    let propName;

    // Reserved names are extracted
    const props = {};

    let key = null;

    if (config != null) {
        if (hasValidKey(config)) {
            key = '' + config.key;
        }

        for (propName in config) {
            if (
                hasOwnProperty.call(config, propName) &&
                !RESERVED_PROPS.hasOwnProperty(propName)
            ) {
                props[propName] = config[propName];
            }
        }
    }

    // Children can be more than one argument, and those are transferred onto
    // the newly allocated props object.
    const childrenLength = arguments.length - 2;
    if (childrenLength === 1) {
        props.children = children;
    } else if (childrenLength > 1) {
        const childArray = Array(childrenLength);
        for (let i = 0; i < childrenLength; i++) {
            childArray[i] = arguments[i + 2];
        }

        props.children = childArray;
    }

    // Resolve default props
    if (type && type.defaultProps) {
        const defaultProps = type.defaultProps;
        for (propName in defaultProps) {
            if (props[propName] === undefined) {
                props[propName] = defaultProps[propName];
            }
        }
    }

    return ReactElement(
        type,
        key,
        props,
    );
};

function createElement(
    type,
    props,
    rootContainerElement
) {
    // We create tags in the namespace of their parent container, except HTML
    // tags get no namespace.
    const ownerDocument = getOwnerDocumentFromRootContainer(
        rootContainerElement,
    );

    let domElement;

    if (type === 'script') {
        const div = ownerDocument.createElement('div');
        div.innerHTML = '<script><' + '/script>';
        const firstChild = ((div.firstChild));
        domElement = div.removeChild(firstChild);

    } else if (typeof props.is === 'string') {
        domElement = ownerDocument.createElement(type, {is: props.is});
    } else {
        domElement = ownerDocument.createElement(type);
    }

    return domElement;
}