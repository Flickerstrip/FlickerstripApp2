#import "PatternLoader.h"

@implementation PatternLoader

RCT_EXPORT_MODULE()

-(id)init {
  connectionCallbacks = [[NSMutableDictionary alloc] init];
  return self;
}

RCT_EXPORT_METHOD(upload:(NSString*)url:(NSArray*)data:(RCTResponseSenderBlock)callback) {
    NSURLConnection * connection = [self uploadPatternTo:url withData:data];

    //NSLog(@"desc: %@",[connection description]);
    [connectionCallbacks setObject:callback  forKey:[connection description]];
}

- (NSData*)dataFromByteArray:(NSArray*)data {
  NSMutableData* blob = [NSMutableData dataWithCapacity:[data count]];
  for (id object in data) {
    uint8_t byte = [object intValue];
    [blob appendBytes:(void*)&byte length:1];
  }
  return blob;
}

- (NSURLConnection*)uploadPatternTo:(NSString*)url withData:(NSArray*)data {
    NSData* blob = [self dataFromByteArray:data];
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:url]];

    unsigned long long postLength = blob.length;
    NSString *contentLength = [NSString stringWithFormat:@"%llu", postLength];
    [request addValue:contentLength forHTTPHeaderField:@"Content-Length"];

    [request setHTTPMethod:@"POST"];
    [request setHTTPBody:blob];

    NSURLConnection * connection = [[NSURLConnection alloc] initWithRequest:request delegate:self startImmediately:NO];

    [connection scheduleInRunLoop:[NSRunLoop mainRunLoop] forMode:NSDefaultRunLoopMode];
    [connection start];

    return connection;
}

RCT_EXPORT_METHOD(download:(NSString*)url:(RCTResponseSenderBlock)callback) {
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:url] cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:20.0];

    [request setHTTPMethod:@"GET"];

    NSHTTPURLResponse *response = nil;
    NSData *returnData = [NSURLConnection sendSynchronousRequest:request returningResponse:&response error:nil];
    //NSLog(@"length: %lu",(unsigned long)[returnData length]);
    //NSLog(@"bytes in hex: %@", [returnData description]);

    NSMutableArray *resArray = [NSMutableArray arrayWithCapacity:[returnData length]];
    const uint8_t *bytes = [returnData bytes];
    for (int i = 0; i < [returnData length]; i++) {
        uint8_t a = bytes[i];
        [resArray addObject:[NSNumber numberWithUnsignedInteger:a]];
    }

    NSString *myString = [[NSString alloc] initWithData:returnData encoding:NSUTF8StringEncoding];
    //NSLog( @"data: %@" , myString ) ;

    callback(@[
        [NSNull null],
        resArray
    ]);
}

- (void)connection:(NSURLConnection*)connection didReceiveResponse:(NSURLResponse *)response {
  //NSLog(@"Did Receive Response %@", response);
}
- (void)connection:(NSURLConnection*)connection didReceiveData:(NSData*)data {
  //NSString* str = [[NSString alloc] initWithData:data encoding:NSASCIIStringEncoding];
  //NSLog(@"Did Receive Data %@", str);
}
- (void)connection:(NSURLConnection*)connection didFailWithError:(NSError*)error {
  //NSLog(@"Did Fail");
}
- (void)connection:(NSURLConnection *)connection didSendBodyData:(NSInteger)bytesWritten totalBytesWritten:(NSInteger)totalBytesWritten totalBytesExpectedToWrite:(NSInteger)totalBytesExpectedToWrite {
    //int percent = (totalBytesWritten / totalBytesExpectedToWrite) * 100.0;
    //NSLog(@"progress: %d",percent);
}
- (void)connectionDidFinishLoading:(NSURLConnection *)connection {
  //NSLog(@"Did Finish, calling callback");
  RCTResponseSenderBlock callback = [connectionCallbacks objectForKey:[connection description]];
  [connectionCallbacks removeObjectForKey:connection];
  //NSLog(@"Did Finish, calling callback2");
  callback(@[[NSNull null]]);
}

@end
