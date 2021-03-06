# 觅星峰
总行数: ````42411````

# 简介
使用cordova开发的音乐播放器,提供签到,文件共享和音乐共享,还可以搜索网易云,qq音乐,酷狗音乐和酷我,上传具备秒传性质,h5和安卓设备已测试通过  

# 特别感谢
````网易云音乐api:````: [Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)  
````qq音乐api:````: [jsososo/QQMusicApi](https://github.com/jsososo/QQMusicApi)   

# 安装
如果没有baidumaplocation和jpush的key,请删除package.json和config.xml里相应的配置  
```shell
$ git clone https://github.com/zhoushoujian/miXingFeng.git  
$ npm install -g cordova@8.0.0  
$ // 在项目根目录新建一个www的文件夹，否则cordova不识别这是一个cordova项目  
$ cordova platform add android@7.1.4  
$ cordova platform add ios //如果不是mac,请不要运行这条命令  
$ cordova plugin add cordova-plugin-fastrde-md5@0.2.0 --force
$ cd view  
$ npm i  
```
````注意:```` 打包安卓或ios需要安装对应的开发环境，这里不在多说，网上的教程有很多。  

# 技术栈
cordova, react, redux, webpack4, websocket, Push, antd-mobile, less, react-loadable

# 原生功能
1. android-permissions  
2. app-version  
3. backbutton  
4. background-mode  
5. baidumaplocation  
6. device info  
7. fastrde-md5  
8. file-opener2  
9. file-transfer  
10. headsetdetection  
11. inappbrowser  
12. JPush  
13. local-notifications  
14. network-information  
15. x-toast  
16. camera  
17. image-resizer  
18. splashscreen  
19. statusbar  
20. screen-orientation  
21. insomnia  

# 注意
````推荐使用````  
cordova8.0.0,cordova-android7.1.4,  
cordova-plugin-jcore1.3.1,  
jpush-phonegap-plugin3.7.3,  
cordova-plugin-local-notifications-appstr0.9.3,  
否则cordova-plugin-android-permissions, cordova-plugin-background-mode和JPush可能不工作,甚至会影响整个app稳定性  

````AndroidStudio打包出现"xxx" is not translated in "zh" (Chinese):````
To ignore this in a gradle build add this to the android section of your build file:
<code>
android {
    ...
    lintOptions {
       disable 'MissingTranslation'
    }
    ...
}
</code>

# 安卓安装包
[下载地址](http://192.144.213.72:2000/Images/app-release.apk)

# 关于cordova
Cordova包装你的HTML/JavaScript app到原生app容器中，可以让你访问每个平台设备的功能。这些功能通过统一的JavaScript API提供，让你轻松的编写一组代码运行在几乎市面上的所有手机和平板上，并可以发布到相应的app商城中。  
![cordova pic](https://github.com/zhoushoujian/miXingFeng/blob/master/docs/cordova.png)  

# 关于签名
使用Keytool生成自己的密钥,并把密码写入build.json  
````提示：debug包不需要签名````  
```shell
keytool -genkey -alias myapp.keystore -keyalg RSA -validity 20000 -keystore myapp.keystore
```

# 功能特性  
1. 注册,登录和忘记密码  
2. 签到和查询签到记录  
3. 实时显示在线人数和成员签到  
4. 账号颜色区分账号注册来源  
5. 艺术昵称墙(d3.js)  
6. 文件服务器客户端  
7. 个人信息管理  
8. 搜索对方地理位置  
9. iframe内嵌web  
10. SSR服务端渲染  
11. RPC查询服务器信息  
12. 提交反馈  
13. 关于和开源声明  
14. 登录记录  
15. 通知和运行  
16. 重置密码  
17. 状态栏push推送(成员上传文件和获取自己位置)  
18. APP日志记录
19. websocket心跳检测，断网重连和后台保活  
20. 在线升级  
21. 前端错误监控  
22. 音乐共享系统  
23. 音乐播放器: 单曲循环，顺序播放，单曲播放,随机播放，播放上一首，播放下一首  
24. 支持删除上传的音乐  
25. 收藏音乐  
26. 支持音乐锁屏或后台播放  
27. 在通知栏显示app更新通知  
27. 下载盒子  
28. 实时显示文件下载进度和完成状态  
29. 分享列表同步更新下载和收藏状态  
30. 秒传系统  
31. nginx反向代理
32. 验证邮箱,忘记密码和邮箱登录  
33. 支持搜索，播放和下载网易云，qq音乐,酷狗音乐和酷我音乐  
34. 支持搜索共享文件和共享音乐  
35. 支持全局搜索  
36. 从服务端下载广告  
37. 音乐播放器底部控制条
38. 手机号注册账号,修改手机号,手机号忘记密码和手机号登录
39. 最近播放列表
40. 网易云和qq音乐MV

# 更新:  
[更新日志](https://github.com/zhoushoujian/miXingFeng/blob/master/docs/CHANGELOG.MD)

# websocket在本例系统中的应用  
1. ping pong心跳
2. websocket断线重连
3. websocket后台存活
4. 客户端防断开机制
5. 服务端兜底清除无效的websocket连接
6. 实时显示用户启动app
7. 实时显示在线人数
8. 实时刷新签到记录
9. 实时显示文件列表
10. 实时显示音乐列表
11. 自己获取对方的实时地理位置
12. 实时更新昵称墙

# 效果图预览  
![release pic](https://github.com/zhoushoujian/miXingFeng/blob/master/docs/thumb_release_v2.png)  
[更多](https://github.com/zhoushoujian/miXingFeng/blob/master/docs/thumb_release_v1.png)  

# 点击一首歌需要的操作(播放)  
1. 检查是否有播放版权  
2. 检查是否登录(部分歌曲需要登录才能播放)  
3. 检查当前操作是首次播放,还是播放切到暂停状态,还是从暂停切到播放状态,还是跳到另一首歌播放(注意:这里也分为两种情况,分别是当前是播放状态的切换和当前是暂停状态的切换) (一种5种场景)  
4. 如果是播放下载好的歌曲,检查歌曲是否已删除,如果是,则清除相应的下载记录和播放记录  
5. 假如有正在播放的歌曲,销毁它  
6. 更新当前歌曲的信息到内存,如重置播放时间,音乐指纹,音乐名称,音乐时长,音乐页面来源,音乐文件来源,音乐页面的所有歌曲(便于切换歌曲)等  
7. 如果不是播放下载好的歌曲,检查当前音乐的链接是否需要重新获取,网易云音乐链接每次播放都重新获取,共享音乐列表的音乐链接从不需要重新获取,其他网络音乐如果获取过一次,则不再重新获取  
8. 将当前关键信息记录到本地,便于下次启动APP时自动获取上次听的最后一首歌,并做好数据缓冲  
9. 将当前歌曲记录到播放记录(5种情况): 播放记录为空; 当前播放歌曲在播放记录第一条; 当前歌曲来源于播放记录; 直接插入当前歌曲插入到播放记录第一条; 删除播放记录的某一条然后将当前歌曲插入到第一条. 注意: 插入到播放记录的歌曲需要一个全新的音乐指纹  
10. 如果是启动app时检查的播放,忽略第1,2,3,5,8,9条  
11. 重置底部控制条的圆圈时长或正在播放页的进度条  
12. 屏蔽快速切多首歌的情况,比如一秒内切换了5首歌,那么只获取前两首和第五首歌的播放链接  
13. 设置音乐播放顺序,以及播放结束后的操作,默认自动播放列表的下一首  
14. 开始播放歌曲  
点击一首歌,然后就播放了,软件响应很快,但是估计很多人不曾想到,播放一首歌居然需要做这么多事情.  
当然其他的音乐软件也会做上面的大部分操作,而且可能会比上面列出来的更复杂  


# 秒传系统的设计(群组方向)：

````总体思想：````  
如果服务器已存在待上传的文件，则把已存在的数据库里的记录复制一份并修改一下指向待上传的地方且用户上传的文件不能覆盖原有的文件  

````注意点：````  
1. 同一时间有多用户上传同一个文件(文件名和MD5都相同),服务器怎么保存这些文件?
2. 删除文件的时候怎么保证别人对你的秒传文件不受影响?
3. 服务器找到相同的文件(md5相同),哪些字段应该被修改并保存为新的值?
4. 你上传的a.mp3和服务器上的b.mp4的md5相同,所以秒传了,服务器怎么处理这种情况,如果上传的文件可以在线预览,又该怎么处理?
5. 服务器返回的文件列表怎么保证文件的唯一性又能正常下载文件?

````数据库里的一条记录数据类型结构类似这样：````  
{  
    "_id" : ObjectId("5dff696d10272e56bb89fe34"),  //数据库自动生成的索引  
    "filename" : "东风破.mp3",  //显示给用户看的文件名  
    "uploadUsername" : "charm",  //上传者的用户名  
    "fileSize" : 3229151,  //上传文件的大小  
	“filePath”: "/Musics/charm_1579352794870.mp3",  //文件真实的下载地址  
    "md5" : "9ba504db9edf21e16f03f3c72b4e9817",  //文件的md5指纹  
    "duration" : "201.795875",  //音频文件的时长，不是音频文件，此属性为undefined  
    "group" : "default-music",  //当前用户所在的分组  
    "date": "2019-12-25 12:50:51",  //用户上传文件时的时间  
	"filenameOrigin" : "charm_东风破_1579352794886.mp3"  //文件的身份id,又上传者用户名加文件名家时间戳构成  
}  

````一. 秒传：````  
1. 搜索待上传文件的md5(由前端生成)是否已存在数据库，不存在走正常上传逻辑   
2. 已存在，比较已上传文件的文件名和当前群组内文件名是否重复  
3. 如重复则修改数据库记录，如不重复则新增一条记录  
4. 深拷贝其中一条记录的值并修改filename，uploadUsername，group，date和filenameOrigin  
5. 数据库更新或插入成功后给群组所有成员发送通知  

````正常上传````  
1. 检查待上传文件的文件名与数据库里保存的文件名是否有重复，有则更新数据库，没有则插入一条记录    
2. 操作完数据库以后给群组内所有成员发放通知  

````二. 下载````    
1. 根据“filePath”下载文件,找到存在服务器里的文件  

````三. 删除````  
2. 根据“filename”生成删除链接，注意，这里只更改数据库的记录，不删除记录，只需将要删除的文件的群组统一改为“default-removed”即可  

````测试用例：````  
`````跨群组场景：````  
1. 上传一个自己群组里不存在，但别的群组存在的文件  
2. 上传一个自己群组里不存在，且别的群组也不存在的文件  
3. 上传一个自己群组里存在，别的群组也存在的文件  
4. 上传一个自己群组里存在，但别的群组不存在的文件  
````群组内场景；````  
5. 上传一个与群组里已存在相同文件名的文件，且两个文件的MD5相同  
6. 上传一个与群组里已存在相同文件名的文件，但两个文件的MD5不同  
7. 上传一个与群组里已存在相同MD5的文件，但两个文件的文件名不同  
````同名服务器文件场景````  
8. 上传文件aaa.txt，删除文件aaa.txt,再上传一个与原来md5不一样的aaa.txt，上传结束后删除，
	再上传一个与之前md5都不一样的aaa.txt，上传结束后删除，前后重复共5遍，检查文件是否可以正常下载和删除  
````下载和删除：````  
9. 下载和删除文件正常  
   
````注意: ````  
这款软件支持在线播放音乐，所以这里需要考虑一个场景：
假如用户A先上传一个文件为123.mpp，此文件md5假如是aaaaa，用户上传一个相同md5（aaaaa）的文件，但这个文件的文件名为123.mp3，
这个文件是音乐文件，能正常播放且被上传到了音乐列表。音乐用户A已经上传了这个文件，所以服务端会自动新增一条记录指向123.mpp，
这时候如果用户播放他刚刚上传的文件，会发现无法播放，因为源文件指向了123.mpp，而这个文件并不是音乐文件的格式，所以无法播放。
我在这里的做法是如果用户是在音乐列表里上传文件，那么只匹配音乐组的md5搜索结果，即/.+\-music|.+\-music-removed/，
如果用户是在文件列表里上传文件，服务端会搜索所有组的md5结果。

# 挑选其中一个需求写一个测试用例：  
````需求：```` 支持下载共享音乐和网易云和qq音乐  
````测试用例````  
1. 成功下载共享音乐和网易云和qq音乐  
2. 下载过程中不允许重复下载，应当给出提示并可以跳往正在下载的页面
3. 已经下载完成的音乐不允许下载，应当给出提示已经下载完成
4. 支持下载的页面包括共享列表，搜索共享列表页面，在线音乐搜索页面，综合搜索页面和收藏页面，已下载页面菜单不要再显示下载
5. 已下载页面的菜单有删除功能且删除的是下载的音乐不是共享列表的音乐，且其他菜单功能正常
6. 已下载列表的音乐被收藏也应显示已收藏的小爱心
7. 音乐下载完成后给出提示，如果当前在已完成页面，应实时刷新页面显示已完成的音乐，如果在正在下载页面，应实时刷新正在下载的页面
8. 下载中的音乐支持取消和重新下载，暂不支持断点续传
9. 重启app后依旧能显示下载完成的音乐
10. 按下载顺序显示下载完成的音乐，包括在已下载页面实时刷新的情况，离开已下载页面和退出app重新进入已下载页面
11. 如果下载的文件被用户从其他软件或文件管理器中删除，当尝试播放该.音乐的时应给出提示，音乐已被删除且自动刷新掉被删除的音乐

# 测试
````文件：````  
入口： 分享列表，正在下载，已下载，搜索文件，全局搜索  
场景：正常上传，秒传，正在下载，取消下载，重新下载，已下载，删除，打开，查看更多，push通知  
````音乐````  
入口：分享列表，正在下载，已下载，搜索分享音乐，搜索在线音乐（网易云，qq音乐，酷狗音乐和酷我音乐），全局搜索，收藏, 最近播放  
场景： 正常上传，秒传，正在下载，取消下载，重新下载，已下载，删除，收藏，播放，暂停，播放上一首，播放下一首，单曲播放，单曲循环，顺序播放，随机播放，查看更多，push通知  
其他：切出音乐页面可以自动播放下一首  
  
# 关于音乐
音乐页面的入口有：分享列表，收藏页面，正在下载，已下载，搜索共享音乐，搜索在线音乐(包含网易云，qq音乐,酷我音乐和酷狗音乐)，全局搜索(包含共享文件，共享音乐，网易云，qq音乐酷我音乐和酷狗音乐)  
为了标识每一首音乐，每一首音乐的filenameOriginal都不相同，共享音乐的filenameOriginal最初由上传文件时服务端生成（这里分为普通上传和秒传），字段格式为上传者名称加文件名加时间戳  
在线音乐filenameOriginal由客户端生成，字段格式为音乐名称加md5，因为存在秒传，所以共享音乐不能使用md5来生成filenameOriginal。  
不管是搜索，收藏,最近播放还是下载，实质上还是同一首音乐，为了区分，需要给filenameOriginal添加前缀。  
先说一下如果不加前缀会怎样，不加前缀则会存在两个相同的filenameOriginal，比如从共享列表下载了一首音乐，那么在共享列表点击播放这首音乐，在下载列表会显示这首音乐的播放进度  
共享列表的filenameOriginal不需要添加前缀，收藏列表添加saved_，下载列表正在下载添加downloading_,已下载添加downloaded_，搜索共享音乐添加searchMusic_，最近播放加recent_  
搜索在线音乐onlineMusic_，综合搜索searchAll_，这些带前缀的filenameOriginal可能存在耦合，比如下载收藏的音乐，前缀则变为downloaded_saved_。  
虽然这些音乐的filenameOriginal都不一样，但是在下载同一首歌的时候需要给出提示，比如在共享列表下载了一首歌，然后把这首歌添加收藏，然后在收藏列表又点击了下载，这时候应提示该文件正在下载，而不是再次下载这首歌。  
下载完成后会在indexedDB添加一条记录，indexedDB的filenameOriginal是带前缀的，但是保存到音乐文件的filenameOriginal是不带前缀的，删除音乐的时候要同时删除indexedDB的记录和本地保存的音乐文件，这里要注意filenameOriginal的转换  
