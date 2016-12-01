package com.hohmbody.flickerstrip;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;

import java.io.BufferedOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

public class PatternLoader extends ReactContextBaseJavaModule {
    public PatternLoader(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "PatternLoader";
    }

    @ReactMethod
    public void upload(String url, ReadableArray data, Callback cb) {
        byte[] bytes = new byte[data.size()];
        for (int i=0; i<data.size(); i++) {
            bytes[i] = (byte)data.getInt(i);
        }

        URL urlObject = null;
        HttpURLConnection client = null;
        try {
            urlObject = new URL(url);
            client = (HttpURLConnection)urlObject.openConnection();
            client.setRequestMethod("POST");
            client.setDoOutput(true);
            client.setFixedLengthStreamingMode(bytes.length);
            OutputStream outputPost = new BufferedOutputStream(client.getOutputStream());
            outputPost.write(bytes);
            outputPost.flush();
            outputPost.close();
            cb.invoke();
        } catch (MalformedURLException e) {
            Log.d("PatternLoader","invalid url",e);
        } catch (Exception e) {
            Log.d("PatternLoader","bad things",e);
        } finally {
            if (client != null) client.disconnect();
        }
    }

    @ReactMethod
    public void download(String url, Callback cb) {
        URL urlObject = null;
        HttpURLConnection client = null;
        try {
            urlObject = new URL(url);
            client = (HttpURLConnection)urlObject.openConnection();
            int contentLength = Integer.parseInt(client.getHeaderFields().get("content-Length").get(0));
            InputStream in = client.getInputStream();
            WritableArray arr = Arguments.createArray();
            for (int i=0; i<contentLength; i++) {
                int unsigned = in.read() & 0xff;
                arr.pushInt(unsigned);
            }
            cb.invoke(null,arr);
        } catch (MalformedURLException e) {
            Log.d("PatternLoader","invalid url",e);
        } catch (Exception e) {
            Log.d("PatternLoader","bad things",e);
        } finally {
            if (client != null) client.disconnect();
        }
    }
}
