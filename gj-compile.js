class Compile{
    constructor(el, vm){
        this.$vm = vm
        this.$el = document.querySelector(el)
        this.$fragment = this.nodeToFragment(this.$el)
        this.compileElement(this.$fragment)
        this.$el.appendChild(this.$fragment)
    }
    nodeToFragment(el){
        //fragment是文档碎片，用来存储dom碎片，只占内存，并不在dom树。这样不会引起页面回流，性能高
        let fragment = document.createDocumentFragment()
        let child 
        while(child = el.firstChild){
            fragment.appendChild(child)
        }
        return fragment
    }
    compileElement(el){
        let childNodes = el.childNodes
        Array.from(childNodes).forEach(node=>{
            let text = node.textContent
            //正则匹配{{}}
            let reg = /\{\{(.*)\}\}/
            if(this.isElementNode(node)){
                // 如果是一个标签
                this.compile(node)
            }else if(this.isTextNode(node) && reg.test(text)){
                //如果是文本
                reg.test(text)
                this.complieText(node, RegExp.$1)
            }
            if(node.childNodes && node.childNodes.length){
                this.compileElement(node)
            }
        })
    }
    compile(node){
        let attrs = node.attributes
        Array.from(attrs).forEach(attr=>{
            const attrName = attr.name
            const key = attr.value
            if(this.isVueDirective(attrName)){
                //如果是vue的属性
                // console.log('vue 的 变量', attrName)
                const dir = attrName.slice(2)
                if(this[dir]){
                    this[dir](node, this.$vm, key)
                }
            }
            if(this.isVueEvent(attrName)){
                //如果是vue事件
                console.log('vue的事件',attrName)
                let action = attrName.slice(1)
                this.eventHandler(node, this.$vm, key, action)
            }
        })
    }
    complieText(node, key){
        console.log('文本替换 并且可以收集依赖',node,key)
        this.text(node, this.$vm, key)
    }
    eventHandler(node, vm, key, action){
        const fn = vm.$options.methods && vm.$options.methods[key]
        node.addEventListener(action, fn.bind(vm), false)
    }
    text(node, vm, key){
        this.update(node, vm, key, 'text')
    }
    model(node, vm, key){
        this.update(node, vm, key, 'model')
        node.addEventListener('input', e=>{
            const newValue = e.target.value
            vm[key] = newValue
        })
    }
    html(node, vm, key){
        this.update(node, vm, key, 'html')
    }
    update(node, vm, key, dir){
        const fn = this[dir+"Updater"]
        fn && fn(node, vm[key])
        new Watcher(vm, key, value=>{
            fn && fn(node, value)
        })
    }
    textUpdater(node, value){
        node.textContent = value
    }
    htmlUpdater(node, value){
        node.innerHTML = value
    }
    modelUpdater(node, value){
        node.value = value
    }
    isVueDirective(name){
        return name.indexOf('g-') == 0
    }
    isVueEvent(name){
        return name.indexOf('@') == 0
    }
    isElementNode(node){
        // nodeType = 1是标签
        return node.nodeType==1
    }
    isTextNode(node){
        // nodeType = 3文本
        return node.nodeType==3
    }
}