// services/client.js

const constants = require('../data/constants.js')
const store = require('../data/store.js')
const ajax = require('../utils/ajax.js')
const game = require('game.js')
const mine = require('mine.js')

const client = {

  /*
    说明：客户端授权调起
  */
  authorize: function (callback) {

    //  重新登录
    var relogin = function(){

      wx.login({
        success: function (res) {
          
          ajax.postEx('/client/login.ashx', {
            code: res.code
          }, function (data) {
            
            data = data || {}
            store.client = data
            store.session3rd = data.session3rd

            wx.setStorageSync('session3rd', store.session3rd)

            callback(data);
          });
        },
        fail: function (res) {

          wx.showToast({
            icon: 'none',
            title: '登录失败'
          })
        }
      });
    }
    
    //  效验用户登录态
    if (store.session3rd) {
      
      wx.checkSession({
        success: function (res) {
          
          ajax.postEx('/client/token.ashx', {}, function (data) {

            data = data || {}
            store.client = data
            store.session3rd = data.session3rd
            
            wx.setStorageSync('session3rd', store.session3rd)

            callback(data);
          }, relogin);
        },
        fail: relogin
      });
    } else {
      relogin();
    }

    //  标记为已触发授权
    store.authorized = true;
  },

  /*
    说明：识别访问来源
  */
  setShareInfo: function(){

    //  绑定客户端关系
    var relate = function (encryptedData, iv){

      ajax.postEx('/client/relate.ashx', {
        fromClientId: store.fromClientId || 0,
        encryptedData: encryptedData || '',
        iv: iv || ''
      }, function (data) {

      });
    }

    //  获取来源信息
    if (store.fromClientId) {
      if (store.shareTicket) {
        wx.getShareInfo({
          shareTicket: store.shareTicket,
          success: function (res) {
            relate(res.encryptedData, res.iv);
          },
          fail: relate
        });
      } else {
        relate();
      }
    }
  },

  /*
    说明：分享回调
  */
  shareAppMessage: function (res, data, callback) {

    data = data || {};
    
    return {
      title: '来测一测你认识多少种恐龙，看你对恐龙了解多少',
      path: '/pages/index/index?scene=cid-' + (store.client.clientId || 0),
      success: function (_res) {
        
        ajax.postEx('/client/share.ashx', {
          shareFrom: res.from
        }, function (data) {

          callback(data);
        });
      },
      fail: function (res) {

        wx.showToast({
          icon: 'none',
          title: '邀请失败'
        })
      }
    }
  },

  /*
    说明：游戏接口
  */
  game: game,

  /*
    说明：个人中心接口
  */
  mine: mine
};

module.exports = client;