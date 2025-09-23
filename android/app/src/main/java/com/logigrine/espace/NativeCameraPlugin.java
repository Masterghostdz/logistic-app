package com.logigrine.espace;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

public class NativeCameraPlugin extends Plugin {
    private static final int CAMERA_REQ = 5001;
    private static final String TAG = "NativeCameraPlugin";

    @PluginMethod
    public void startNativeCamera(PluginCall call) {
        Activity act = getActivity();
        if (act == null) {
            call.reject("No activity");
            return;
        }
        Intent intent = new Intent(act, CameraActivity.class);
        startActivityForResult(call, intent, CAMERA_REQ);
    }

    @Override
    protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        super.handleOnActivityResult(requestCode, resultCode, data);
        if (requestCode == CAMERA_REQ) {
            if (resultCode == Activity.RESULT_OK && data != null) {
                String base64 = data.getStringExtra("photo_base64");
                JSObject ret = new JSObject();
                ret.put("dataUrl", "data:image/jpeg;base64," + base64);
                notifyListeners("nativeCameraResult", ret);
            } else {
                notifyListeners("nativeCameraCancelled", new JSObject());
            }
        }
    }
}
