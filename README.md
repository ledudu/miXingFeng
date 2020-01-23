# 觅星峰

# 简介
可签到,上传下载和打开文件,上传下载收藏和播放音乐  
可搜索上传的文件,也可搜索收藏和播放网易云,qq音乐和酷狗音乐  
上传文件和音乐具备秒传系统
可运行在h5和安卓,限于一些条件,没办法在ios真机上调试,理论上可适配ios安装包  

# 特别感谢
````网易云音乐api:````: [Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)  
````qq音乐api:````: [jsososo/QQMusicApi](https://github.com/jsososo/QQMusicApi)   

# 安装
如果没有baidumaplocation和jpush的key,请删除package.json和config.xml里相应的配置  
```shell
$ git clone https://github.com/zhoushoujian/miXingFeng.git  
$ npm install -g cordova@8.0.0  
$ cordova platform add android@7.1.4  
$ cordova platform add ios //如果不是mac,请不要运行这条命令  
$ cd view  
$ npm i  
```

# 技术栈
cordova, react, redux, webpack4, websocket, Push, antd-mobile, less, react-loadable

# 注意
推荐使用cordova8.0.0,cordova-android7.1.4,cordova-plugin-jcore1.3.1,jpush-phonegap-plugin3.7.3,否则cordova-plugin-android-permissions, cordova-plugin-background-mode和JPush可能不工作,甚至会影响整个app稳定性  

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

# 关于cordova
![cordova pic](https://github.com/zhoushoujian/miXingFeng/blob/master/docs/cordova.png)  

# 功能特性  
1. 注册登录  
2. 签到和查询签到记录  
3. 实时显示在线人数和成员签到情况  
4. 账号颜色区分账号注册来源  
5. 实时监听当前地址变化  
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
17. 成员上传文件和获取自己位置的状态栏push推送  
18. 本地日志记录
19. websocket心跳检测，断网重连和后台保活  
20. 在线升级  
21. 前端错误监控  
22. 音乐共享系统  
23. 音乐播放器: 单曲循环，顺序播放，结束后暂停，播放上一首，播放下一首  
24. 删除上传的音乐  
25. 收藏音乐  
26. 支持音乐锁屏或后台播放  
27. 在通知栏显示app更新通知  
27. 下载盒子  
28. 实时显示文件下载进度和完成状态  
29. 分享列表同步更新下载和收藏状态  
30. 秒传系统  
31. 艺术昵称墙  
32. 验证邮箱和忘记密码  
33. 支持搜索，播放和下载网易云，qq音乐和酷狗音乐  
34. 支持搜索共享文件和共享音乐  
35. 支持综合搜索  
36. 从服务端下载广告  

# 缩略图预览  
```` 大图参考 release-V1.png ````
![release pic](https://github.com/zhoushoujian/miXingFeng/blob/master/docs/thumb_release_v2.png)  
![release pic](https://github.com/zhoushoujian/miXingFeng/blob/master/docs/thumb_release_v1.png)  

# 更新:  
[changelog](https://github.com/zhoushoujian/miXingFeng/blob/master/CHANGELOG.MD)

# 前端架构师和nodejs后端架构师需要具备的能力
[文档](https://github.com/zhoushoujian/miXingFeng/blob/master/docs/constructor)

# 在Iphone模拟器上测试的部分功能
[视频](https://github.com/zhoushoujian/miXingFeng/blob/master/docs/iphone.mp4)

# 秒传系统的设计(群组方向)：

````总体思想：````  
如果服务器已存在待上传的文件，则把已存在的数据库里的记录复制一份并修改一下指向待上传的地方且用户上传的文件不能覆盖原有的文件  

````注意点：````  
服务器不得存在两个相同md5的文件.不管什么原因，服务器的文件不能被覆盖或删除  

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
入口： 分享列表，正在下载，已下载，搜索文件，综合搜索  
场景：正常上传，秒传，正在下载，已下载，删除，打开，查看更多，push通知  
````音乐````  
入口：分享列表，正在下载，已下载，搜索分享音乐，搜索在线音乐（网易云，qq音乐，酷狗音乐），综合搜索，收藏  
场景： 正常上传，秒传，正在下载，已下载，删除，收藏，播放，暂停，播放上一首，播放下一首，单曲播放，单曲循环，顺序播放，随机播放，查看更多，push通知  
其他：切出音乐页面可以自动播放下一首  
  
# 关于音乐
音乐页面的入口有：分享列表，收藏页面，正在下载，已下载，搜索共享音乐，搜索在线音乐(包含网易云，qq音乐和酷狗音乐)，综合搜索(包含共享文件，共享音乐，网易云，qq音乐和酷狗音乐)  
为了标识每一首音乐，每一首音乐的filenameOriginal都不相同，共享音乐的filenameOriginal最初由上传文件时服务端生成（这里分为普通上传和秒传），字段格式为上传者名称加文件名加时间戳  
在线音乐filenameOriginal由客户端生成，字段格式为音乐名称加md5，因为存在秒传，所以共享音乐不能使用md5来生成filenameOriginal。  
不管是搜索，收藏还是下载，实质上还是同一首音乐，为了区分被搜索(或收藏或下载的音乐)，需要给filenameOriginal添加前缀。  
先说一下如果不加前缀会怎样，不加前缀则会存在两个相同的filenameOriginal，比如从共享列表下载了一首音乐，那么在共享列表点击播放这首音乐，在下载列表会显示这首音乐的播放进度  
共享列表的filenameOriginal不需要添加前缀，收藏列表添加saved_，下载列表正在下载添加downloading_,已下载添加downloaded_，搜索共享音乐添加searchMusic_，  
搜索在线音乐onlineMusic_，综合搜索searchAll_，这些带前缀的filenameOriginal可能存在耦合，比如下载收藏的音乐，前缀则变为downloaded_saved_。  
虽然这些音乐的filenameOriginal都不一样，但是在下载同一首歌的时候需要给出提示，比如在共享列表下载了一首歌，然后把这首歌添加收藏，然后在收藏列表又点击了下载，这时候应提示该文件正在下载，而不是再次下载这首歌。  
下载完成后会在indexedDB添加一条记录，indexedDB的filenameOriginal是带前缀的，但是保存到音乐文件的filenameOriginal是不带前缀的，删除音乐的时候要同时删除indexedDB的记录和本地保存的音乐文件，这里要注意filenameOriginal的转换  
