import url from '../../utils/url.js'
var app = getApp();
Page({
    data: {
        items: [],
        dfrom:'',
    },
    onLoad:function(option){
      var dfrom = option.dfrom;
      if(dfrom != undefined && dfrom == 'order'){
        this.setData({dfrom:dfrom});
      }
    },
    onShow: function () {
        this.getAddressList();
    },
    //获取地址列表
    getAddressList: function () {
        let _this = this;
        let openid = wx.getStorageSync('openid');
        let shopid = wx.getStorageSync('shopid');
        wx.request({
            url: app.globalData.url+url.addressList,
            method:'post',
            data:{
                'openid':openid,
                'shopid':shopid,
            },
            success:function(res){
                if(res.data.errorCode==0){
                    _this.setData({items:res.data.results.data})
                }
            }
        })
    },
    //设默认地址
    setDefaultAddress: function (e) {
      let openid = wx.getStorageSync('openid');
      let shopid = wx.getStorageSync('shopid');
      wx.request({
        url: app.globalData.url + url.addressDefault,
        method:'post',
        data:{
          'openid':openid,
          'shopid':shopid,
          'id':e.detail.value
        },
        success:function(res){
          if(res.data.errorCode==0){
            console.log('修改了')
          }
        }
      })
    },
    //删除地址
    delAddress: function (event) {
      let _this = this;
      let openid = wx.getStorageSync('openid');
      let shopid = wx.getStorageSync('shopid');
      wx.showModal({
        title: '提示',
        content: '确定要删除吗？',
        success: function(res) {
          if (res.confirm) {
            wx.request({
              url: app.globalData.url + url.addressDel,
              method:'post',
              data:{
                'openid':openid,
                'shopid':shopid,
                'id':event.currentTarget.dataset.id
              },
              success:function(res){
                if(res.data.errorCode==0){
                  _this.getAddressList();
                }
              }
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    },
    //编辑地址
    addressDetail: function (event) {
      wx.navigateTo({
        url: "/pages/addAddress/addAddress?id="+event.currentTarget.dataset.id
      })

    },
    seladdr: function(event){
      var id = event.currentTarget.dataset.id;
      wx.setStorageSync('addressid', id);
      wx.navigateBack();
    }
})
