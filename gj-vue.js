/*
    首先observer进行依赖收集，把Watcher放在Dep中，数据变化时调用Dep的notify方法通知watcher进行视图更新
*/

//依赖收集，负责管理监听器watcher
class Dep{
    constructor(){
        this.deps = []
    }
    addDep(dep){
        //添加依赖
        this.deps.push(dep)
    }
    notify(){
        //通知更新
        this.deps.forEach(dep=>{
            dep.update()
        })
    }
}
//监听器
class Watcher{
    constructor(vm, key, cb){
        this.vm = vm,
        this.key = key,
        this.cb = cb,
        this.value = this.get()   
        Dep.target = this
    }
    get(){
        Dep.target = this
        let value = this.vm[this.key]
        Dep.target = null
        return value
    }
    update(){
        this.value = this.get()
        this.cb.call(this.vm, this.value)
        console.log('视图想更新')
    }
}
class GVue{
    constructor(options){
        this.$options = options
        this.$data = options.data
        this.observer(this.$data)

        this.$compile = new Compile(options.el, this)

        options.created && options.created.call(this)
    }
    observer(data){
        Object.keys(data).forEach(key=>{
            this.proxyData(key)
            this.defineReactive(data, key, data[key])
        })
    }
    defineReactive(obj, key, val){
        const dep = new Dep()
        Object.defineProperty(obj, key, {
            get(){
                console.log('收集依赖')
                Dep.target && dep.addDep(Dep.target)
                return val
            },
            set(newVal){
                val = newVal
                dep.notify(newVal)
                console.log('通知依赖去更新')
            }
        })
    }
    proxyData(key){
        Object.defineProperty(this, key, {
            get(){
                return this.$data[key]
            },
            set(val){
                this.$data[key] = val
            }
        })
    }
}