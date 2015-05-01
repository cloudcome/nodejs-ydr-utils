```
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>

    <!--&lt;!&ndash;这些 css link 会被解析，然后压缩、合并&ndash;&gt;-->
    <!--&lt;!&ndash;coolie&ndash;&gt;-->
    <!--<link rel="stylesheet" href="/static/css/1.css"/>-->
    <!--<link rel="stylesheet" href="/static/css/2.css"/>-->
    <!--<link rel="stylesheet" href="/static/css/3.css"/>-->
    <!--<link rel="stylesheet" href="/static/css/4.css"/>-->
    <!--&lt;!&ndash;/coolie&ndash;&gt;-->

</head>
<body>


<!--[if IE]>
条件注释是不会被删除的。
<![endif]-->


<!--这个注释，是会被构建删除的-->


<!--
- 这个注释，也会被构建删除
- 这个注释，也会被构建删除
-->


<!--
这个注释，不会被构建删除
-->


<!--图片资源文件-->
<img src="/static/img/abc1.png" alt="abc" />

<!--各种标签加上“coolieignore”属性，会被 coolie 在构建过程中忽略-->
<img src="/static/{{varible}}/abc2.png" alt="abc" />

<img src="/static/img/abc3.png" alt="abc" />

<!--预格式内容-->
<pre>
    var a = 1;
    var b = 2;
</pre>


<!--预格式内容-->
<textarea>
    var a = 1;
    var b = 2;
</textarea>


<!--预格式内容-->
<script type="text/template">
    保留格式
</script>


<!--脚本资源文件-->
<script>
    var a = 1;
    var b = 2;
</script>


<!--coolie 模块加载器配置信息解析-->
<!--<script src="/static/js/coolie.min.js"-->
        <!--data-config="./coolie-config.js"-->
        <!--data-main="./app/index.js"></script>-->

</body>
</html>
```