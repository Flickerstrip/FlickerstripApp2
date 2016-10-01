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
 
@end
