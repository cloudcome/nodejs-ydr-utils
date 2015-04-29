#CSS实现垂直居中的5种方法
利用 CSS 来实现对象的垂直居中有许多不同的方法，比较难的是选择那个正确的方法。我下面说明一下我看到的好的方法和怎么来创建一个好的居中网站。

使用 CSS 实现垂直居中并不容易。有些方法在一些浏览器中无效。下面我们看一下使对象垂直集中的5种不同方法，以及它们各自的优缺点。(可以看看测试页面，有简短解释。)

##方法一
	这个方法把一些 div 的显示方式设置为表格，因此我们可以使用表格的 vertical-align property 属性。
	```html
	<div class="wrapper">  
	    <div class="cell">
		        <div class="content"> Content goes here</div>
				    </div>
					</div>  
					```
					css:
					```
					.wrapper {display:table;} 
					.cell {
						    display:table-cell; 
									    vertical-align:middle;
					}
```
###优点： 
content 可以动态改变高度(不需在 CSS 中定义)。当 wrapper 里没有足够空间时， content 不会被截断

###缺点： 
Internet Explorer(甚至 IE8 beta)中无效，许多嵌套标签(其实没那么糟糕，另一个专题)

##方法二

	这个方法使用绝对定位的 div，把它的 top 设置为 50％，top margin 设置为负的 content 高度。这意味着对象必须在 CSS 中指定固定的高度。

	因为有固定高度，或许你想给 content 指定 overflow:auto，这样如果 content 太多的话，就会出现滚动条，以免content 溢出。
	```html
	<div class="content"> Content goes here</div>  
	```
	css:
	```
	.content {
		    position:absolute; 
					     top:50%; height:240px; 
							     margin-top:-120px; /* negative half of the height */ 
	}
```
###优点： 
适用于所有浏览器 
不需要嵌套标签

###缺点： 
没有足够空间时，content 会消失(类似div 在 body 内，当用户缩小浏览器窗口，滚动条不出现的情况)

##方法三

	这种方法，在 content 元素外插入一个 div。设置此 div height:50%; margin-bottom:-contentheight;。

	content 清除浮动，并显示在中间。

	```html
	<div class="floater"></div>  
	<div class="content"> Content here </div>  
	```
	css:
	```
	.floater {
		    float:left; 
				      height:50%; 
							     margin-bottom:-120px;
	}
.content {
	    clear:both; 
			      height:240px; 
						     position:relative;
}
```
###优点： 
适用于所有浏览器 
没有足够空间时(例如：窗口缩小) content 不会被截断，滚动条出现

###缺点： 
唯一我能想到的就是需要额外的空元素了(也没那么糟，又是另外一个话题)

##方法四

	这个方法使用了一个 position:absolute，有固定宽度和高度的 div。这个 div 被设置为 top:0; bottom:0;。但是因为它有固定高度，其实并不能和上下都间距为 0，因此 margin:auto; 会使它居中。使用 margin:auto;使块级元素垂直居中是很简单的。
	```html
	<div class="content"> Content here</div>  
	```
	CSS:
	```
	.content {
		    position:absolute; 
					     top:0; 
							     bottom:0; 
										    left:0; 
												     right:0; 
														       margin:auto; 
																	      height:240px; 
																				     width:70%; 
	}
```
###优点： 
简单

###缺点： 
IE(IE8 beta)中无效 
无足够空间时，content 被截断，但是不会有滚动条出现

##方法五

这个方法只能将单行文本置中。只需要简单地把 line-height 设置为那个对象的 height 值就可以使文本居中了。
```html
<div id="content"> Content here</div>  
```
css:
```
.content {
	    height:100px; 
			       line-height:100px;
}
```
###优点： 
适用于所有浏览器 
无足够空间时不会被截断

###缺点： 
只对文本有效(块级元素无效) 
	多行时，断词比较糟糕

	这个方法在小元素上非常有用，例如使按钮文本或者单行文本居中。

##兼容性注意事项 
	如你所想，IE 是唯一添麻烦的浏览器。 
	floater 必须指定宽度，否则在任意版本 IE 中，它都啥也不干 
	IE 6 中目录被周围太多的空间打断 
	IE 8 有多余空间(作者遗漏)

	原文：[http://www.qianduan.net/css-to-achieve-the-vertical-center-of-the-five-kinds-of-methods/](http://www.qianduan.net/css-to-achieve-the-vertical-center-of-the-five-kinds-of-methods/)
