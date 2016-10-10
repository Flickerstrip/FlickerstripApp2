#import "PatternLoader.h"
 
@implementation PatternLoader
 
RCT_EXPORT_MODULE()
 
RCT_EXPORT_METHOD(upload:(NSString*)url:(NSArray*)data:(RCTResponseSenderBlock)callback) {
    NSMutableData* blob = [NSMutableData dataWithCapacity:[data count]];
    for (id object in data) {
        uint8_t byte = [object intValue];
        [blob appendBytes:(void*)&byte length:1];
    }
    
    // Make a request...
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:url]];
    
    unsigned long long postLength = blob.length;
    NSString *contentLength = [NSString stringWithFormat:@"%llu", postLength];
    [request addValue:contentLength forHTTPHeaderField:@"Content-Length"];
    
    // This should all look familiar...
    [request setHTTPMethod:@"POST"];
    [request setHTTPBody:blob];
    
    [[NSURLConnection alloc] initWithRequest:request delegate:self];
    
    callback(@[
        [NSNull null],
        blob,
        url
    ]);
}

RCT_EXPORT_METHOD(download:(NSString*)url:(RCTResponseSenderBlock)callback) {
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:url]];
    
    [request setHTTPMethod:@"GET"];
    
    NSHTTPURLResponse *response = nil;
    NSData *returnData = [NSURLConnection sendSynchronousRequest:request returningResponse:&response error:nil];
    NSLog(@"length: %d",[returnData length]);
    NSLog(@"bytes in hex: %@", [returnData description]);
    

    NSMutableArray *resArray = [NSMutableArray arrayWithCapacity:[returnData length]];
    const uint8_t *bytes = [returnData bytes];
    for (int i = 0; i < [returnData length]; i++) {
        uint8_t a = bytes[i];
        [resArray addObject:[NSNumber numberWithUnsignedInteger:a]];
    }

    
    NSString *myString = [[NSString alloc] initWithData:returnData encoding:NSUTF8StringEncoding];
    NSLog( @"data: %@" , myString ) ;
    
    callback(@[
        [NSNull null],
        resArray
    ]);
}

@end
