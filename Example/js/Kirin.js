// class Kirin {
//     constructor(){

//     }

//     static createElement(){

//     }

//     static cloneElement(){
        
//     }

//     static createRef(){

//     }
// }

function Kirin(func){
    setTimeout(func || console.log.bind(console, 'Kirin'), 2000)    
}

Kirin.createElement = function(){

}


Kirin.cloneElement = function(){
    
}

Kirin.createRef = function(){
    
}


class KirinDOM {
    static render(){
        console.log('KirinDOM')
    }   
}