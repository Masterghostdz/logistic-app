package com.logigrine.espace;

import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		// Ensure the window background and WebView are transparent so native previews behind the WebView are visible
		try {
			getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
			if (getBridge() != null && getBridge().getWebView() != null) {
				getBridge().getWebView().setBackgroundColor(Color.TRANSPARENT);
			}
		} catch (Exception e) {
			// ignore if not available
			e.printStackTrace();
		}

		// Register our native plugin so web layer can request the native camera
		try {
			if (getBridge() != null) {
				getBridge().registerPlugin(com.logigrine.espace.NativeCameraPlugin.class);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
