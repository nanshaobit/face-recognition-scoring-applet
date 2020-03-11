// pages/home/home.js
Page({

    /**
     * 页面的初始数据
     * KEY 和 SECRET 需要配置 **************************
     */
    data: {
        APP_KEY: "{{****此处修改为****}}",
        APP_SECRET: "{{****此处修改为****}}",
        token: "",
        height: 0,
        position: "back",
        src: "",
        userinfo: "",
        map: {
            gender: { male: "男性", female: "女性" },
            glasses: { none: "无眼镜", common: "普通眼镜", sun: "墨镜" },
            emotion: { angry: "愤怒", disgust: "厌恶", fear: "恐惧", happy: "高兴", sad: "伤心", surprise: "惊讶", neutral: "无表情", pouty: "撅嘴", grimace: "鬼脸" },
            expression: { none: "不笑", smile: "微笑", laugh: "大笑" }
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        const sysinfo = wx.getSystemInfoSync()
            // console.log(sysinfo)
        this.setData({
            height: sysinfo.screenHeight
        })
    },
    reverse() {
        this.setData({
            position: this.data.position === "back" ? "front" : "back"
        });
    },
    takePhoto() {
        var that = this;
        const ctx = wx.createCameraContext()
        ctx.takePhoto({
            quality: 'high',
            success: (res) => {
                this.setData({
                    src: res.tempImagePath
                }, () => {
                    that.getFaceInfo();
                })
            }
        })
    },
    choosePhoto() {
        var that = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['original'],
            sourceType: ['album'],
            success(res) {
                // console.log(res);
                if (res.errMsg === "chooseImage:ok" &&
                    res.tempFilePaths.length > 0) {
                    that.setData({
                        src: res.tempFilePaths[0]
                    }, () => {
                        that.getFaceInfo();
                    })
                }
            }
        })
    },
    reChoose() {
        this.setData({
            src: "",
            userinfo: "",
            token: ""
        })
    },

    getFaceInfo() {
        var that = this;
        wx.request({
            url: 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=' + that.data.APP_KEY + "&client_secret=" + that.data.APP_SECRET,
            success: (res) => {
                // console.log(res);
                that.setData({
                        token: res.data.access_token
                    },
                    () => {
                        that.submitRequest();
                    })
            }
        })
    },
    submitRequest() {
        var that = this;
        const parms = {
            image: "",
            image_type: "BASE64",
            face_field: "age,beauty,expression,gender,glasses,emotion"
        };
        const fileManager = wx.getFileSystemManager();
        fileManager.readFile({
            filePath: that.data.src,
            encoding: "base64",
            success: (res) => {
                // console.log(res);
                parms.image = res.data;
                wx.showLoading({
                    title: '正在识别。。。',
                });
                wx.request({
                    url: 'https://aip.baidubce.com/rest/2.0/face/v3/detect?access_token=' + that.data.token,
                    method: "POST",
                    header: {
                        "Content-Type": "application/json"
                    },
                    data: parms,
                    success: (res) => {
                        // console.log(res);
                        wx.hideLoading();
                        if (res.errMsg === "request:ok" && res.data.result !== null && res.data.result.face_num !== 0) {
                            that.setData({
                                userinfo: res.data.result.face_list[0]
                            })
                        }
                    },
                })
            }
        })
    }

})