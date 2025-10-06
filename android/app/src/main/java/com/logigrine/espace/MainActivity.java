package com.logigrine.espace;

import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.content.res.Configuration;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewGroup.MarginLayoutParams;
import android.view.Window;
import android.view.ViewGroup.LayoutParams;
import android.webkit.WebSettings;
import android.widget.FrameLayout;
import androidx.core.graphics.ColorUtils;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		// Ensure the window background and WebView are transparent so native previews behind the WebView are visible
		try {
			// Edge-to-edge: allow the app to draw behind the status and navigation bars so
			// CSS env(safe-area-inset-*) values can be used by the web layer.
			Window window = getWindow();
			try {
				WindowCompat.setDecorFitsSystemWindows(window, false);
				// Do not force status/navigation bar colors here; allow the system to choose
				// the default appearance so icons and colors adapt to OEM settings.
				// Allow swipe to reveal transient system bars
				WindowInsetsControllerCompat insetsController = new WindowInsetsControllerCompat(window, window.getDecorView());
				insetsController.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
			} catch (Exception ex) {
				// Ignore if the support library isn't available or on very old devices
				ex.printStackTrace();
			}
			getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
			if (getBridge() != null && getBridge().getWebView() != null) {
				android.webkit.WebView webView = getBridge().getWebView();
				webView.setBackgroundColor(Color.TRANSPARENT);

				// Ensure responsive layout: respect <meta name="viewport"> and avoid forced desktop scaling
				try {
					WebSettings ws = webView.getSettings();
					// Let the WebView apply the viewport meta tag
					ws.setUseWideViewPort(true);
					// Do not automatically zoom out to fit content — rely on CSS and viewport
					ws.setLoadWithOverviewMode(false);
					// Neutralize device font-scaling / accessibility text size so layout stays consistent
					// (some OEM WebViews scale text based on system font settings which expands card sizes)
					ws.setTextZoom(100);
					// Disable user zoom controls to keep layout stable (optional)
					ws.setSupportZoom(false);
					ws.setBuiltInZoomControls(false);
					ws.setDisplayZoomControls(false);
				} catch (Exception inner) {
					// Ignore if running on older WebView / API where some settings aren't available
					inner.printStackTrace();
				}
			}

		// Add a subtle bottom scrim so that system navigation icons remain visible
		// when the app draws edge-to-edge behind the navigation bar. The scrim
		// does not hide the navigation bar; it simply darkens/lightens the
		// content area underneath the bar to improve contrast.
		try {
			final ViewGroup content = (ViewGroup) getWindow().getDecorView().findViewById(android.R.id.content);
			if (content != null) {
				// Top scrim covering the status bar area (battery, wifi, clock)
				final View topScrim = new View(this);
				topScrim.setClickable(false);
				topScrim.setFocusable(false);
				topScrim.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO);

				// Bottom scrim (existing)
				final View scrim = new View(this);
				scrim.setClickable(false);
				scrim.setFocusable(false);
				scrim.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO);

				// Helper to convert dp to px
				final int extraDp = 2; // minimal extension to keep bottom scrim very thin (Chrome-like)
				final float scale = getResources().getDisplayMetrics().density;
				final int extraPx = (int) (extraDp * scale + 0.5f);

				// Initially measure nav bar height from system resource; we'll adjust on insets.
				int navBarHeight = 0;
				int resId = getResources().getIdentifier("navigation_bar_height", "dimen", "android");
				if (resId > 0) {
					navBarHeight = getResources().getDimensionPixelSize(resId);
				}

				FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(LayoutParams.MATCH_PARENT, navBarHeight + extraPx);
				params.gravity = Gravity.BOTTOM;
				scrim.setLayoutParams(params);

				// Top scrim: initial estimate using status bar resource
				int statusBarHeight = 0;
				int statusRes = getResources().getIdentifier("status_bar_height", "dimen", "android");
				if (statusRes > 0) {
					statusBarHeight = getResources().getDimensionPixelSize(statusRes);
				}
				final int extraTopDp = 0; // no extra extension: scrim height = status bar inset
				final int extraTopPx = (int) (extraTopDp * scale + 0.5f);
				FrameLayout.LayoutParams topParams = new FrameLayout.LayoutParams(LayoutParams.MATCH_PARENT, statusBarHeight + extraTopPx);
				topParams.gravity = Gravity.TOP;
				topScrim.setLayoutParams(topParams);

				// Decide scrim color based on current UI mode (dark/light).
				// Use a neutral semi-transparent black scrim so icons remain visible
				// across OEMs and themes (avoids white-on-white issues).
				boolean isDark = (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;
				int topColor;
				if (isDark) {
					// Dark mode: lighter black overlay
					topColor = ColorUtils.setAlphaComponent(Color.BLACK, 80); // ~31% opacity
				} else {
					// Light mode: slightly stronger darkening to improve contrast
					topColor = ColorUtils.setAlphaComponent(Color.BLACK, 120); // ~47% opacity
				}
				// Use a solid color scrim (no gradient) per request
				scrim.setBackgroundColor(topColor);
				// Top scrim use same neutral color to ensure status icons contrast
				topScrim.setBackgroundColor(topColor);

				// Add top scrim then bottom scrim on top of the WebView content but beneath system bars
				content.addView(topScrim);
				content.addView(scrim);

				// Update scrim height when window insets change (handles gesture-nav vs bar)
				ViewCompat.setOnApplyWindowInsetsListener(content, (v, insets) -> {
					WindowInsetsCompat compat = insets;
					int bottomInset = compat.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom;
					int topInset = compat.getInsets(WindowInsetsCompat.Type.statusBars()).top;
					int newBottomH = bottomInset + extraPx;
					int newTopH = topInset + extraTopPx;

					// Update bottom scrim height
					ViewGroup.LayoutParams lp = scrim.getLayoutParams();
					if (lp != null && lp.height != newBottomH) {
						lp.height = newBottomH;
						scrim.setLayoutParams(lp);
					}

					// Update top scrim height
					ViewGroup.LayoutParams tlp = topScrim.getLayoutParams();
					if (tlp != null && tlp.height != newTopH) {
						tlp.height = newTopH;
						topScrim.setLayoutParams(tlp);
					}

					// Ensure the WebView layout reserves the scrim heights so content isn't hidden
					try {
						android.webkit.WebView webView = null;
						if (getBridge() != null) webView = getBridge().getWebView();
						if (webView != null) {
							ViewGroup.LayoutParams wlp = webView.getLayoutParams();
							int parentH = content.getHeight();
							int desiredH = Math.max(0, parentH - newBottomH - newTopH);
							if (wlp instanceof MarginLayoutParams) {
								MarginLayoutParams mlp = (MarginLayoutParams) wlp;
								boolean changed = false;
								if (mlp.topMargin != newTopH) { mlp.topMargin = newTopH; changed = true; }
								if (mlp.height != desiredH) { mlp.height = desiredH; changed = true; }
								if (changed) webView.setLayoutParams(mlp);
							} else if (wlp != null) {
								// fallback: adjust height only
								if (wlp.height != desiredH) { wlp.height = desiredH; webView.setLayoutParams(wlp); }
							}
						}
					} catch (Exception exAdjust) {
						exAdjust.printStackTrace();
					}

					return insets;
				});
			}
		} catch (Exception e2) {
			// Don't crash if anything fails here
			e2.printStackTrace();
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
