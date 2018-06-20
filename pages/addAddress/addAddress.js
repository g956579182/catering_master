// directory.js
var address = require('../../utils/city.js');
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var bmap = require('../../utils/bmap-wx.js');
var wxMarkerData = []; 
var app = getApp();
var demo = new QQMapWX({
  key: 'WQABZ-FJSWX-PCG4N-ZXZDK-P4JH2-6RBTV' // 必填
});
// 新建百度地图对象 
var BMap = new bmap.BMapWX({
  ak: 'Ghdu7QqCCstDv8zi9oDlMOzbcPphYBIw'
});
Page({

  /**
   * 页面的初始数据
   * 当前    provinces:所有省份
   * citys选择省对应的所有市,
   * areas选择市对应的所有区
   * provinces：当前被选中的省
   * city当前被选中的市
   * areas当前被选中的区
   */
  data: {
    
    menuType: 0,
    begin: null,
    status: 1,
    end: null,
    isVisible: false,
    animationData: {},
    animationAddressMenu: {},
    addressMenuIsShow: false,
    value: [0, 0, 0],
    provinces: [],
    citys: [],
    areas: [],
    province: '',
    city: '',
    area: '',
    name:'',
    mobile:'',
    areaInfo:'请地图选点',
    isdefault:0,
    map_width: 380,
    map_height: 380,
    txaddress:'',
    id:0,
    latitude: '',
    longitude: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (option) {
    //add by change
    var that = this;
    
    //set the width and height

    
    if (option.id!=undefined) {
      this.data.id = option.id;
      let _this = this;
      let openid = wx.getStorageSync('openid');
      let shopid = wx.getStorageSync('shopid');
      wx.request({
        url: app.globalData.url + '/cy/address/detail',
        method:'post',
        data:{
          'openid':openid,
          'shopid':shopid,
          'id':option.id
        },
        success:function(res){
          if(res.data.errorCode==0){
            _this.setData({
              name:res.data.results.name,
              mobile:res.data.results.mobile,
              address:res.data.results.address,
              isdefault:res.data.results.isdefault,
              areaInfo:res.data.results.province+res.data.results.city+res.data.results.country,
              province:res.data.results.province,
              city:res.data.results.city,
              country:res.data.results.country,
              latitude: res.data.results.latitude,
              longitude: res.data.results.longitude
            })
          }
        }
      })
    }
  },

  //获得名字
  getName:function (e) {
    this.setData({
      name:e.detail.value
    })
  },
  //获得手机号
  getMobile:function (e) {
    this.setData({
      mobile:e.detail.value
    })
  },
  //获得地址
  getAddress:function (e) {
    // this.data.address = e.detail.value;
    this.setData({
      address:e.detail.value
    })
  },
  switchChange: function (e) {
    if (e.detail.value) {
      this.setData({ isdefault: 1 })
    } else {
      this.setData({ isdefault: 0 })
    }
  },
  saveAddress:function () {
    let openid = wx.getStorageSync('openid');
    let shopid = wx.getStorageSync('shopid');
    let arr = this.data.areaInfo.split(',')
    if (this.data.id>0) {
      let sendData = {
        shopid:shopid,
        openid:openid,
        name:this.data.name,
        mobile:this.data.mobile,
        address:this.data.address,
        country:this.data.country,
        isdefault:this.data.isdefault,
        id:this.data.id,
        latitude: this.data.latitude,
        longitude: this.data.longitude
      }
      wx.request({
        url: app.globalData.url+ '/cy/address/edit',
        method:'post',
        data:sendData,
        success:function(res){
          if (res.data.errorCode == 0) {
            wx.navigateBack()
          }else{
            wx.showToast({
              title: res.data.errorStr,
            })
          }
        }
      })
    }else {
      let sendData = {
        shopid:shopid,
        openid:openid,
        name:this.data.name,
        mobile:this.data.mobile,
        address:this.data.address,
        country:this.data.country,
        isdefault:this.data.isdefault,
        latitude: this.data.latitude,
        longitude: this.data.longitude
      }
      wx.request({
        url: app.globalData.url + '/cy/address/add',
        method:'post',
        data:sendData,
        success:function(res){
          if(res.data.errorCode==0){
            wx.navigateBack()
          }else{
            wx.showToast({
              title: res.data.errorStr,
            })
          }
        }
      })
    }

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

  
  //get locationInfo
  getLocationInfo: function (cb) {
    var that = this;
    if (this.data.locationInfo) {
      cb(this.data.locationInfo)
    } else {
      if (this.data.latitude != undefined && this.data.latitude != ''){
        cb({ latitude: this.data.latitude, longitude: this.data.longitude})
      }else{
        wx.getLocation({
          type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
          success: function (res) {
            that.data.locationInfo = res;
            cb(that.data.locationInfo)
          },
          fail: function () {
            // fail
          },
          complete: function () {
            // complete
          }
        })
      }
      
    }
  },
  /**
   * 腾讯地图坐标转位置名称
   */
  txtrans: function (latitude, longitude){
    var that = this;
    demo.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function (res) {
        var ad_info = res.result.ad_info;
        var address = res.result.formatted_addresses.recommend;
        var index = address.indexOf(ad_info.district);
        index = index + ad_info.district.length;
        var address = address.substring(index);
        that.setData({ areaInfo: ad_info.province  + ad_info.city + ad_info.district+address, province: ad_info.province, city: ad_info.city, country: ad_info.district+address});
      },
      fail: function (res) {
        that.showSearchInfo();
      }
    });
  },
  showSearchInfo: function () {
    var that = this;
    var that = this;

    var fail = function (data) {
      console.log(data)
    };
    var success = function (data) {
      var ad_info = data.originalData.result.addressComponent;
      that.setData({ areaInfo: ad_info.province + ad_info.city + ad_info.district + ad_info.street + ad_info.street_number, province: ad_info.province, city: ad_info.city, country: ad_info.district + ad_info.street + ad_info.street_number });
    }
    // 发起regeocoding检索请求 
    BMap.regeocoding({
      location: that.data.latitude + ',' + that.data.longitude,
      fail: fail,
      success: success
    }); 
  },
  choose:function(){
    var that = this;
    wx.chooseLocation({success:function(res){
      that.setData({ latitude: res.latitude, longitude: res.longitude});
      that.setData({areaInfo:res.address,country:res.address});
      // that.txtrans(res.latitude,res.longitude);
    }})
  },
})