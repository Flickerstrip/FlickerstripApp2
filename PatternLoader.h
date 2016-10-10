#import "RCTBridgeModule.h"
 
@interface PatternLoader : NSObject <RCTBridgeModule, NSURLConnectionDelegate> {
    NSMutableData * responseData; 

}

@end
