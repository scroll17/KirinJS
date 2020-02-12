function Kirin(func){
    setTimeout(func || console.log.bind(console, 'Kirin'), 2000)    
}

Kirin.createElement = function(name, attr, child){
    let el = document.createElement(name);
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

    Kirin.toRender = el;
    return el;
}

Kirin.createClass = function(){
    
}

Kirin.createRef = function(el){
    this.renderEL = el;
}

Kirin.removeAfter = function(el, time){
    setTimeout(() => el.remove() ,time)
}

Kirin.render = function(){
   this.renderEL.appendChild(
       this.toRender
    )
}
