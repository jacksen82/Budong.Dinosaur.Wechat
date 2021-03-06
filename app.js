//  app.js

const utils = require('utils/utils.js')
const constants = require('data/constants.js')
const store = require('data/store.js')
const client = require('services/client.js')

App ({

  /*
    说明：启动时发生
  */
  onLaunch: function(options){

    store.fromScene = options.scene || 0;
    store.session3rd = wx.getStorageSync('session3rd') || '';

    wx.showShareMenu({
      withShareTicket: true
    });
  },
  
  /*
    说明：打开时发生
  */
  onShow: function (options) {

    store.fromScene = options.scene || 0;
    store.fromClientId = utils.getScene(options.query || {}, 'cid') || 0;
    store.shareTicket = options.shareTicket;
    
    if (store.checkAuthorize()) {
      client.setShareInfo();
    } else {
      client.authorize(function () {

        client.setShareInfo();
      });
    }
  },
})