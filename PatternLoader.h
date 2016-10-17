#import "RCTBridgeModule.h"
 
@interface PatternLoader : NSObject <RCTBridgeModule, NSURLConnectionDelegate> { 
    NSMutableDictionary * connectionCallbacks;
}

@end
