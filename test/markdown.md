xss markdown

```
<pre></pre>
```

    var a= 1;
    <pre></pre>
    <pre></pre>
    <pre></pre>
    <pre></pre>



code: `~`

code: `<pre>~</pre>`


今天浏览jQuery的deprecated列表，发现live()和die()在里面了，赶紧看了一下，发现从jQuery1.7开始，jQuery引入了全新的事件绑定机制，on()和off()两个函数统一处理事件绑定。因为在此之前有bind(), live(), delegate()等方法来处理事件绑定，jQuery从性能优化以及方式统一方面考虑决定推出新的函数来统一事件绑定方法并且替换掉以前的方法。 **on(events,[selector],[data],fn)** events:一个或多个用空格分隔的事件类型和可选的命名空间，如"click"或"keydown.myPlugin" 。 selector:一个选择器字符串用于过滤器的触发事件的选择器元素的后代。如果选择器为null或省略，当它到达选定的元素，事件总是触发。 data:当一个事件被触发时要传递event.data给事件处理函数。 fn:该事件被触发时执行的函数。 false 值也可以做一个函数的简写，返回false。

# 替换bind()

当第二个参数'selector'为null时，on()和bind()其实在用法上基本上没有任何区别了，所以我们可以认为on()只是比bind()多了一个可选的'selector'参数，所以on()可以非常方便的换掉bind()

# 替换live()

在1.4之前相信大家非常喜欢使用live(),因为它可以把事件绑定到当前以及以后添加的元素上面，当然在1.4之后delegate()也可以做类似的事情了。live()的原理很简单，它是通过document进行事件委派的，因此我们也可以使用on()通过将事件绑定到document来达到live()一样的效果。


<http://link>

# live()写法

<pre> $('#list li').live('click', '#list li', function() {
    //function code here.
});</pre>

## **<span>on()写法</span>**

<pre>$(document).on('click', '#list li', function() {
    //function code here.
});</pre>



