// pages/withdrawals/withdrawals.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardno:'',
    mobile:'',
    acct_name:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.memberInfo();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 会员信息
   */
  memberInfo: function () {
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    var openid = wx.getStorageSync('openid');
    var that = this;
    wx.request({
      url: app.globalData.url + '/cy/member/center',
      method: 'post',
      data: {
        shopid: shopid,
        openid: openid
      },
      success: function (res) {
        if (res.data.errorCode == 0) {
          that.setData({ member: res.data.results });
        } else {
          wx.showToast({
            title: res.data.errorStr,
          })
        }
      }
    })
  },
  setAmount:function(event){
    var amount = event.detail.value;
    if(!isNaN(parseFloat(amount))&&parseFloat(amount)>0){
      this.setData({amount:amount});
    }
  },
  setMobile: function (event) {
    var mobile = event.detail.value;
    this.setData({ mobile: mobile });
  },
  setCardno: function (event) {
    var cardno = event.detail.value;
    this.setData({ cardno: cardno });
  },
  setAcctName: function (event) {
    var acct_name = event.detail.value;
    this.setData({ acct_name: acct_name });
  },
  /**
   * 提现
   */
  withdraw:function(){
    var amount = this.data.amount;
    var member = this.data.member;
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0 || parseFloat(amount)>member.benifit) {
      wx.showToast({
        title: '请输入正确的金额',
      })
      return false;
    }
    var cardno = this.data.cardno;
    var mobile = this.data.mobile;
    var acct_name= this.data.acct_name;
    if(cardno==''||mobile==''||acct_name==''){
      wx.showToast({
        title: '请填写必填项',
      })
      return false;
    }
    wx.showModal({
      title: '提示',
      content: '确认提现',
      success: function (sm) {
        if (sm.confirm) {
          var ext = wx.getExtConfigSync();
          var shopid = ext.shopid;
          var openid = wx.getStorageSync('openid');
          wx.request({
            url: app.globalData.url + '/cy/member/withdraw',
            method: 'post',
            data: {
              shopid: shopid,
              openid: openid,
              amount: amount,
              cardno:cardno,
              mobile:mobile,
              acct_name:acct_name
            },
            success: function (res) {
              if (res.data.errorCode == 0) {
                wx.navigateBack();
              } else {
                wx.showToast({
                  title: res.data.errorStr,
                })
              }
            }
          })
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    
  }
})