#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <UIKit/UIKit.h>

@interface RCT_EXTERN_MODULE (LiveActivityModule, NSObject)

RCT_EXTERN_METHOD(startLiveActivity : (double)timestamp resolve : (
    RCTPromiseResolveBlock)resolve reject : (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stopLiveActivity : (RCTPromiseResolveBlock)
                      resolve reject : (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(enableProximitySensor : (RCTPromiseResolveBlock)
                      resolve reject : (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(disableProximitySensor : (RCTPromiseResolveBlock)
                      resolve reject : (RCTPromiseRejectBlock)reject)

@end
